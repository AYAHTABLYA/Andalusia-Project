using Andalusia.Services.Specification;
using AndalusiaApp.Models;

namespace AndalusiaApp.Specifications;

public class ProgramCourseByProgramIdsSpecification : BaseSpecification<ProgramCourse>
{
    public ProgramCourseByProgramIdsSpecification(IReadOnlyCollection<long> programIds)
        : base(pc => programIds.Contains(pc.ProgramId))
    {
        AddInclude(pc => pc.Course);
    }
}
