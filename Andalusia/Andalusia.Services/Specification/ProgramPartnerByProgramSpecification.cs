using Andalusia.Services.Specification;
using AndalusiaApp.Models;

namespace AndalusiaApp.Specifications;

public class ProgramPartnerByProgramSpecification : BaseSpecification<ProgramPartner>
{
    public ProgramPartnerByProgramSpecification(long programId)
        : base(pp => pp.ProgramId == programId)
    {
        AddInclude(pp => pp.Partner);
    }
}
