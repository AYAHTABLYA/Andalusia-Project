using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Andalusia.Shared.Dtos.CourseDtos
{
    public record CreateApplicationDto(
     [MaxLength(120)] string? FullName,
     [EmailAddress, MaxLength(200)] string? Email,
     [Phone, MaxLength(30)] string? Phone,
     [MaxLength(2000)] string? Message
 );
}
