using Andalusia.Services.Specification;
using Andalusia.Shared.Dtos.CareerPathDtos;
using AndalusiaApp.Models;

namespace AndalusiaApp.Specifications;

public class CareerPathCountSpecification : BaseSpecification<CareerPath>
{
    public CareerPathCountSpecification(CareerPathQuery query)
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
    }
}
