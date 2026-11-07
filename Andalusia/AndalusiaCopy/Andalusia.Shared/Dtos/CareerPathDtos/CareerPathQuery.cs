namespace Andalusia.Shared.Dtos.CareerPathDtos;

public record CareerPathQuery(
    string? Search,
    string? Domain,
    string? Status,
    int Page = 1,
    int PageSize = 12
);
