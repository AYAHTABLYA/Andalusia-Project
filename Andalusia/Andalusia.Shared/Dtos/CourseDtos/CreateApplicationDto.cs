using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Andalusia.Shared.Dtos.CourseDtos
{
    public record CreateApplicationDto(
     [property: MaxLength(120)] string? FullName,
     [property: EmailAddress, MaxLength(200)] string? Email,
     [property: Phone, MaxLength(30)] string? Phone,
     [property: MaxLength(2000)] string? Message
 );
}
