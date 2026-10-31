using Andalusia.Shared.Dtos.ProfileDtos;

namespace Andalusia.ServicesAbstraction;

public interface IProfileService
{
    Task<ProfileDto?> GetAsync(long userId, CancellationToken ct = default);
    Task<ProfileDto?> UpdateAsync(long userId, UpdateProfileDto dto, CancellationToken ct = default);
    /// <summary>false = user not found. Throws ArgumentException when the current password is wrong.</summary>
    Task<bool> ChangePasswordAsync(long userId, ChangePasswordDto dto, CancellationToken ct = default);
}
