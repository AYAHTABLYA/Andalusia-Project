using Andalusia.Domain.Contracts;
using Andalusia.ServicesAbstraction;
using Andalusia.Shared.Dtos.AuthDtos;
using AndalusiaApp.Models;
using System.Security.Cryptography;

namespace AndalusiaApp.Services;

public class AuthService(IUnitOfWork uow, ITokenService tokenService, IEmailService emailService) : IAuthService
{
    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto dto, CancellationToken ct = default)
    {
        var userRepo = uow.GetRepository<User>();

        // 1. التحقق من عدم وجود الإيميل مسبقاً
        var existingUsers = await userRepo.GetAllAsync(trackChanges: false);
        if (existingUsers.Any(u => u.Email.Equals(dto.Email.Trim(), StringComparison.OrdinalIgnoreCase)))
            throw new InvalidOperationException("Email is already registered.");

        // 2. تشفير الباسورد
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

        var newUser = new User
        {
            FirstName = dto.FirstName.Trim(),
            LastName = dto.LastName.Trim(),
            Email = dto.Email.Trim().ToLower(),
            MobileNumber = dto.MobileNumber.Trim(),
            PasswordHash = passwordHash,
            IsEmailVerified = false,
            CreatedAt = DateTime.UtcNow
        };

        await userRepo.AddAsync(newUser);
        await uow.SaveChangesAsync();

        // 3. إسناد دور الطالب الافتراضي (Learner)
        var roleRepo = uow.GetRepository<Role>();
        var roles = await roleRepo.GetAllAsync(trackChanges: false);
        var learnerRole = roles.FirstOrDefault(r => r.Name == "Learner") ?? roles.First();

        var userRoleRepo = uow.GetRepository<UserRole>();
        await userRoleRepo.AddAsync(new UserRole
        {
            UserId = newUser.UserId,
            RoleId = learnerRole.RoleId
        });

        // 4. توليد كود التحقق من الإيميل
        var tokenRepo = uow.GetRepository<EmailVerificationToken>();
        var verificationCode = GenerateOtp();
        await tokenRepo.AddAsync(new EmailVerificationToken
        {
            UserId = newUser.UserId,
            Token = HashOtp(verificationCode, newUser.UserId),
            ExpiresAt = DateTime.UtcNow.AddMinutes(5)
        });

        await uow.SaveChangesAsync();
        await emailService.SendOtpAsync(newUser.Email, newUser.FirstName, verificationCode, OtpPurpose.EmailVerification, ct);

        // Do not issue a JWT until the email address has been verified.
        return new AuthResponseDto(newUser.UserId, $"{newUser.FirstName} {newUser.LastName}".Trim(),
            newUser.Email, learnerRole.Name, string.Empty, DateTime.UtcNow);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto dto, CancellationToken ct = default)
    {
        var userRepo = uow.GetRepository<User>();
        var users = await userRepo.GetAllAsync(trackChanges: false);
        var user = users.FirstOrDefault(u => u.Email.Equals(dto.Email.Trim(), StringComparison.OrdinalIgnoreCase));

        if (user is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password.");
        if (!user.IsEmailVerified)
            throw new UnauthorizedAccessException("Please verify your email address before signing in.");

        // قراءة الـ Role
        var userRoleRepo = uow.GetRepository<UserRole>();
        var userRoles = await userRoleRepo.GetAllAsync(trackChanges: false);
        var roleId = userRoles.FirstOrDefault(ur => ur.UserId == user.UserId)?.RoleId;

        var roleName = "Learner";
        if (roleId.HasValue)
        {
            var roleRepo = uow.GetRepository<Role>();
            var role = await roleRepo.GetByIdAsync(roleId.Value);
            if (role != null) roleName = role.Name;
        }

        var (token, expires) = tokenService.GenerateToken(user, roleName);

        return new AuthResponseDto(
            user.UserId,
            $"{user.FirstName} {user.LastName}".Trim(),
            user.Email,
            roleName,
            token,
            expires
        );
    }

    public async Task<bool> ConfirmEmailAsync(ConfirmEmailDto dto, CancellationToken ct = default)
    {
        var userRepo = uow.GetRepository<User>();
        var users = await userRepo.GetAllAsync(trackChanges: true);
        var user = users.FirstOrDefault(u => u.Email.Equals(dto.Email.Trim(), StringComparison.OrdinalIgnoreCase));
        if (user is null) return false;

        var tokenRepo = uow.GetRepository<EmailVerificationToken>();
        var tokens = await tokenRepo.GetAllAsync(trackChanges: true);
        var validToken = tokens.FirstOrDefault(t => t.UserId == user.UserId &&
            t.Token == HashOtp(dto.Token, user.UserId) && t.VerifiedAt == null && t.ExpiresAt > DateTime.UtcNow);

        if (validToken is null) return false;

        user.IsEmailVerified = true;
        validToken!.VerifiedAt = DateTime.UtcNow;
        await uow.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ResendConfirmationEmailAsync(ResendConfirmationDto dto, CancellationToken ct = default)
    {
        var userRepo = uow.GetRepository<User>();
        var users = await userRepo.GetAllAsync(trackChanges: false);
        var user = users.FirstOrDefault(u => u.Email.Equals(dto.Email.Trim(), StringComparison.OrdinalIgnoreCase));
        if (user is null || user.IsEmailVerified) return false;

        var tokenRepo = uow.GetRepository<EmailVerificationToken>();
        var existingTokens = await tokenRepo.GetAllAsync(trackChanges: true);
        foreach (var oldToken in existingTokens.Where(t => t.UserId == user.UserId && t.VerifiedAt == null && t.ExpiresAt > DateTime.UtcNow))
            oldToken.VerifiedAt = DateTime.UtcNow;
        var code = GenerateOtp();
        await tokenRepo.AddAsync(new EmailVerificationToken
        {
            UserId = user.UserId,
            Token = HashOtp(code, user.UserId),
            ExpiresAt = DateTime.UtcNow.AddMinutes(5)
        });

        await uow.SaveChangesAsync();
        await emailService.SendOtpAsync(user.Email, user.FirstName, code, OtpPurpose.EmailVerification, ct);
        return true;
    }

    public async Task<bool> ForgotPasswordAsync(ForgotPasswordDto dto, CancellationToken ct = default)
    {
        var userRepo = uow.GetRepository<User>();
        var users = await userRepo.GetAllAsync(trackChanges: false);
        var user = users.FirstOrDefault(u => u.Email.Equals(dto.Email.Trim(), StringComparison.OrdinalIgnoreCase));
        if (user is null) return false;

        var resetRepo = uow.GetRepository<PasswordResetToken>();
        var previousResetTokens = await resetRepo.GetAllAsync(trackChanges: true);
        foreach (var oldToken in previousResetTokens.Where(t => t.UserId == user.UserId && t.UsedAt == null && t.ExpiresAt > DateTime.UtcNow && !t.Token.StartsWith("LOGIN:")))
            oldToken.UsedAt = DateTime.UtcNow;
        var resetCode = GenerateOtp();

        await resetRepo.AddAsync(new PasswordResetToken
        {
            UserId = user.UserId,
            Token = HashOtp(resetCode, user.UserId),
            ExpiresAt = DateTime.UtcNow.AddMinutes(10)
        });

        await uow.SaveChangesAsync();
        await emailService.SendOtpAsync(user.Email, user.FirstName, resetCode, OtpPurpose.PasswordReset, ct);
        return true;
    }

    public async Task<bool> ResetPasswordAsync(ResetPasswordDto dto, CancellationToken ct = default)
    {
        var userRepo = uow.GetRepository<User>();
        var users = await userRepo.GetAllAsync(trackChanges: true);
        var user = users.FirstOrDefault(u => u.Email.Equals(dto.Email.Trim(), StringComparison.OrdinalIgnoreCase));
        if (user is null) return false;

        var resetRepo = uow.GetRepository<PasswordResetToken>();
        var tokens = await resetRepo.GetAllAsync(trackChanges: true);
        var validToken = tokens.FirstOrDefault(t => t.UserId == user.UserId &&
            t.Token == HashOtp(dto.Token, user.UserId) && t.UsedAt == null && t.ExpiresAt > DateTime.UtcNow);

        if (validToken is null) return false;

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        validToken!.UsedAt = DateTime.UtcNow;
        await uow.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RequestLoginOtpAsync(string email, CancellationToken ct = default)
    {
        var users = await uow.GetRepository<User>().GetAllAsync(trackChanges: false);
        var user = users.FirstOrDefault(u => u.Email.Equals(email.Trim(), StringComparison.OrdinalIgnoreCase));
        if (user is null || !user.IsEmailVerified) return false;

        var loginTokenRepo = uow.GetRepository<PasswordResetToken>();
        var previousLoginTokens = await loginTokenRepo.GetAllAsync(trackChanges: true);
        foreach (var oldToken in previousLoginTokens.Where(t => t.UserId == user.UserId && t.Token.StartsWith("LOGIN:") && t.UsedAt == null && t.ExpiresAt > DateTime.UtcNow))
            oldToken.UsedAt = DateTime.UtcNow;
        var code = GenerateOtp();
        await loginTokenRepo.AddAsync(new PasswordResetToken
        {
            UserId = user.UserId,
            Token = "LOGIN:" + HashOtp(code, user.UserId),
            ExpiresAt = DateTime.UtcNow.AddMinutes(5)
        });
        await uow.SaveChangesAsync();
        await emailService.SendOtpAsync(user.Email, user.FirstName, code, OtpPurpose.Login, ct);
        return true;
    }

    public async Task<AuthResponseDto?> VerifyLoginOtpAsync(string email, string code, CancellationToken ct = default)
    {
        if (code.Length != 6 || !code.All(char.IsDigit)) return null;
        var users = await uow.GetRepository<User>().GetAllAsync(trackChanges: false);
        var user = users.FirstOrDefault(u => u.Email.Equals(email.Trim(), StringComparison.OrdinalIgnoreCase));
        if (user is null || !user.IsEmailVerified) return null;

        var tokens = await uow.GetRepository<PasswordResetToken>().GetAllAsync(trackChanges: true);
        var valid = tokens.FirstOrDefault(t => t.UserId == user.UserId &&
            t.Token == "LOGIN:" + HashOtp(code, user.UserId) && t.UsedAt == null && t.ExpiresAt > DateTime.UtcNow);
        if (valid is null) return null;
        valid.UsedAt = DateTime.UtcNow;
        await uow.SaveChangesAsync();

        var userRoles = await uow.GetRepository<UserRole>().GetAllAsync(trackChanges: false);
        var roleId = userRoles.FirstOrDefault(ur => ur.UserId == user.UserId)?.RoleId;
        var roleName = "Learner";
        if (roleId.HasValue)
        {
            var role = await uow.GetRepository<Role>().GetByIdAsync(roleId.Value);
            if (role is not null) roleName = role.Name;
        }
        var (jwt, expires) = tokenService.GenerateToken(user, roleName);
        return new AuthResponseDto(user.UserId, $"{user.FirstName} {user.LastName}".Trim(), user.Email, roleName, jwt, expires);
    }

    private static string GenerateOtp() => RandomNumberGenerator.GetInt32(0, 1_000_000).ToString("D6");
    private static string HashOtp(string code, long userId) =>
        Convert.ToHexString(SHA256.HashData(System.Text.Encoding.UTF8.GetBytes($"{userId}:{code.Trim()}")));

    public async Task<bool> IsEmailAvailableAsync(string email, CancellationToken ct = default)
    {
        var userRepo = uow.GetRepository<User>();
        var users = await userRepo.GetAllAsync(trackChanges: false);
        return !users.Any(u => u.Email.Equals(email.Trim(), StringComparison.OrdinalIgnoreCase));
    }

    public async Task<IReadOnlyList<CampusDto>> GetCampusesAsync(CancellationToken ct = default)
    {
        // بيانات الفروع الثابتة في الإسكندرية (أو يمكن جلبها من جدول إن كان مخصصاً)
        return await Task.FromResult(new List<CampusDto>
        {
            new(1, "Alexandria: Gleem Campus", "Gleem, Alexandria"),
            new(2, "Alexandria: Smouha Campus", "Smouha, Alexandria"),
            new(3, "Online / Virtual Campus", "Virtual Live Interactive")
        });
    }
}