namespace Andalusia.Shared.Dtos.ProgramDtos;

public record ProgramListItemDto(
    long Id,
    string Slug,
    string Title,
    string Category,
    string Duration,
    int CoursesCount,
    decimal Tuition,
    string Currency,
    string Accreditation,
    string? CohortDate,
    string Status,
    string Link
);
