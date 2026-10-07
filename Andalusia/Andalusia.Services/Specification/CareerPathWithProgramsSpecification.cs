using Andalusia.Services.Specification;
using Andalusia.Shared.Dtos.CareerPathDtos;
using AndalusiaApp.Models;

namespace AndalusiaApp.Specifications;

public class CareerPathWithProgramsSpecification : BaseSpecification<CareerPath>
{
    public CareerPathWithProgramsSpecification(CareerPathQuery query)
        : base(cp =>
            (string.IsNullOrWhiteSpace(query.Search) ||
             cp.Title.Contains(query.Search.Trim()) ||
             cp.Overview.Contains(query.Search.Trim()) ||
             cp.RecommendedSkills.Contains(query.Search.Trim())) &&
            (string.IsNullOrWhiteSpace(query.Status) ||
             query.Status == "All" ||
             cp.Status == query.Status) &&
            (string.IsNullOrWhiteSpace(query.Domain) ||
             query.Domain == "All" ||
             cp.Programs.Any(p =>
                 p.Category.Name == query.Domain ||
                 p.Category.Slug == query.Domain)))
    {
        AddInclude(cp => cp.Programs);
        AddInclude(cp => cp.Programs.Select(p => p.Category));
        AddOrderBy(cp => cp.CareerPathId);

        var page = Math.Max(query.Page, 1);
        var pageSize = Math.Clamp(query.PageSize, 1, 50);
        ApplyPaging((page - 1) * pageSize, pageSize);
    }
}
