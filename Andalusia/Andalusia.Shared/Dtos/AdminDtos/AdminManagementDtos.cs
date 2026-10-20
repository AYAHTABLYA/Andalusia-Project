using System.ComponentModel.DataAnnotations;

namespace Andalusia.Shared.Dtos.AdminDtos;

// ---------- Instructors ----------
public sealed record AdminInstructorDto(
    long Id, string FullName, string Email, string MobileNumber, string JobTitle, string AvatarUrl,
    bool IsActive, int SchedulesCount, DateTime CreatedAt);

public sealed record AdminInstructorDetailDto(
    long Id, string FirstName, string LastName, string FullName, string Email, string MobileNumber,
    string JobTitle, string Bio, string AvatarUrl, bool IsActive, int SchedulesCount, int PendingPayouts,
    DateTime CreatedAt);

public sealed record CreateInstructorDto(
    [Required, MaxLength(50)] string FirstName,
    [Required, MaxLength(50)] string LastName,
    [Required, EmailAddress, MaxLength(255)] string Email,
    [Required, Phone, MaxLength(20)] string MobileNumber,
    [Required, MinLength(8)] string TemporaryPassword,
    [MaxLength(100)] string? JobTitle,
    string? Bio,
    [MaxLength(500)] string? AvatarUrl);

/// <summary>Email is intentionally not editable here (it is the login identity).</summary>
public sealed record UpdateInstructorDto(
    [Required, MaxLength(50)] string FirstName,
    [Required, MaxLength(50)] string LastName,
    [Required, Phone, MaxLength(20)] string MobileNumber,
    [MaxLength(100)] string? JobTitle,
    string? Bio,
    [MaxLength(500)] string? AvatarUrl);

// ---------- Schedules ----------
public sealed record ScheduleInstructorDto(long InstructorId, string Name, string Email);

public sealed record AdminScheduleDto(
    long Id, long? CourseId, long? ProgramId, string Type, string Title, string BatchCode, string VenueName,
    string RoomNumber, DateOnly StartDate, DateOnly EndDate, int Capacity, int EnrolledCount, int SessionsCount,
    string Status, IReadOnlyList<ScheduleInstructorDto> Instructors);

/// <param name="CourseId">Exactly one of CourseId / ProgramId is required.</param>
/// <param name="Capacity">0 = unlimited.</param>
/// <param name="Status">Scheduled | Running | Completed | Cancelled (default Scheduled)</param>
public sealed record CreateScheduleDto(
    long? CourseId,
    long? ProgramId,
    [Required, MaxLength(50)] string BatchCode,
    [MaxLength(150)] string? VenueName,
    [MaxLength(50)] string? RoomNumber,
    DateOnly StartDate,
    DateOnly EndDate,
    [Range(0, 100000)] int Capacity,
    string? Status,
    IReadOnlyList<long>? InstructorIds);

/// <summary>The course/program of a schedule cannot be changed. InstructorIds = null leaves instructors untouched.</summary>
public sealed record UpdateScheduleDto(
    [Required, MaxLength(50)] string BatchCode,
    [MaxLength(150)] string? VenueName,
    [MaxLength(50)] string? RoomNumber,
    DateOnly StartDate,
    DateOnly EndDate,
    [Range(0, 100000)] int Capacity,
    string? Status,
    IReadOnlyList<long>? InstructorIds);

public sealed record SetScheduleInstructorsDto([Required] IReadOnlyList<long> InstructorIds);

// ---------- Payments ----------
public sealed record AdminPaymentDto(
    long Id, long UserId, string UserName, string UserEmail, long? ApplicationId, long? EnrollmentId,
    string? ItemTitle, decimal Amount, string Currency, string GatewayName, string TransactionRef,
    string Status, DateTime? PaidAt);

/// <param name="Status">Failed (from Initiated) or Refunded (from Success).</param>
public sealed record UpdatePaymentStatusDto([Required] string Status);

// ---------- Permissions ----------
public sealed record PermissionDto(int Id, string Code, string Description);

public sealed record RolePermissionsDto(int RoleId, string Role, IReadOnlyList<string> Permissions);

public sealed record UpdateRolePermissionsDto([Required] IReadOnlyList<string> Permissions);
