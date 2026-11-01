using Andalusia.Shared.CommonResult;
using Andalusia.Shared.Dtos.AdminDtos;

namespace Andalusia.ServicesAbstraction;

public interface IRolePermissionAdminService
{
    Task<IReadOnlyList<PermissionDto>> GetPermissionsAsync(CancellationToken ct = default);
    Task<Result<RolePermissionsDto>> GetRolePermissionsAsync(int roleId, CancellationToken ct = default);
    Task<Result<RolePermissionsDto>> UpdateRolePermissionsAsync(int roleId, UpdateRolePermissionsDto dto, CancellationToken ct = default);
}
