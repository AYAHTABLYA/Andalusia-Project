namespace Andalusia.Shared.Dtos.CareerPathDtos;

public record CareerPathDetailDto(
    long Id,
    string Slug,
    string Title,
    string Roles,
    string Summary,
    string Status,
    string Domain,
    string Duration,
    int? Credits,
    decimal Tuition,
    string Currency,
    IReadOnlyList<CareerPathHighlightDto> Highlights,
    IReadOnlyList<string> Guarantees,
    IReadOnlyList<CareerPathProgramDto> Programs,
    string SyllabusUrl
);
