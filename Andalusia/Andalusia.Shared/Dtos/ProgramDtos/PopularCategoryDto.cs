namespace Andalusia.Shared.Dtos.ProgramDtos;

public record PopularCategoryDto(
    long CategoryId,
    string Name,
    string Slug,
    bool IsTrending,
    int ProgramsCount
);
