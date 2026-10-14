using Andalusia.Domain.Enums;

namespace AndalusiaApp.Models
{
    public class Enrollment
    {
        public long EnrollmentId { get; set; }
        public long UserId { get; set; }
        public long? CourseId { get; set; }
        public long? ProgramId { get; set; }
        public long? ScheduleId { get; set; }
        public long? ApplicationId { get; set; }
        public EnrollmentStatus Status { get; set; } = EnrollmentStatus.Enrolled;
        public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;

        public User User { get; set; } = null!;
        public Course? Course { get; set; }
        public Program? Program { get; set; }
        public Schedule? Schedule { get; set; }
        public Application? Application { get; set; }
        public Progress? Progress { get; set; }
    }
}