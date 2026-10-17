using Andalusia.Domain.Enums;

namespace AndalusiaApp.Models
{
    public class CourseMaterial
    {
        public long MaterialId { get; set; }
        public long CourseId { get; set; }
        public long? ScheduleId { get; set; }
        public string Title { get; set; } = "";
        public string FileUrl { get; set; } = "";
        public CourseMaterialResourceType ResourceType { get; set; } = CourseMaterialResourceType.Document;
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

        public Course Course { get; set; } = null!;
        public Schedule? Schedule { get; set; }
    }
}