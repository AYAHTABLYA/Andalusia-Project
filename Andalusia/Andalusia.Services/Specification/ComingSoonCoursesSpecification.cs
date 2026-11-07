using Andalusia.Domain.Enums;
using Andalusia.Services.Specification;
using AndalusiaApp.Models;

namespace AndalusiaApp.Specifications;

/// <summary>Courses that have a scheduled cohort starting after <paramref name="today"/>.</summary>
public class ComingSoonCoursesSpecification : BaseSpecification<Course>
{
    public ComingSoonCoursesSpecification(DateOnly today)
        : base(c => c.Cohorts.Any(ch => ch.StartDate > today && ch.Status == ScheduleStatus.Scheduled))
    {
        AddInclude(c => c.Mentor);
        AddInclude(c => c.Cohorts);
        AddOrderBy(c => c.CourseId);
    }
}
