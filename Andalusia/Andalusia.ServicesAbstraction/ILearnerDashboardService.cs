using Andalusia.Shared.Dtos.LearnerDtos;

namespace Andalusia.ServicesAbstraction;

public interface ILearnerDashboardService
{
    Task<LearnerDashboardDto?> GetAsync(long userId, CancellationToken ct = default);
}
