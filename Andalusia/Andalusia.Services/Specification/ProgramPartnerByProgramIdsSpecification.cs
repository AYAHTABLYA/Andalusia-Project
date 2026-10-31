
using AndalusiaApp.Models;

namespace Andalusia.Services.Specification;

public class ProgramPartnerByProgramIdsSpecification : BaseSpecification<ProgramPartner>
{
    public ProgramPartnerByProgramIdsSpecification(IReadOnlyCollection<long> programIds)
        : base(pp => programIds.Contains(pp.ProgramId))
    {
        AddInclude(pp => pp.Partner);
    }
}
