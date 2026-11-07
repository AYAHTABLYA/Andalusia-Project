using Andalusia.Services.Specification;
using AndalusiaApp.Models;

namespace AndalusiaApp.Specifications;

public class CoursesByCareerPathSpecification : BaseSpecification<Course>
{
    public CoursesByCareerPathSpecification(long careerPathId)
        : base(c => c.CareerPathId == careerPathId)
    {
        AddOrderBy(c => c.CourseId);
    }
}
