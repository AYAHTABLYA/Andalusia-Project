namespace AndalusiaApp.Models
{
    public class Attendance
    {
        public long AttendanceId { get; set; }
        public long SessionId { get; set; }
        public long LearnerId { get; set; }
        public string Status { get; set; } = "Present"; // Present | Absent | Late | Excused
        public DateTime MarkedAt { get; set; } = DateTime.UtcNow;
        public Session Session { get; set; } = null!;
        public User Learner { get; set; } = null!;




    }
}
