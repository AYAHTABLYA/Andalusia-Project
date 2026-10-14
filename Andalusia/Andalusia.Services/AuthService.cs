
using System.Security.Cryptography;
using System.Text;
using Andalusia.Domain.Contracts;
using Andalusia.Services.Specification;
using Andalusia.ServicesAbstraction;
using Andalusia.Shared.Dtos.AuthDtos;
using AndalusiaApp.Models;
using Microsoft.Extensions.Logging;

namespace AndalusiaApp.Services;

public class AuthService(
    IUnitOfWork uow,
    ITokenService tokenService,
    IEmailService emailService,
    ILogger<AuthService> logger) : IAuthService
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

        await userRepo.AddAsync(newUser);
        await uow.SaveChangesAsync();

        var roles = await uow.GetRepository<Role>()
            .GetAllAsync(trackChanges: false);

        var learnerRole = roles.FirstOrDefault(r => r.Name == "Learner")
            ?? roles.FirstOrDefault()
            ?? throw new InvalidOperationException("No roles are configured.");

        await uow.GetRepository<UserRole>().AddAsync(new UserRole
        {
            UserId = newUser.UserId,
            RoleId = learnerRole.RoleId
        });

        await uow.SaveChangesAsync();

        await IssueEmailOtpAsync(newUser, ct);

        return new RegisterResponseDto(
            newUser.UserId,
            newUser.Email,
            RequiresEmailConfirmation: true,
            Message: "Account created. We sent a 6-digit code to your email, please confirm it before logging in.");
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

        var roleName = await GetUserRoleNameAsync(user.UserId);
        var (token, expires) = tokenService.GenerateToken(user, roleName);

        return new AuthResponseDto(
            user.UserId,
            $"{user.FirstName} {user.LastName}".Trim(),
            user.Email,
            roleName,
            token,
            expires);
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
    private async Task IssueEmailOtpAsync(User user, CancellationToken ct)
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

        await SendSafelyAsync(
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

    private async Task SendSafelyAsync(
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
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Failed to send {Purpose} OTP to user {UserId}",
                purpose,
                user.UserId);
        }
    }

    private async Task<string> GetUserRoleNameAsync(long userId)
    {
        var userRoles = await uow.GetRepository<UserRole>()
            .GetAllAsync(trackChanges: false);

        var roleId = userRoles
            .FirstOrDefault(ur => ur.UserId == userId)?.RoleId;

        if (!roleId.HasValue)
            return "Learner";

        var role = await uow.GetRepository<Role>()
            .GetByIdAsync(roleId.Value);

        return role?.Name ?? "Learner";
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
