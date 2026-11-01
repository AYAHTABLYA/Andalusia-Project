namespace Andalusia.Shared.Dtos.CoordinatorDtos;

public sealed record EligibleLearnerDto(long Id, string Name, string Email);
public sealed record CoordinatorEnrollmentRequest(long ScheduleId, long LearnerId, string? Reason = null);
public sealed record CoordinatorEnrollmentDto(long EnrollmentId, long ScheduleId, long LearnerId, string Status, string PerformedByName, DateTime PerformedAt);
