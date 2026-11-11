using Andalusia.Services.Specification;
using AndalusiaApp.Models;

namespace AndalusiaApp.Specifications;

public class ProgramCourseByProgramSpecification : BaseSpecification<ProgramCourse>
{
    public ProgramCourseByProgramSpecification(long programId)
        : base(pc => pc.ProgramId == programId)
    {
        AddInclude(pc => pc.Course);
        AddOrderBy(pc => pc.OrderIndex);
    }
}
