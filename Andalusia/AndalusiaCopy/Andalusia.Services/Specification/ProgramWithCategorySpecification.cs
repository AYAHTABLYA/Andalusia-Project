using Andalusia.Services.Specification;
using Andalusia.Shared.Dtos.ProgramDtos;
using AndalusiaApp.Models;

namespace AndalusiaApp.Specifications;

public class ProgramWithCategorySpecification : BaseSpecification<Program>
{
    public ProgramWithCategorySpecification(ProgramQuery query)
        : base(p =>
            (string.IsNullOrWhiteSpace(query.Search) ||
             p.Title.Contains(query.Search.Trim()) ||
             p.Overview.Contains(query.Search.Trim())) &&
            (string.IsNullOrWhiteSpace(query.Category) ||
             query.Category == "All" ||
             p.Category.Slug == query.Category ||
             p.Category.Name == query.Category))
    {
        AddInclude(p => p.Category);
        AddInclude(p => p.ProgramCourses);
        AddOrderBy(p => p.ProgramId);

        var page = Math.Max(query.Page, 1);
        var pageSize = Math.Clamp(query.PageSize, 1, 50);
        ApplyPaging((page - 1) * pageSize, pageSize);
    }
}
