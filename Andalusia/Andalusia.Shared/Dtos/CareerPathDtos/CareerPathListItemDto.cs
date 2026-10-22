namespace Andalusia.Shared.Dtos.CareerPathDtos;

public record CareerPathListItemDto(
    long Id,
    string Slug,
    string Title,
    string Roles,
    string Summary,
    string Duration,
    int? Credits,
    int DiplomasCount,
    int CoursesCount,
    decimal Tuition,
    string Currency,
    string Status,
    string Domain,
    string PathUrl
);
