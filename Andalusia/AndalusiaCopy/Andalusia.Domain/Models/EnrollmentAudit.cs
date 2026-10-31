namespace Andalusia.Domain.Models;

/// <summary>Immutable audit event for coordinator-controlled enrollment changes.</summary>
public sealed class EnrollmentAudit
{
    public long EnrollmentAuditId { get; set; }
    public long EnrollmentId { get; set; }
    public long ActorUserId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string PreviousStatus { get; set; } = string.Empty;
    public string NewStatus { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public DateTime PerformedAtUtc { get; set; }
}
