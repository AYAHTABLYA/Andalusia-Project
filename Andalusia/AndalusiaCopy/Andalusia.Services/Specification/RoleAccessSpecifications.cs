using System.Linq.Expressions;
using AndalusiaApp.Models;

namespace Andalusia.Services.Specification;

/// <summary>User -> role links (with the Role loaded) for a set of users.</summary>
public class UserRolesByUsersSpecification : BaseSpecification<UserRole>
{
    public UserRolesByUsersSpecification(IReadOnlyCollection<long> userIds)
        : base(ur => userIds.Contains(ur.UserId))
    {
        AddInclude(ur => ur.Role);
    }
}

/// <summary>Permissions granted to a role, looked up by role name.</summary>
public class RolePermissionsByRoleNameSpecification : BaseSpecification<RolePermission>
{
    public RolePermissionsByRoleNameSpecification(string roleName)
        : base(rp => rp.Role.Name == roleName)
    {
        AddInclude(rp => rp.Permission);
    }
}

/// <summary>Every role -> permission link with the Permission loaded (for the roles screen).</summary>
public class AllRolePermissionsSpecification : BaseSpecification<RolePermission>
{
    public AllRolePermissionsSpecification()
    {
        AddInclude(rp => rp.Permission);
    }
}

/// <summary>Admin users list: optional search (name/email) and role filter, newest first.</summary>
public class UsersAdminSpecification : BaseSpecification<User>
{
    public UsersAdminSpecification(string? search, string? role, int skip = 0, int take = 0, bool paginate = false)
        : base(BuildCriteria(search, role))
    {
        AddOrderByDescending(u => u.CreatedAt);
        if (paginate) ApplyPaging(skip, take);
    }

    private static Expression<Func<User, bool>> BuildCriteria(string? search, string? role)
    {
        var s = search?.Trim().ToLowerInvariant();
        var r = role?.Trim();

        return u =>
            (string.IsNullOrEmpty(s)
                || u.Email.Contains(s)
                || u.FirstName.Contains(s)
                || u.LastName.Contains(s)) &&
            (string.IsNullOrEmpty(r)
                || u.UserRoles.Any(ur => ur.Role.Name == r));
    }
}
