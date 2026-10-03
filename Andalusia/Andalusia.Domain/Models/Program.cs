using Andalusia.Domain.Enums;

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
    public ProgramStatus Status { get; set; } = ProgramStatus.Draft;

    public Category Category { get; set; } = null!;
    public CareerPath? CareerPath { get; set; }
    public ICollection<ProgramCourse> ProgramCourses { get; set; } = new List<ProgramCourse>();
    public ICollection<ProgramPartner> ProgramPartners { get; set; } = new List<ProgramPartner>();
}