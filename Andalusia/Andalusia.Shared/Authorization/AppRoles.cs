namespace Andalusia.Shared.Authorization;

/// <summary>Single source of truth for role names (must match the seeded ROLES table).</summary>
public static class AppRoles
{
    public const string Learner = "Learner";
    public const string Instructor = "Instructor";
    public const string Manager = "Manager";
    public const string Admin = "Admin";
    public const string ContentManager = "Content_Manager";

    /// <summary>Use inside [Authorize(Roles = AppRoles.AdminOrManager)].</summary>
    public const string AdminOrManager = Admin + "," + Manager;

    public static readonly IReadOnlyList<string> All =
        [Learner, Instructor, Manager, Admin, ContentManager];

    public static bool IsValid(string? role) =>
        !string.IsNullOrWhiteSpace(role) && All.Contains(role);
}
