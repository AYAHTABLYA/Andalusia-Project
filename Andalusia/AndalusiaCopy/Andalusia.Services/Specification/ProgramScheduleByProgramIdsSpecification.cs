using AndalusiaApp.Models;
namespace Andalusia.Services.Specification;

public class ProgramScheduleByProgramIdsSpecification : BaseSpecification<Schedule>
{
    public ProgramScheduleByProgramIdsSpecification(IReadOnlyCollection<long> programIds)
        : base(s => s.ProgramId.HasValue && programIds.Contains(s.ProgramId.Value))
    {
        AddOrderBy(s => s.StartDate);
    }
}
