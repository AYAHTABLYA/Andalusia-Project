using Andalusia.Services.Specification;
using AndalusiaApp.Models;

namespace AndalusiaApp.Specifications;

public class ProgramDetailsBySlugSpecification : BaseSpecification<Program>
{
    public ProgramDetailsBySlugSpecification(string slug)
        : base(p => p.Slug == slug)
    {
        AddInclude(p => p.Category);
        AddInclude(p => p.CareerPath!);
    }
}
