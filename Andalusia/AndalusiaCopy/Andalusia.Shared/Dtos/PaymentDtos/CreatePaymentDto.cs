using System.ComponentModel.DataAnnotations;

namespace Andalusia.Shared.Dtos.PaymentDtos
{
    public record CreatePaymentDto([Range(1, long.MaxValue)] long ApplicationId);
}
