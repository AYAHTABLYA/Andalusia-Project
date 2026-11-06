using System;
using System.Collections.Generic;
using System.Text;

namespace Andalusia.Shared.Dtos.PortalDtos
{
    public sealed record EnrollmentDto(
     long Id,
     string Status,
     DateTime EnrolledAt,
     long? CourseId,
     string? CourseTitle,
     long? ProgramId,
     string? ProgramTitle,
     long? ScheduleId,
     long? ApplicationId);

}
