namespace Andalusia.Shared.Dtos.CareerPathDtos;

public record CareerPathProgramDto(
    long Id,
    string Slug,
    string Title,
    string Duration,
    decimal Tuition,
    string Currency,
    int CoursesCount,
    string Description,
    int OrderIndex,
    IReadOnlyList<CareerPathCourseDto> Courses
);
