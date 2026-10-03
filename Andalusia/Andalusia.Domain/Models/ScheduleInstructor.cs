namespace AndalusiaApp.Models;

public class ScheduleInstructor
{
    public long ScheduleId { get; set; }
    public long InstructorId { get; set; }
    public Schedule Schedule { get; set; } = null!;
    public Instructor Instructor { get; set; } = null!;
}