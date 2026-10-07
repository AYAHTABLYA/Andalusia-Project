using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Andalusia.Shared.Dtos.AuthDtos
{
    public record RegisterRequestDto(
     [Required, MaxLength(100)] string FirstName,
     [Required, MaxLength(100)] string LastName,
     [Required, EmailAddress, MaxLength(255)] string Email,
     [Required, Phone, MaxLength(20)] string MobileNumber,
     [Required, MinLength(8)] string Password,
     long? CampusId
 );
}
