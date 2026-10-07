using Andalusia.Domain.Contracts;
using Andalusia.ServicesAbstraction;
using Andalusia.Shared.Dtos.AuthDtos;
using AndalusiaApp.Models;
using System.Security.Cryptography;

namespace AndalusiaApp.Services;

public class AuthService(IUnitOfWork uow, ITokenService tokenService) : IAuthService
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
        var verificationToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
        await tokenRepo.AddAsync(new EmailVerificationToken
        {
            UserId = newUser.UserId,
            Token = verificationToken,
            ExpiresAt = DateTime.UtcNow.AddHours(24)
        });

        await uow.SaveChangesAsync();

        // توليد JWT Token فوري
        var (token, expires) = tokenService.GenerateToken(newUser, learnerRole.Name);

        return new AuthResponseDto(
            newUser.UserId,
            $"{newUser.FirstName} {newUser.LastName}".Trim(),
            newUser.Email,
            learnerRole.Name,
            token,
            expires
        );
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto dto, CancellationToken ct = default)
    {
        var userRepo = uow.GetRepository<User>();
        var users = await userRepo.GetAllAsync(trackChanges: false);
        var user = users.FirstOrDefault(u => u.Email.Equals(dto.Email.Trim(), StringComparison.OrdinalIgnoreCase));

        if (user is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password.");

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
        var tokens = await tokenRepo.GetAllAsync(trackChanges: false);
        var validToken = tokens.FirstOrDefault(t => t.UserId == user.UserId && t.Token == dto.Token && t.ExpiresAt > DateTime.UtcNow);

        if (validToken is null) return false;

        user.IsEmailVerified = true;
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
        var token = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));

        await tokenRepo.AddAsync(new EmailVerificationToken
        {
            UserId = user.UserId,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddHours(24)
        });

        await uow.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ForgotPasswordAsync(ForgotPasswordDto dto, CancellationToken ct = default)
    {
        var userRepo = uow.GetRepository<User>();
        var users = await userRepo.GetAllAsync(trackChanges: false);
        var user = users.FirstOrDefault(u => u.Email.Equals(dto.Email.Trim(), StringComparison.OrdinalIgnoreCase));
        if (user is null) return false;

        var resetRepo = uow.GetRepository<PasswordResetToken>();
        var resetToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));

        await resetRepo.AddAsync(new PasswordResetToken
        {
            UserId = user.UserId,
            Token = resetToken,
            ExpiresAt = DateTime.UtcNow.AddHours(2)
        });

        await uow.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ResetPasswordAsync(ResetPasswordDto dto, CancellationToken ct = default)
    {
        var userRepo = uow.GetRepository<User>();
        var users = await userRepo.GetAllAsync(trackChanges: true);
        var user = users.FirstOrDefault(u => u.Email.Equals(dto.Email.Trim(), StringComparison.OrdinalIgnoreCase));
        if (user is null) return false;

        var resetRepo = uow.GetRepository<PasswordResetToken>();
        var tokens = await resetRepo.GetAllAsync(trackChanges: false);
        var validToken = tokens.FirstOrDefault(t => t.UserId == user.UserId && t.Token == dto.Token && t.ExpiresAt > DateTime.UtcNow);

        if (validToken is null) return false;

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await uow.SaveChangesAsync();
        return true;
    }

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