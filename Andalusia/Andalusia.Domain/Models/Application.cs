using Andalusia.Domain.Enums;

namespace AndalusiaApp.Models
{
    public class Application
    {
        public long ApplicationId { get; set; }
        public long UserId { get; set; }
        public long? CourseId { get; set; }
        public long? ProgramId { get; set; }
        public long? ScheduleId { get; set; }
        public ApplicationStatus Status { get; set; } = ApplicationStatus.Submitted;
        public DateTime SubmissionDate { get; set; } = DateTime.UtcNow;

        public User User { get; set; } = null!;
        public Course? Course { get; set; }
        public Program? Program { get; set; }
        public Schedule? Schedule { get; set; }
    }
}