using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Andalusia.Shared.Dtos.AuthDtos
{
    public record ResetPasswordDto(
    [Required] string Token,
    [Required, EmailAddress] string Email,
    [Required, MinLength(8)] string NewPassword
);
}
