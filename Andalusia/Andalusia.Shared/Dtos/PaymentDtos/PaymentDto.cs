namespace Andalusia.Shared.Dtos.PaymentDtos
{
    public record PaymentDto(
        long Id,
        long? ApplicationId,
        long? EnrollmentId,
        string? ItemTitle,
        decimal Amount,
        string Currency,
        string GatewayName,
        string TransactionRef,
        string Status,
        DateTime? PaidAt);
}
