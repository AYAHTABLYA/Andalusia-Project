using Andalusia.Domain.Enums;

namespace AndalusiaApp.Models
{
    public class AssignmentSubmission
    {
        public long SubmissionId { get; set; }
        public long AssignmentId { get; set; }
        public long LearnerId { get; set; }
        public int AttemptNumber { get; set; } = 1;
        public string FileUrl { get; set; } = "";
        public AssignmentSubmissionStatus Status { get; set; } = AssignmentSubmissionStatus.Submitted;
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

        // Grading (set by staff via PUT /api/staff/submissions/{id}/grade). Score == null means not graded yet.
        public int? Score { get; set; }
        public string? Feedback { get; set; }
        public DateTime? GradedAt { get; set; }
        public long? GradedBy { get; set; }

        public Assignment Assignment { get; set; } = null!;
        public User Learner { get; set; } = null!;
    }
}