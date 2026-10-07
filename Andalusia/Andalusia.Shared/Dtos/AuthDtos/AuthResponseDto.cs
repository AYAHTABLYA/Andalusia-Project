using System;
using System.Collections.Generic;
using System.Text;

namespace Andalusia.Shared.Dtos.AuthDtos
{
    public record AuthResponseDto(
     long UserId,
     string FullName,
     string Email,
     string Role,
     string Token,
     DateTime ExpiresAt
 );
}
