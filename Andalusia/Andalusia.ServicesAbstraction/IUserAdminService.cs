using Andalusia.Shared;
using Andalusia.Shared.Dtos.AdminDtos;

namespace Andalusia.ServicesAbstraction;

public interface IUserAdminService
{
    Task<PaginatedResult<AdminUserDto>> GetUsersAsync(string? search, string? role, int page, int pageSize, CancellationToken ct = default);

    /// <exception cref="InvalidOperationException">Email already used.</exception>
    /// <exception cref="ArgumentException">Unknown role.</exception>
    Task<AdminUserDto> CreateStaffUserAsync(CreateStaffUserDto dto, CancellationToken ct = default);

    /// <returns>null when the target user does not exist.</returns>
    Task<AdminUserDto?> ChangeRoleAsync(long actingUserId, long targetUserId, string role, CancellationToken ct = default);

    /// <returns>null when the target user does not exist.</returns>
    Task<AdminUserDto?> SetStatusAsync(long actingUserId, long targetUserId, bool isActive, CancellationToken ct = default);

    Task<IReadOnlyList<RoleDto>> GetRolesAsync(CancellationToken ct = default);
}
