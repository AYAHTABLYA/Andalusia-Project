namespace Andalusia.Shared.Dtos.PaymentDtos
{
    /// <summary>Simulation callback. Success=true completes the payment, false marks it Failed.</summary>
    public record ConfirmPaymentDto(bool Success = true);
}
