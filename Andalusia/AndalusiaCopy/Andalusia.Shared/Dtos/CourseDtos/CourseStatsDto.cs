using System;
using System.Collections.Generic;
using System.Text;

namespace Andalusia.Shared.Dtos.CourseDtos
{
    public record CourseStatsDto(
    string Duration,
    string Level,
    string Accreditation,
    string CohortStart
);
}
