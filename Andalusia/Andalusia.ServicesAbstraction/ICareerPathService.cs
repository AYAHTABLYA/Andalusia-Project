using Andalusia.Shared;
using Andalusia.Shared.Dtos.CareerPathDtos;

namespace AndalusiaApp.Services;

public interface ICareerPathService
{
    Task<PaginatedResult<CareerPathListItemDto>> GetAllAsync(CareerPathQuery query, CancellationToken ct = default);
    Task<string[]> GetStatusesAsync(CancellationToken ct = default);
    Task<string[]> GetDomainsAsync(CancellationToken ct = default);
    Task<CareerPathDetailDto?> GetBySlugAsync(string slug, CancellationToken ct = default);
    Task<(byte[] Bytes, string ContentType, string FileName)?> GetSyllabusAsync(string slug, CancellationToken ct = default);
}
