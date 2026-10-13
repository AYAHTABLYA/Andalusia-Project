using System.ComponentModel.DataAnnotations;

namespace Andalusia.Shared.Dtos.AuthDtos
{
    public record ConfirmEmailDto(
        [Required, EmailAddress] string Email,
        [Required, StringLength(6, MinimumLength = 6)] string Otp
    );
}
