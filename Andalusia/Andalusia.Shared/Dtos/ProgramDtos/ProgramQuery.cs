namespace Andalusia.Shared.Dtos.ProgramDtos;

public record ProgramQuery(
    string? Search,
    string? Category,
    int Page = 1,
    int PageSize = 12,
    // default | title_asc | title_desc | price_asc | price_desc
    string? Sort = null
);
