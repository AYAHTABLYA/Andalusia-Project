
namespace AndalusiaApp.Models;

public class ProgramCourse
{
    public long ProgramId { get; set; }
    public long CourseId { get; set; }
    public int OrderIndex { get; set; }
    public Program Program { get; set; } = null!;
    public Course Course { get; set; } = null!;
}