using Andalusia.Services.Specification;
using AndalusiaApp.Models;

namespace AndalusiaApp.Specifications;

public class CareerPathDomainsSpecification : BaseSpecification<CareerPath>
{
    public CareerPathDomainsSpecification()
    {
        AddInclude("Programs.Category");
    }
}
