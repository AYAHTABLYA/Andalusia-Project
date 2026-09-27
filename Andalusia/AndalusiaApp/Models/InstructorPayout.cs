
namespace AndalusiaApp.Models;

public class InstructorPayout
{
    public long PayoutId { get; set; }
    public long InstructorId { get; set; }
    public long? ScheduleId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "";
    public string Status { get; set; } = "Pending"; // Pending | Paid | Cancelled
    public string? Notes { get; set; }
    public long ProcessedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? PaidAt { get; set; }

    public Instructor Instructor { get; set; } = null!;
    public Schedule? Schedule { get; set; }
    public User ProcessedByUser { get; set; } = null!;
}