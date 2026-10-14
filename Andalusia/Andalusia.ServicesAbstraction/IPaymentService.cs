using Andalusia.Shared.Dtos.PaymentDtos;

namespace Andalusia.ServicesAbstraction;

public interface IPaymentService
{
    Task<IReadOnlyList<PaymentDto>> GetMyPaymentsAsync(long userId, CancellationToken ct = default);
    Task<PaymentDto?> GetMyPaymentAsync(long userId, long id, CancellationToken ct = default);
    /// <summary>null = application not found. Throws InvalidOperationException on business conflicts.</summary>
    Task<PaymentDto?> InitiateAsync(long userId, CreatePaymentDto dto, CancellationToken ct = default);
    /// <summary>null = payment not found. Throws InvalidOperationException on business conflicts.</summary>
    Task<PaymentDto?> ConfirmAsync(long userId, long paymentId, ConfirmPaymentDto dto, CancellationToken ct = default);
}
