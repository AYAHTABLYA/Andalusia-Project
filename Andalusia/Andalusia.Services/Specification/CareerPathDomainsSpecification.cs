using Andalusia.Services.Specification;
using AndalusiaApp.Models;

namespace AndalusiaApp.Specifications;

public class CareerPathDomainsSpecification : BaseSpecification<CareerPath>
{
    public CareerPathDomainsSpecification()
    {
        AddInclude(cp => cp.Programs);
        AddInclude(cp => cp.Programs.Select(p => p.Category));
    }
}
