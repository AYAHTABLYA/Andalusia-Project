
namespace AndalusiaApp.Models;

public class Permission
{
    public int PermissionId { get; set; }
    public string Code { get; set; } = "";
    public string Description { get; set; } = "";
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}