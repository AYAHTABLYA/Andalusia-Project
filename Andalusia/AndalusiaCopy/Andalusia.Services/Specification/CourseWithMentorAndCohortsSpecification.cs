using Andalusia.Services.Specification;
using Andalusia.Shared.Dtos.CourseDtos;
using AndalusiaApp.Models;

namespace AndalusiaApp.Specifications;

public class CourseWithMentorAndCohortsSpecification : BaseSpecification<Course>
{
    public CourseWithMentorAndCohortsSpecification(CourseQuery query)
        : base(c =>
            (string.IsNullOrWhiteSpace(query.Search) || c.Title.Contains(query.Search.Trim()) || c.Mentor.Name.Contains(query.Search.Trim())) &&
            (string.IsNullOrWhiteSpace(query.Category) || query.Category == "All" || c.Category == query.Category))
    {
        AddInclude(c => c.Mentor);
        AddInclude(c => c.Cohorts);

        AddOrderBy(c => c.CourseId);

        var page = Math.Max(query.Page, 1);
        var pageSize = Math.Clamp(query.PageSize, 1, 50);
        ApplyPaging((page - 1) * pageSize, pageSize);
    }
}