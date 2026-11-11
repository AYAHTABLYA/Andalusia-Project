using System.ComponentModel.DataAnnotations;

namespace Andalusia.Shared.Dtos.AuthDtos
{
    public record ResetPasswordDto(
        [Required, EmailAddress] string Email,
        [Required, StringLength(6, MinimumLength = 6)] string Otp,
        [Required, MinLength(8)] string NewPassword
    );
}
