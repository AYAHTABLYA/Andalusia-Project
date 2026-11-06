using System.ComponentModel.DataAnnotations;

namespace Andalusia.Shared.Dtos.AdminDtos;

public record AdminUserDto(
    long UserId,
    string FullName,
    string Email,
    string MobileNumber,
    string Role,
    bool IsActive,
    bool IsEmailVerified,
    DateTime CreatedAt);

/// <summary>Admin creates staff accounts. Nobody can pick their own role during public registration.</summary>
public record CreateStaffUserDto(
    [Required, MaxLength(50)] string FirstName,
    [Required, MaxLength(50)] string LastName,
    [Required, EmailAddress, MaxLength(255)] string Email,
    [Required, Phone, MaxLength(20)] string MobileNumber,
    [Required, MinLength(8)] string TemporaryPassword,
    [Required] string Role);

public record ChangeUserRoleDto([Required] string Role);

public record SetUserStatusDto(bool IsActive);

public record RoleDto(int RoleId, string Name, IReadOnlyList<string> Permissions, int UsersCount);
