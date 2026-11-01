using Andalusia.Domain.Contracts;
using Andalusia.ServicesAbstraction;
using Andalusia.Shared.Dtos.ProfileDtos;
using AndalusiaApp.Models;
using AndalusiaApp.Specifications;

namespace Andalusia.Services;

public sealed class ProfileService(IUnitOfWork uow) : IProfileService
{
    public async Task<ProfileDto?> GetAsync(long userId, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();

        var user = await uow.GetRepository<User>().GetByIdAsync(userId);
        return user is null ? null : await BuildAsync(user);
    }

    public async Task<ProfileDto?> UpdateAsync(long userId, UpdateProfileDto dto, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();

        var user = await uow.GetRepository<User>().GetByIdAsync(userId);
        if (user is null) return null;

        var first = dto.FirstName.Trim();
        var last = dto.LastName.Trim();
        var mobile = dto.MobileNumber.Trim();

        if (first.Length == 0 || last.Length == 0 || mobile.Length == 0)
            throw new ArgumentException("First name, last name and mobile number are required.");

        user.FirstName = first;
        user.LastName = last;
        user.MobileNumber = mobile;
        if (dto.Country is not null) user.Country = dto.Country.Trim();
        if (dto.PreferredLanguage is not null) user.PreferredLanguage = dto.PreferredLanguage.Trim();

        await uow.SaveChangesAsync();
        return await BuildAsync(user);
    }

    public async Task<bool> ChangePasswordAsync(long userId, ChangePasswordDto dto, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();

        var user = await uow.GetRepository<User>().GetByIdAsync(userId);
        if (user is null) return false;

        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
            throw new ArgumentException("Current password is incorrect.");

        if (dto.CurrentPassword == dto.NewPassword)
            throw new ArgumentException("New password must be different from the current password.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await uow.SaveChangesAsync();
        return true;
    }

    private async Task<ProfileDto> BuildAsync(User user)
    {
        var roles = await uow.GetRepository<UserRole>()
            .GetAllAsync(new UserRolesByUserSpecification(user.UserId));
        var role = roles.Select(r => r.Role.Name).FirstOrDefault() ?? "Learner";

        return new ProfileDto(
            user.UserId, user.FirstName, user.LastName,
            $"{user.FirstName} {user.LastName}".Trim(),
            user.Email, user.MobileNumber, user.Country, user.PreferredLanguage,
            role, user.IsEmailVerified, user.CreatedAt);
    }
}
