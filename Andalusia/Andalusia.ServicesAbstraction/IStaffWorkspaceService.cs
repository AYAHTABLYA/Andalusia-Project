using Andalusia.Shared.Dtos.StaffDtos;

namespace Andalusia.ServicesAbstraction;

public interface IStaffWorkspaceService
{
    Task<StaffDashboardDto> GetDashboardAsync(long? instructorId, bool isAdmin, CancellationToken ct = default);
    Task<IReadOnlyList<StaffSessionDto>> GetScheduleAsync(long? instructorId, bool isAdmin, DateOnly? from, DateOnly? to, CancellationToken ct = default);
    Task<IReadOnlyList<StaffAssignmentDto>> GetAssignmentsAsync(long? instructorId, bool isAdmin, CancellationToken ct = default);
    Task<IReadOnlyList<StaffSubmissionDto>?> GetSubmissionsAsync(long assignmentId, long? instructorId, bool isAdmin, CancellationToken ct = default);
    Task<IReadOnlyList<StaffStudentDto>> GetStudentsAsync(long? instructorId, bool isAdmin, string? search, CancellationToken ct = default);
    Task<IReadOnlyList<StaffPayoutDto>> GetPayoutsAsync(long? instructorId, bool isAdmin, CancellationToken ct = default);
    Task<StaffPayoutDto?> UpdatePayoutStatusAsync(long payoutId, long actorId, string status, CancellationToken ct = default);
}
