namespace Andalusia.Shared.Dtos.StaffDtos;

public sealed record StaffDashboardDto(int TotalStudents, int TotalInstructors, int TotalCourses, int TotalSchedules, int UpcomingSessions, int PendingAssignments, int PendingPayouts);
public sealed record StaffSessionDto(long Id, string Title, DateOnly Date, TimeOnly StartTime, TimeOnly EndTime, string RoomDetails, long ScheduleId, string CourseTitle, string BatchCode);
public sealed record StaffAssignmentDto(long Id, string Title, string Description, DateTime DueDate, int MaxScore, long ScheduleId, string CourseTitle, int Submissions, DateTime? LatestSubmissionAt);
public sealed record StaffSubmissionDto(long Id, long LearnerId, string LearnerName, string Email, string FileUrl, string Status, DateTime SubmittedAt, int AttemptNumber, int? Score = null, string? Feedback = null, DateTime? GradedAt = null);
public sealed record StaffStudentDto(long Id, string Name, string Email, long EnrollmentId, string Status, DateTime EnrolledAt, long? ScheduleId, string CourseTitle);
public sealed record StaffPayoutDto(long Id, long InstructorId, string InstructorName, decimal Amount, string Currency, string Status, string? Notes, DateTime CreatedAt, DateTime? PaidAt, long? ScheduleId);
public sealed record UpdatePayoutStatusDto(string Status);
