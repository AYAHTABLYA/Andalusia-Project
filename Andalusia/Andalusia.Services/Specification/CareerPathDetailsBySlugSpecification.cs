using Andalusia.Services.Specification;
using AndalusiaApp.Models;

namespace AndalusiaApp.Specifications;

public class CareerPathDetailsBySlugSpecification : BaseSpecification<CareerPath>
{
    public CareerPathDetailsBySlugSpecification(string slug)
        : base(cp => cp.Slug == slug)
    {
        AddInclude(cp => cp.Programs);
        AddInclude(cp => cp.Programs.Select(p => p.Category));
    }
}
