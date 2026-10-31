using Andalusia.Services.Specification;
using AndalusiaApp.Models;

namespace AndalusiaApp.Specifications;

public sealed class AdminCoursesSpecification : BaseSpecification<Course>
{
    public AdminCoursesSpecification() : base()
    {
        AddInclude(c => c.Mentor);
        AddInclude(c => c.Program!);
        AddInclude(c => c.CareerPath!);
        AddOrderBy(c => c.CourseId);
    }

    public AdminCoursesSpecification(long id) : base(c => c.CourseId == id)
    {
        AddInclude(c => c.Mentor);
        AddInclude(c => c.Cohorts);
        AddInclude(c => c.Applications);
        AddInclude(c => c.ProgramCourses);
    }
}
