namespace AndalusiaApp.Models
{
    public class Progress
    {

        public long ProgressId { get; set; }
        public long EnrollmentId { get; set; }
        public int CompletedSessionsCount { get; set; }
        public int SubmittedAssignmentsCount { get; set; }
        public decimal ProgressPercentage { get; set; }
        public DateTime LastUpdatedAt { get; set; } = DateTime.UtcNow;
        public Enrollment Enrollment { get; set; } = null!;








    }
}
