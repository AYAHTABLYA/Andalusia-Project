namespace Andalusia.Shared.Dtos.ProgramDtos;

public record ProgramQuery(
    string? Search,
    string? Category,
    int Page = 1,
    int PageSize = 12
);
