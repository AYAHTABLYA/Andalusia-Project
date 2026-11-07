using System.ComponentModel.DataAnnotations;

namespace Andalusia.Shared.Dtos.CourseDtos;

public sealed record AdminCourseMentorDto(long Id, string Name, string Title);

public sealed record AdminCourseDto(
    long CourseId, string Slug, string Title, string Description, string Category,
    string DeliveryMode, string Hall, string DurationLabel, string Level, string Accreditation,
    decimal Tuition, string TuitionNote, bool IsFeatured, long MentorId, string MentorName,
    long? ProgramId, long? CareerPathId);

public class CreateAdminCourseDto
{
    [Required, StringLength(160, MinimumLength = 2)] public string Title { get; init; } = string.Empty;
    [Required, StringLength(4000, MinimumLength = 10)] public string Description { get; init; } = string.Empty;
    [Required, StringLength(100)] public string Category { get; init; } = string.Empty;
    [Required, StringLength(100)] public string DeliveryMode { get; init; } = "Offline (Alex Campus)";
    [Required, StringLength(160)] public string Hall { get; init; } = "Hall B-302, Alexandria Campus";
    [Required, StringLength(80)] public string DurationLabel { get; init; } = string.Empty;
    [Required, StringLength(80)] public string Level { get; init; } = "Executive Advanced";
    [Required, StringLength(160)] public string Accreditation { get; init; } = "Pearson & CPD";
    [Range(typeof(decimal), "0", "999999999")] public decimal Tuition { get; init; }
    [StringLength(500)] public string TuitionNote { get; init; } = string.Empty;
    public bool IsFeatured { get; init; }
    [Range(1, long.MaxValue)] public long MentorId { get; init; }
    [Range(1, long.MaxValue)] public long? ProgramId { get; init; }
    [Range(1, long.MaxValue)] public long? CareerPathId { get; init; }
}

public sealed class UpdateAdminCourseDto : CreateAdminCourseDto { }
