using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Andalusia.Shared.Dtos.AuthDtos
{
    public record LoginRequestDto(
    [Required, EmailAddress] string Email,
    [Required] string Password
);
}
