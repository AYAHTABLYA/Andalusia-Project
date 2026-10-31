namespace Andalusia.Shared.Dtos.LearnerDtos;

// ---------------------------------------------------------------- GET enrollments/{id}/course

public sealed record LearnerOutcomeDto(string Title, string Text);

public sealed record LearnerInstructorDto(long InstructorId, string Name, string JobTitle, string AvatarUrl);

public sealed record LearnerScheduleDto(
    long ScheduleId, string BatchCode, DateOnly StartDate, DateOnly EndDate, string Status,
    IReadOnlyList<LearnerInstructorDto> Instructors);

/// <summary>Where the course is delivered (course-level defaults + the batch's venue / room).</summary>
public sealed record LearnerLocationDto(string? DeliveryMode, string? Hall, string? VenueName, string? RoomNumber);

public sealed record LearnerEnrollmentCourseDto(
    long EnrollmentId, string Status, DateTime EnrolledAt,
    long? CourseId, string? Slug, string Title, string? Description, string? Category, string? Level,
    string? DurationLabel, string? Accreditation, string? SyllabusPath,
    string? MentorName, string? MentorTitle,
    IReadOnlyList<LearnerOutcomeDto> Outcomes,
    LearnerScheduleDto? Schedule,
    LearnerLocationDto Location);

// ---------------------------------------------------------------- GET enrollments/{id}/materials

/// <param name="ScheduleId">null = course-wide material, otherwise attached to the learner's own batch.</param>
public sealed record LearnerMaterialDto(
    long MaterialId, string Title, string FileUrl, string ResourceType, DateTime UploadedAt, long? ScheduleId);

// ---------------------------------------------------------------- GET enrollments/{id}/sessions

/// <param name="Attendance">Present | Late | Absent | Excused | NotMarked</param>
public sealed record LearnerSessionDto(
    long SessionId, string Title, DateOnly SessionDate, TimeOnly StartTime, TimeOnly EndTime, string RoomDetails,
    bool IsPast, string Attendance);

// ---------------------------------------------------------------- assignments

/// <param name="SubmissionStatus">NotSubmitted | Submitted | Late | Graded</param>
public sealed record LearnerAssignmentDto(
    long AssignmentId, string Title, string Description, DateTime DueDate, int MaxScore, bool IsOverdue,
    string SubmissionStatus, int AttemptsCount, DateTime? LastSubmittedAt, int? Score);

public sealed record LearnerSubmissionDto(
    long SubmissionId, int AttemptNumber, string FileUrl, string Status, DateTime SubmittedAt,
    int? Score, string? Feedback, DateTime? GradedAt);

/// <param name="CanSubmit">false once the latest attempt is graded or the enrollment is no longer open.</param>
/// <param name="Submissions">All of the learner's attempts, newest first.</param>
public sealed record LearnerAssignmentDetailDto(
    long AssignmentId, long EnrollmentId, string Title, string Description, DateTime DueDate, int MaxScore,
    bool IsOverdue, bool CanSubmit, IReadOnlyList<LearnerSubmissionDto> Submissions);

/// <summary>Body of POST /api/learner/assignments/{id}/submit.</summary>
/// <param name="FileUrl">Absolute http(s) URL, max 500 chars.</param>
public sealed record SubmitAssignmentDto(string FileUrl);

// ---------------------------------------------------------------- GET enrollments/{id}/attendance

public sealed record LearnerAttendanceRecordDto(
    long SessionId, string Title, DateOnly SessionDate, TimeOnly StartTime, TimeOnly EndTime, string Status);

/// <param name="AttendanceRate">(Present+Late) / (Present+Late+Absent) in percent; Excused and NotMarked are ignored.</param>
public sealed record LearnerAttendanceDto(
    int TotalSessions, int HeldSessions, int PresentCount, int LateCount, int AbsentCount, int ExcusedCount,
    decimal AttendanceRate, IReadOnlyList<LearnerAttendanceRecordDto> Records);
