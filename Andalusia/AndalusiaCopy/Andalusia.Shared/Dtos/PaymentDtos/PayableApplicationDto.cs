namespace Andalusia.Shared.Dtos.PaymentDtos
{
    /// <summary>
    /// An application the learner can still pay for (not rejected/cancelled, not paid, not enrolled yet).
    /// Amount is the real fee of the course / program; PendingPaymentId is set when a payment was
    /// already initiated and is waiting for the card step.
    /// </summary>
    public record PayableApplicationDto(
        long ApplicationId,
        string ApplicationStatus,
        string ItemType,
        string ItemTitle,
        decimal Amount,
        string Currency,
        DateTime SubmissionDate,
        long? ScheduleId,
        string? ScheduleLabel,
        DateOnly? StartDate,
        long? PendingPaymentId);
}
