namespace AndalusiaApp.Models;

public class Program
{
    public long ProgramId { get; set; }
    public long CategoryId { get; set; }
    public long? CareerPathId { get; set; }
    public string Title { get; set; } = "";
    public string Overview { get; set; } = "";
    public string Requirements { get; set; } = "";
    public string Structure { get; set; } = "";
    public string Duration { get; set; } = "";
    public decimal Price { get; set; }
    public string Status { get; set; } = "Draft"; // Draft | Active | Archived

    public Category Category { get; set; } = null!;
    public CareerPath? CareerPath { get; set; }
    public ICollection<ProgramCourse> ProgramCourses { get; set; } = new List<ProgramCourse>();
}