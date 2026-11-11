using Andalusia.Services.Specification;
using Andalusia.Shared.Dtos.CourseDtos;
using AndalusiaApp.Models;

namespace AndalusiaApp.Specifications;

public class CourseCountSpecification : BaseSpecification<Course>
{
    public CourseCountSpecification(CourseQuery query)
        : base(c =>
            (string.IsNullOrWhiteSpace(query.Search) || c.Title.Contains(query.Search.Trim()) || c.Mentor.Name.Contains(query.Search.Trim())) &&
            (string.IsNullOrWhiteSpace(query.Category) || query.Category == "All" || c.Category == query.Category))
    {
    }
}