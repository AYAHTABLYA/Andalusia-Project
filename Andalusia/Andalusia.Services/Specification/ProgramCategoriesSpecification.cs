using Andalusia.Services.Specification;
using AndalusiaApp.Models;

namespace AndalusiaApp.Specifications;

public class ProgramCategoriesSpecification : BaseSpecification<Program>
{
    public ProgramCategoriesSpecification()
        : base()
    {
        AddInclude(p => p.Category);
    }
}
