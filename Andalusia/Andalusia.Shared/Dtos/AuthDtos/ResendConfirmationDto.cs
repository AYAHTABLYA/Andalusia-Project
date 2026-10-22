using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Andalusia.Shared.Dtos.AuthDtos
{
    public record ResendConfirmationDto(
      [Required, EmailAddress] string Email
  );
}
