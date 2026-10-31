using Andalusia.Domain.Enums;

namespace AndalusiaApp.Models
{
    public class Attendance
    {
        public long AttendanceId { get; set; }
        public long SessionId { get; set; }
        public long LearnerId { get; set; }
        public AttendanceStatus Status { get; set; } = AttendanceStatus.Present;
        public DateTime MarkedAt { get; set; } = DateTime.UtcNow;

        public Session Session { get; set; } = null!;
        public User Learner { get; set; } = null!;
    }
}