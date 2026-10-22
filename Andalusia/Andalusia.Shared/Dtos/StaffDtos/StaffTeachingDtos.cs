using System.ComponentModel.DataAnnotations;

namespace Andalusia.Shared.Dtos.StaffDtos;

// ---------- Sessions ----------
public sealed record CreateSessionDto(
    long ScheduleId,
    [Required, MaxLength(200)] string Title,
    DateOnly Date,
    TimeOnly StartTime,
    TimeOnly EndTime,
    [MaxLength(100)] string? RoomDetails);

public sealed record UpdateSessionDto(
    [Required, MaxLength(200)] string Title,
    DateOnly Date,
    TimeOnly StartTime,
    TimeOnly EndTime,
    [MaxLength(100)] string? RoomDetails);

// ---------- Course materials ----------
/// <param name="CanEdit">True when the caller may edit/delete it (admins always; instructors only for their own schedules).</param>
public sealed record StaffMaterialDto(
    long Id, long CourseId, string CourseTitle, long? ScheduleId, string? BatchCode,
    string Title, string FileUrl, string ResourceType, DateTime UploadedAt, bool CanEdit);

/// <param name="ScheduleId">Null = course-wide material (admins only).</param>
/// <param name="ResourceType">Slide | Document | Reference_Link</param>
public sealed record CreateMaterialDto(
    long? ScheduleId,
    [Required, MaxLength(200)] string Title,
    [Required, MaxLength(500)] string FileUrl,
    [Required] string ResourceType);

public sealed record UpdateMaterialDto(
    [Required, MaxLength(200)] string Title,
    [Required, MaxLength(500)] string FileUrl,
    [Required] string ResourceType);

// ---------- Assignments & grading ----------
public sealed record CreateAssignmentDto(
    long ScheduleId,
    [Required, MaxLength(200)] string Title,
    string? Description,
    DateTime DueDate,
    [Range(1, 1000)] int MaxScore);

public sealed record UpdateAssignmentDto(
    [Required, MaxLength(200)] string Title,
    string? Description,
    DateTime DueDate,
    [Range(1, 1000)] int MaxScore);

public sealed record GradeSubmissionDto(
    [Range(0, 1000)] int Score,
    [MaxLength(2000)] string? Feedback);

// ---------- Attendance ----------
/// <param name="Status">Null when attendance has not been marked yet for this learner.</param>
public sealed record AttendanceRowDto(long LearnerId, string Name, string Email, string? Status, DateTime? MarkedAt);

public sealed record SessionAttendanceDto(
    long SessionId, string SessionTitle, DateOnly Date, long ScheduleId, string CourseTitle, string BatchCode,
    IReadOnlyList<AttendanceRowDto> Learners);

/// <param name="Status">Present | Absent | Late | Excused</param>
public sealed record AttendanceEntryDto(long LearnerId, [Required] string Status);

public sealed record SaveAttendanceDto([Required] IReadOnlyList<AttendanceEntryDto> Entries);

public sealed record AttendanceRecordDto(
    long Id, long SessionId, string SessionTitle, DateOnly SessionDate, long ScheduleId, string CourseTitle,
    long LearnerId, string LearnerName, string Status, DateTime MarkedAt);

// ---------- Student details & progress ----------
public sealed record StaffStudentEnrollmentDto(
    long EnrollmentId, string Status, DateTime EnrolledAt, long? CourseId, long? ProgramId, long? ScheduleId,
    string Title, string? BatchCode);

/// <param name="MobileNumber">Only returned to admins/managers.</param>
public sealed record StaffStudentDetailDto(
    long Id, string Name, string Email, string? MobileNumber, string Country, bool IsActive, DateTime JoinedAt,
    IReadOnlyList<StaffStudentEnrollmentDto> Enrollments);

/// <summary>
/// Progress is computed live from sessions, attendance, assignments and submissions.
/// AttendanceRate = (Present+Late) / (Present+Late+Absent) of the MARKED sessions (Excused is ignored), in percent.
/// OverallPercentage = mean of the available components (attendance rate, submitted/total assignments).
/// </summary>
public sealed record StudentProgressDto(
    long EnrollmentId, long? ScheduleId, string CourseTitle, string? BatchCode, string EnrollmentStatus,
    int TotalSessions, int HeldSessions, int PresentCount, int LateCount, int AbsentCount, int ExcusedCount,
    decimal AttendanceRate,
    int TotalAssignments, int SubmittedAssignments, int GradedAssignments, decimal? AverageScorePercent,
    decimal OverallPercentage);

public sealed record ScheduleLearnerProgressDto(long LearnerId, string Name, string Email, StudentProgressDto Progress);

public sealed record ScheduleProgressDto(
    long ScheduleId, string CourseTitle, string BatchCode, int TotalSessions, int HeldSessions, int TotalAssignments,
    IReadOnlyList<ScheduleLearnerProgressDto> Learners);
