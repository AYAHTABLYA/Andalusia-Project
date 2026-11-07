namespace Andalusia.Shared.Dtos.CareerPathDtos;

public record CareerPathCourseDto(
    long Id,
    string Slug,
    string Title,
    string Description,
    string Duration,
    int OrderIndex,
    string? Link
);
