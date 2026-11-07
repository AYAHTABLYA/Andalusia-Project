using Andalusia.Services.Specification;
using AndalusiaApp.Models;

namespace AndalusiaApp.Specifications;

public class PopularCategoriesSpecification : BaseSpecification<Category>
{
    public PopularCategoriesSpecification()
        : base()
    {
        AddInclude(c => c.Programs);
    }
}
