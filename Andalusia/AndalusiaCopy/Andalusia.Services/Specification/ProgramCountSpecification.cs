using Andalusia.Services.Specification;
using Andalusia.Shared.Dtos.ProgramDtos;
using AndalusiaApp.Models;

namespace AndalusiaApp.Specifications;

public class ProgramCountSpecification : BaseSpecification<Program>
{
    public ProgramCountSpecification(ProgramQuery query)
        : base(p =>
            (string.IsNullOrWhiteSpace(query.Search) ||
             p.Title.Contains(query.Search.Trim()) ||
             p.Overview.Contains(query.Search.Trim())) &&
            (string.IsNullOrWhiteSpace(query.Category) ||
             query.Category == "All" ||
             p.Category.Slug == query.Category ||
             p.Category.Name == query.Category))
    {
    }
}
