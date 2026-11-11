using Andalusia.Services.Specification;
using AndalusiaApp.Models;

namespace AndalusiaApp.Specifications;

/// <summary>RELATED_COURSES rows whose source course is one of <paramref name="courseIds"/>, with the related course loaded.</summary>
public class RelatedCoursesByCourseIdsSpecification : BaseSpecification<RelatedCourse>
{
    public RelatedCoursesByCourseIdsSpecification(long[] courseIds)
        : base(rc => courseIds.Contains(rc.CourseId))
    {
        AddInclude(rc => rc.Related);
    }
}
