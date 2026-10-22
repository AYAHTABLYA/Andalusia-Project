using Andalusia.Services.Specification;
using AndalusiaApp.Models;

namespace AndalusiaApp.Specifications;

public class RelatedProgramsByProgramSpecification : BaseSpecification<RelatedProgram>
{
    public RelatedProgramsByProgramSpecification(long programId)
        : base(rp => rp.ProgramId == programId)
    {
        AddInclude(rp => rp.Related);
        AddInclude(rp => rp.Related.Category);
    }
}
