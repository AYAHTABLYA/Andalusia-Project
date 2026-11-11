using System;
using System.Collections.Generic;
using System.Text;

namespace Andalusia.Shared.Dtos.CourseDtos
{
    public record CourseDetailDto(
    string Slug,
    string Title,
    string Description,
    string StatusLabel,
    CourseStatsDto Stats,
    List<LearningOutcomeDto> LearnItems,
    MentorDto Mentor,
    CourseEnrollDto Enroll,
    ProgramLinkDto? Program,
    CareerPathLinkDto? CareerPath
);
}
