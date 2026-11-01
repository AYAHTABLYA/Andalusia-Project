using Andalusia.Services.Specification;
using AndalusiaApp.Models;

namespace AndalusiaApp.Specifications;

public class CourseDetailsBySlugSpecification : BaseSpecification<Course>
{
    public CourseDetailsBySlugSpecification(string slug)
        : base(c => c.Slug == slug)
    {
        AddInclude(c => c.Mentor);
        AddInclude(c => c.Program!);
        AddInclude(c => c.CareerPath!);
        AddInclude(c => c.LearningOutcomes);
        AddInclude(c => c.Bullets);
        AddInclude(c => c.Cohorts);
    }
}