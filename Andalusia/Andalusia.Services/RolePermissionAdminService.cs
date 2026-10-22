using Andalusia.Domain.Contracts;
using Andalusia.Services.Specification;
using Andalusia.ServicesAbstraction;
using Andalusia.Shared.Authorization;
using Andalusia.Shared.CommonResult;
using Andalusia.Shared.Dtos.AdminDtos;
using AndalusiaApp.Models;

namespace Andalusia.Services;

public sealed class RolePermissionAdminService(IUnitOfWork uow) : IRolePermissionAdminService
{
    public async Task<IReadOnlyList<PermissionDto>> GetPermissionsAsync(CancellationToken ct = default) =>
        (await uow.GetRepository<Permission>().GetAllAsync(new QuerySpecification<Permission>().OrderByAsc(p => p.Code)))
            .Select(p => new PermissionDto(p.PermissionId, p.Code, p.Description))
            .ToList();

    public async Task<Result<RolePermissionsDto>> GetRolePermissionsAsync(int roleId, CancellationToken ct = default)
    {
        var role = await uow.GetRepository<Role>().GetByIdAsync(roleId);
        if (role is null) return Result<RolePermissionsDto>.Fail(NotFound);
        return Result<RolePermissionsDto>.Ok(await BuildAsync(role));
    }

    /// <summary>
    /// Replaces the role's permission set. The Admin role must keep users.manage (otherwise nobody could edit
    /// roles again). Changes reach users on their next sign-in because permissions are baked into the JWT.
    /// </summary>
    public async Task<Result<RolePermissionsDto>> UpdateRolePermissionsAsync(int roleId, UpdateRolePermissionsDto dto, CancellationToken ct = default)
    {
        var role = await uow.GetRepository<Role>().GetByIdAsync(roleId);
        if (role is null) return Result<RolePermissionsDto>.Fail(NotFound);

        var codes = (dto.Permissions ?? []).Select(c => c?.Trim() ?? "").Where(c => c.Length > 0).Distinct().ToList();

        var all = (await uow.GetRepository<Permission>().GetAllAsync()).ToDictionary(p => p.Code);
        var unknown = codes.Where(c => !all.ContainsKey(c)).ToList();
        if (unknown.Count > 0)
            return Result<RolePermissionsDto>.Fail(Error.Validation("Role.Permissions", $"Unknown permission(s): {string.Join(", ", unknown)}."));

        if (role.Name == AppRoles.Admin && !codes.Contains(AppPermissions.UsersManage))
            return Result<RolePermissionsDto>.Fail(Error.Conflict("Role.AdminLockout",
                $"The Admin role must keep the '{AppPermissions.UsersManage}' permission."));

        var repo = uow.GetRepository<RolePermission>();
        var existing = (await repo.GetAllAsync(
            new QuerySpecification<RolePermission>(rp => rp.RoleId == roleId).Include(rp => rp.Permission), trackChanges: true)).ToList();

        var wanted = codes.Select(c => all[c].PermissionId).ToHashSet();
        foreach (var link in existing.Where(l => !wanted.Contains(l.PermissionId)))
            repo.Remove(link);

        var have = existing.Select(l => l.PermissionId).ToHashSet();
        foreach (var permissionId in wanted.Where(id => !have.Contains(id)))
            await repo.AddAsync(new RolePermission { RoleId = roleId, PermissionId = permissionId });

        await uow.SaveChangesAsync();
        return Result<RolePermissionsDto>.Ok(await BuildAsync(role));
    }

    private async Task<RolePermissionsDto> BuildAsync(Role role)
    {
        var links = await uow.GetRepository<RolePermission>().GetAllAsync(
            new QuerySpecification<RolePermission>(rp => rp.RoleId == role.RoleId).Include(rp => rp.Permission));
        return new RolePermissionsDto(role.RoleId, role.Name, links.Select(l => l.Permission.Code).OrderBy(c => c).ToList());
    }

    private static Error NotFound => Error.NotFound("Role.NotFound", "Role not found.");
}
