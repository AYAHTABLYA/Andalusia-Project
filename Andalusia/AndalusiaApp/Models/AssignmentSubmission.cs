namespace AndalusiaApp.Models
{
    public class AssignmentSubmission
    {

        public long SubmissionId { get; set; }
        public long AssignmentId { get; set; }
        public long LearnerId { get; set; }
        public int AttemptNumber { get; set; } = 1;
        public string FileUrl { get; set; } = "";
        public string Status { get; set; } = "Submitted"; // Submitted | Late
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
        public Assignment Assignment { get; set; } = null!;
        public User Learner { get; set; } = null!;








    }
}
