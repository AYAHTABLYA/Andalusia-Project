
using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using System.Text;
using Andalusia.Domain.Contracts;
using Andalusia.Services.Specification;
using Andalusia.ServicesAbstraction;
using Andalusia.Shared.Authorization;
using Andalusia.Shared.Dtos.AuthDtos;
using AndalusiaApp.Models;
using Microsoft.Extensions.Logging;

namespace AndalusiaApp.Services;

public class AuthService(
    IUnitOfWork uow,
    ITokenService tokenService,
    IEmailService emailService,
    ILogger<AuthService> logger,
    ITokenBlacklist blacklist) : IAuthService
{
    private static readonly TimeSpan OtpLifetime = TimeSpan.FromMinutes(10);
    private static readonly TimeSpan ResendCooldown = TimeSpan.FromSeconds(60);

    // Register: create an unverified account and send an email confirmation OTP.
    public async Task<RegisterResponseDto> RegisterAsync(
        RegisterRequestDto dto,
        CancellationToken ct = default)
    {
        var email = Normalize(dto.Email);
        var userRepo = uow.GetRepository<User>();

        if (await userRepo.GetAsync(new UserByEmailSpecification(email)) is not null)
            throw new InvalidOperationException("Email is already registered.");

        // Public registration can only ever create a Learner. Resolve it first so a
        // missing role never leaves an orphan account (and never falls back to another role).
        var learnerRole = (await uow.GetRepository<Role>().GetAllAsync(trackChanges: false))
            .FirstOrDefault(r => r.Name == AppRoles.Learner)
            ?? throw new InvalidOperationException("The Learner role is not configured.");

        var newUser = new User
        {
            FirstName = dto.FirstName.Trim(),
            LastName = dto.LastName.Trim(),
            Email = email,
            MobileNumber = dto.MobileNumber.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            IsEmailVerified = false,
            CreatedAt = DateTime.UtcNow
        };
        newUser.UserRoles.Add(new UserRole { RoleId = learnerRole.RoleId });

        await userRepo.AddAsync(newUser);
        await uow.SaveChangesAsync();

        var sent = await IssueEmailOtpAsync(newUser, ct);

        return new RegisterResponseDto(
            newUser.UserId,
            newUser.Email,
            RequiresEmailConfirmation: true,
            Message: sent
                ? "Account created. We sent a 6-digit code to your email, please confirm it before logging in."
                : "Account created, but we could not send the verification code. Please use \"Resend code\" in a moment.");
    }

    // Password login: the email must be verified before a JWT is issued.
    public async Task<AuthResponseDto> LoginAsync(
        LoginRequestDto dto,
        CancellationToken ct = default)
    {
        var user = await uow.GetRepository<User>()
            .GetAsync(new UserByEmailSpecification(Normalize(dto.Email)));

        if (user is null ||
            !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        if (!user.IsActive)
            throw new UnauthorizedAccessException("This account is disabled.");

        if (!user.IsEmailVerified)
        {
            // Send a fresh confirmation code so the user can confirm right away.
            try { await IssueEmailOtpAsync(user, ct); }
            catch (OtpCooldownException) { /* a code was sent recently, reuse it */ }

            throw new EmailNotConfirmedException(user.Email);
        }

        var (roleName, permissions) = await GetRoleAccessAsync(user.UserId);
        var (token, expires) = tokenService.GenerateToken(user, roleName, permissions);

        return new AuthResponseDto(
            user.UserId,
            $"{user.FirstName} {user.LastName}".Trim(),
            user.Email,
            roleName,
            token,
            expires,
            permissions);
    }

    // Confirm email using the purpose-bound OTP hash.
    public async Task<bool> ConfirmEmailAsync(
        ConfirmEmailDto dto,
        CancellationToken ct = default)
    {
        var user = await uow.GetRepository<User>()
            .GetAsync(
                new UserByEmailSpecification(Normalize(dto.Email)),
                trackChanges: true);

        if (user is null)
            return false;

        if (user.IsEmailVerified)
            return true;

        var hash = HashOtp(
            OtpPurpose.EmailConfirmation,
            user.UserId,
            dto.Otp.Trim());

        var tokenRepo = uow.GetRepository<EmailVerificationToken>();

        var token = await tokenRepo.GetAsync(
            new ValidEmailOtpSpecification(
                user.UserId,
                hash,
                DateTime.UtcNow),
            trackChanges: true);

        if (token is null)
            return false;

        token.VerifiedAt = DateTime.UtcNow;
        user.IsEmailVerified = true;

        await uow.SaveChangesAsync();
        return true;
    }

    // Resend email confirmation OTP.
    public async Task<bool> ResendConfirmationEmailAsync(
        ResendConfirmationDto dto,
        CancellationToken ct = default)
    {
        var user = await uow.GetRepository<User>()
            .GetAsync(new UserByEmailSpecification(Normalize(dto.Email)));

        if (user is null || user.IsEmailVerified)
            return false;

        await IssueEmailOtpAsync(user, ct);
        return true;
    }

    // Request a password reset OTP.
    public async Task<bool> ForgotPasswordAsync(
        ForgotPasswordDto dto,
        CancellationToken ct = default)
    {
        var user = await uow.GetRepository<User>()
            .GetAsync(new UserByEmailSpecification(Normalize(dto.Email)));

        if (user is null)
            return false;

        await IssueResetOtpAsync(user, ct);
        return true;
    }

    // Reset password using a valid, unused reset OTP.
    public async Task<bool> ResetPasswordAsync(
        ResetPasswordDto dto,
        CancellationToken ct = default)
    {
        var user = await uow.GetRepository<User>()
            .GetAsync(
                new UserByEmailSpecification(Normalize(dto.Email)),
                trackChanges: true);

        if (user is null)
            return false;

        var hash = HashOtp(
            OtpPurpose.PasswordReset,
            user.UserId,
            dto.Otp.Trim());

        var resetRepo = uow.GetRepository<PasswordResetToken>();

        var token = await resetRepo.GetAsync(
            new ValidResetOtpSpecification(
                user.UserId,
                hash,
                DateTime.UtcNow),
            trackChanges: true);

        if (token is null)
            return false;

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        token.UsedAt = DateTime.UtcNow;

        await uow.SaveChangesAsync();
        return true;
    }

    public async Task<bool> IsEmailAvailableAsync(
        string email,
        CancellationToken ct = default)
    {
        var user = await uow.GetRepository<User>()
            .GetAsync(new UserByEmailSpecification(Normalize(email)));

        return user is null;
    }

    public Task<IReadOnlyList<CampusDto>> GetCampusesAsync(
        CancellationToken ct = default)
    {
        IReadOnlyList<CampusDto> campuses = new List<CampusDto>
        {
            new(1, "Alexandria: Gleem Campus", "Gleem, Alexandria"),
            new(2, "Alexandria: Smouha Campus", "Smouha, Alexandria"),
            new(3, "Online / Virtual Campus", "Virtual Live Interactive")
        };

        return Task.FromResult(campuses);
    }

    // Create and send an email confirmation OTP.
    private async Task<bool> IssueEmailOtpAsync(User user, CancellationToken ct)
    {
        var repo = uow.GetRepository<EmailVerificationToken>();

        var existing = (await repo.GetAllAsync(
            new EmailOtpsByUserSpecification(user.UserId),
            trackChanges: true)).ToList();

        EnforceCooldown(existing
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => (DateTime?)t.CreatedAt)
            .FirstOrDefault());

        foreach (var oldToken in existing)
            repo.Remove(oldToken);

        var otp = GenerateOtp();

        await repo.AddAsync(new EmailVerificationToken
        {
            UserId = user.UserId,
            Token = HashOtp(
                OtpPurpose.EmailConfirmation,
                user.UserId,
                otp),
            ExpiresAt = DateTime.UtcNow.Add(OtpLifetime),
            CreatedAt = DateTime.UtcNow
        });

        await uow.SaveChangesAsync();

        return await SendSafelyAsync(
            user,
            otp,
            OtpPurpose.EmailConfirmation,
            ct);
    }

    // Create and send a password reset OTP.
    // LOGIN: tokens are deliberately excluded from reset-token cleanup.
    private async Task IssueResetOtpAsync(User user, CancellationToken ct)
    {
        var repo = uow.GetRepository<PasswordResetToken>();

        var allTokens = await repo.GetAllAsync(trackChanges: true);

        var existingResetTokens = allTokens
            .Where(t =>
                t.UserId == user.UserId &&
                !t.Token.StartsWith("LOGIN:", StringComparison.Ordinal))
            .ToList();

        EnforceCooldown(existingResetTokens
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => (DateTime?)t.CreatedAt)
            .FirstOrDefault());

        foreach (var oldToken in existingResetTokens)
            repo.Remove(oldToken);

        var otp = GenerateOtp();

        await repo.AddAsync(new PasswordResetToken
        {
            UserId = user.UserId,
            Token = HashOtp(
                OtpPurpose.PasswordReset,
                user.UserId,
                otp),
            ExpiresAt = DateTime.UtcNow.Add(OtpLifetime),
            CreatedAt = DateTime.UtcNow
        });

        await uow.SaveChangesAsync();

        await SendSafelyAsync(
            user,
            otp,
            OtpPurpose.PasswordReset,
            ct);
    }

    private static void EnforceCooldown(DateTime? lastCreatedAtUtc)
    {
        if (lastCreatedAtUtc is null)
            return;

        var elapsed = DateTime.UtcNow - lastCreatedAtUtc.Value;

        if (elapsed < ResendCooldown)
        {
            throw new OtpCooldownException(
                (int)Math.Ceiling(
                    (ResendCooldown - elapsed).TotalSeconds));
        }
    }

    private async Task<bool> SendSafelyAsync(
        User user,
        string otp,
        OtpPurpose purpose,
        CancellationToken ct)
    {
        try
        {
            await emailService.SendOtpAsync(
                user.Email,
                $"{user.FirstName} {user.LastName}".Trim(),
                otp,
                purpose,
                ct);
            return true;
        }
        catch (Exception ex)
        {
            // The reason is in ex (missing Brevo settings, bad SMTP login/key, unverified sender, blocked port 587...).
            logger.LogError(
                ex,
                "Failed to send {Purpose} OTP to user {UserId}: {Reason}",
                purpose,
                user.UserId,
                ex.Message);
            return false;
        }
    }

    // The user's role name plus the permissions that role grants (read fresh from the DB).
    private async Task<(string Role, IReadOnlyList<string> Permissions)> GetRoleAccessAsync(long userId)
    {
        var userRole = (await uow.GetRepository<UserRole>()
            .GetAllAsync(new UserRolesByUsersSpecification([userId])))
            .FirstOrDefault();

        var roleName = userRole?.Role.Name ?? AppRoles.Learner;

        var permissions = (await uow.GetRepository<RolePermission>()
            .GetAllAsync(new RolePermissionsByRoleNameSpecification(roleName)))
            .Select(rp => rp.Permission.Code)
            .OrderBy(code => code)
            .ToList();

        return (roleName, permissions);
    }

    // GET /api/auth/me
    public async Task<CurrentUserDto?> GetCurrentUserAsync(long userId, CancellationToken ct = default)
    {
        var user = await uow.GetRepository<User>().GetByIdAsync(userId);
        if (user is null || !user.IsActive)
            return null;

        var (roleName, permissions) = await GetRoleAccessAsync(userId);

        return new CurrentUserDto(
            user.UserId,
            $"{user.FirstName} {user.LastName}".Trim(),
            user.Email,
            roleName,
            user.IsEmailVerified,
            permissions);
    }

    // POST /api/auth/logout: revokes the token id (jti) until the token expires.
    public Task LogoutAsync(string accessToken, CancellationToken ct = default)
    {
        try
        {
            var jwt = new JwtSecurityTokenHandler().ReadJwtToken(accessToken);
            if (!string.IsNullOrEmpty(jwt.Id))
                blacklist.Revoke(jwt.Id, jwt.ValidTo);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Logout received an unreadable token.");
        }

        return Task.CompletedTask;
    }

    private static string Normalize(string email) =>
        email.Trim().ToLowerInvariant();

    private static string GenerateOtp() =>
        RandomNumberGenerator.GetInt32(0, 1_000_000).ToString("D6");

    // OTP hashes are bound to the user and purpose.
    private static string HashOtp(
        OtpPurpose purpose,
        long userId,
        string code) =>
        Convert.ToHexString(
            SHA256.HashData(
                Encoding.UTF8.GetBytes(
                    $"{purpose}:{userId}:{code.Trim()}")));
}
