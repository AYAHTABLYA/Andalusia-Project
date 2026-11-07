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
        switch (query.Sort?.Trim().ToLowerInvariant())
        {
            case "title_asc":
                AddOrderBy(p => p.Title);
                AddThenBy(p => p.ProgramId);
                break;
            case "title_desc":
                AddOrderByDescending(p => p.Title);
                AddThenBy(p => p.ProgramId);
                break;
            case "price_asc":
                AddOrderBy(p => p.Price);
                AddThenBy(p => p.ProgramId);
                break;
            case "price_desc":
                AddOrderByDescending(p => p.Price);
                AddThenBy(p => p.ProgramId);
                break;
            default:
                AddOrderBy(p => p.ProgramId);
                break;
        }

        var page = Math.Max(query.Page, 1);
        var pageSize = Math.Clamp(query.PageSize, 1, 50);
        ApplyPaging((page - 1) * pageSize, pageSize);
    }
}
