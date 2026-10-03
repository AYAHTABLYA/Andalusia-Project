using Andalusia.Domain.Enums;

namespace AndalusiaApp.Models;

public class Course
{
    public long CourseId { get; set; }
    public long CategoryId { get; set; }
    public string Title { get; set; } = "";
    public string ShortDescription { get; set; } = "";
    public string FullDescription { get; set; } = "";
    public string Objectives { get; set; } = "";
    public string Duration { get; set; } = "";
    public decimal Price { get; set; }
    public string Type { get; set; } = "Offline";
    public CourseStatus Status { get; set; } = CourseStatus.Draft;
    public string ImageUrl { get; set; } = "";

    public Category Category { get; set; } = null!;
    public ICollection<ProgramCourse> ProgramCourses { get; set; } = new List<ProgramCourse>();
    public ICollection<Testimonial> Testimonials { get; set; } = new List<Testimonial>();
}