
namespace AndalusiaApp.Models;

public class RelatedCourse
{
    public long CourseId { get; set; }
    public long RelatedCourseId { get; set; }
    public Course Course { get; set; } = null!;
    public Course Related { get; set; } = null!;
}