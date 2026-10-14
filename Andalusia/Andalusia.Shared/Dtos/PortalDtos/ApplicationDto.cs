using System;
using System.Collections.Generic;
using System.Text;

namespace Andalusia.Shared.Dtos.PortalDtos
{
    public sealed record ApplicationDto(
    long Id,
    string Status,
    DateTime SubmissionDate,
    long? CourseId,
    string? CourseTitle,
    long? ProgramId,
    string? ProgramTitle,
    long? ScheduleId);

}
