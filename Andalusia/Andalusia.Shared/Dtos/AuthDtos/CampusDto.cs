using System;
using System.Collections.Generic;
using System.Text;

namespace Andalusia.Shared.Dtos.AuthDtos
{
    public record CampusDto(
     long Id,
     string Name,
     string Location
 );
}
