using Andalusia.Shared.Dtos;
using Andalusia.Shared.Dtos.CoordinatorDtos;

namespace Andalusia.ServicesAbstraction;

public interface ICoordinatorEnrollmentService
{
    Task<IReadOnlyList<EligibleLearnerDto>> SearchEligibleLearnersAsync(string? search, long? scheduleId, CancellationToken ct = default);
    Task<CoordinatorEnrollmentDto> EnrollAsync(long actorId, CoordinatorEnrollmentRequest request, CancellationToken ct = default);
    Task<CoordinatorEnrollmentDto> CancelAsync(long actorId, long enrollmentId, string? reason, CancellationToken ct = default);
}
