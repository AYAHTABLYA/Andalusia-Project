using System;
using System.Collections.Generic;
using System.Text;

namespace Andalusia.Shared.Dtos.CourseDtos
{
    public record CourseEnrollDto(decimal Tuition, string Currency, string Note, List<string> Bullets);
}
