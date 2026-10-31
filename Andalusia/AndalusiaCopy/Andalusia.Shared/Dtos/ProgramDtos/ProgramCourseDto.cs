namespace Andalusia.Shared.Dtos.ProgramDtos;

public record ProgramCourseDto(
    long Id,
    string Slug,
    string Title,
    string Description,
    string Duration,
    int OrderIndex,
    string? Link
);
