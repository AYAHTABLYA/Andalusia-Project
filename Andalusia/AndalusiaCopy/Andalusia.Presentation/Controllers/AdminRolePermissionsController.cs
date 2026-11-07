using Andalusia.ServicesAbstraction;
using Andalusia.Shared.Authorization;
using Andalusia.Shared.Dtos.AdminDtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AndalusiaApp.Controllers;

/// <summary>Permission catalog and per-role permission editing. Enforced by users.manage, like /api/admin/roles.</summary>
[Authorize(Policy = AppPermissions.UsersManage)]
[Route("api/admin")]
public sealed class AdminRolePermissionsController(IRolePermissionAdminService svc) : StaffControllerBase
{
    // GET /api/admin/permissions
    [HttpGet("permissions")]
    public async Task<IActionResult> Permissions(CancellationToken ct)
        => Ok(await svc.GetPermissionsAsync(ct));

    // GET /api/admin/roles/{id}/permissions
    [HttpGet("roles/{id:int}/permissions")]
    public async Task<IActionResult> GetRolePermissions(int id, CancellationToken ct)
        => ToOk(await svc.GetRolePermissionsAsync(id, ct));

    // PUT /api/admin/roles/{id}/permissions   body: { "permissions": ["courses.manage", ...] }  (replaces the set)
    [HttpPut("roles/{id:int}/permissions")]
    public async Task<IActionResult> UpdateRolePermissions(int id, [FromBody] UpdateRolePermissionsDto dto, CancellationToken ct)
        => ToOk(await svc.UpdateRolePermissionsAsync(id, dto, ct));
}
