namespace AndalusiaApp.Models;

public class Instructor
{
    public long InstructorId { get; set; } // PK + FK -> Users
    public string Bio { get; set; } = "";
    public string JobTitle { get; set; } = "";
    public string AvatarUrl { get; set; } = "";
    public User User { get; set; } = null!;
    public ICollection<ScheduleInstructor> ScheduleInstructors { get; set; } = new List<ScheduleInstructor>();
    public ICollection<InstructorPayout> Payouts { get; set; } = new List<InstructorPayout>();
}