using static System.Collections.Specialized.BitVector32;
namespace AndalusiaApp.Models;

public class Schedule
{
    public long ScheduleId { get; set; }
    public long? CourseId { get; set; }
    public long? ProgramId { get; set; }
    public string BatchCode { get; set; } = "";
    public string VenueName { get; set; } = "";
    public string RoomNumber { get; set; } = "";
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public int Capacity { get; set; }
    public string Status { get; set; } = "Scheduled"; // Scheduled | Running | Completed | Cancelled

    public Course? Course { get; set; }
    public Program? Program { get; set; }
    public ICollection<ScheduleInstructor> ScheduleInstructors { get; set; } = new List<ScheduleInstructor>();
    public ICollection<Session> Sessions { get; set; } = new List<Session>();
}