using Andalusia.Services.Specification;
using AndalusiaApp.Models;

namespace AndalusiaApp.Specifications;

public class FeaturedCoursesSpecification : BaseSpecification<Course>
{
    public FeaturedCoursesSpecification(int take)
        : base(c => c.IsFeatured)
    {
        AddInclude(c => c.Mentor);
        AddInclude(c => c.Cohorts);

        AddOrderBy(c => c.CourseId);
        ApplyPaging(0, Math.Clamp(take, 1, 12));
    }
}