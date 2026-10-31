namespace Andalusia.Shared.Dtos.ProgramDtos;

public record ProgramDetailDto(
    long Id,
    string Slug,
    string Title,
    string Overview,
    string Requirements,
    string Structure,
    string Status,
    decimal Tuition,
    string Currency,
    string? TuitionNote,
    ProgramStatsDto Stats,
    CategoryDto Category,
    CareerPathLinkDto? CareerPath,
    IReadOnlyList<ProgramCourseDto> Courses,
    IReadOnlyList<ProgramPartnerDto> Partners,
    IReadOnlyList<ProgramBenefitDto> Benefits,
    IReadOnlyList<ProgramListItemDto> RelatedPrograms,
    bool SyllabusAvailable,
    string SyllabusUrl
);
