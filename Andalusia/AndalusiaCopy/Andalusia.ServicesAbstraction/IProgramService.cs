using Andalusia.Shared;
using Andalusia.Shared.Dtos.ProgramDtos;

namespace AndalusiaApp.Services;

public interface IProgramService
{
    Task<PaginatedResult<ProgramListItemDto>> GetAllAsync(ProgramQuery query, CancellationToken ct = default);
    Task<IReadOnlyList<CategoryDto>> GetCategoriesAsync(CancellationToken ct = default);
    Task<ProgramDetailDto?> GetBySlugAsync(string slug, CancellationToken ct = default);
    Task<long?> ApplyAsync(string slug, long userId, ApplyToProgramRequest? request, CancellationToken ct = default);
    Task<(byte[] Bytes, string ContentType, string FileName)?> GetSyllabusAsync(string slug, CancellationToken ct = default);
}
