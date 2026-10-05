using Andalusia.Domain.Enums;
using Andalusia.Domain.Models;

namespace AndalusiaApp.Models;

public class Course
{
    public long CourseId { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string DeliveryMode { get; set; } = "Offline (Alex Campus)";
    public string Hall { get; set; } = "Hall B-302, Alexandria Campus";
    public string DurationLabel { get; set; } = string.Empty;
    public string Level { get; set; } = "Executive Advanced";
    public string Accreditation { get; set; } = "Pearson & CPD";
    public decimal Tuition { get; set; }
    public string TuitionNote { get; set; } = string.Empty;
    public bool IsFeatured { get; set; }
    public string? SyllabusPath { get; set; }

    public long MentorId { get; set; }
    public Mentor Mentor { get; set; } = null!;

    public long? ProgramId { get; set; }
    public Program? Program { get; set; }

    public long? CareerPathId { get; set; }
    public CareerPath? CareerPath { get; set; }

    public ICollection<CourseCohort> Cohorts { get; set; } = new List<CourseCohort>();
    public ICollection<LearningOutcome> LearningOutcomes { get; set; } = new List<LearningOutcome>();
    public ICollection<CourseBullet> Bullets { get; set; } = new List<CourseBullet>();
    public ICollection<CourseApplication> Applications { get; set; } = new List<CourseApplication>();
}