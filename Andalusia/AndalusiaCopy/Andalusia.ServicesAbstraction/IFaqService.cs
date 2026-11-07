using Andalusia.Shared.CommonResult;
using Andalusia.Shared.Dtos.ContentDtos;

namespace Andalusia.ServicesAbstraction;

public interface IFaqService
{
    /// <summary>Active FAQs only. General (no category) first, then by category, then OrderIndex.</summary>
    Task<IReadOnlyList<FaqDto>> GetAllAsync(string? categorySlug, bool generalOnly, CancellationToken ct = default);

    // admin
    Task<IReadOnlyList<AdminFaqDto>> GetAdminAllAsync(CancellationToken ct = default);
    Task<Result<AdminFaqDto>> GetAdminAsync(long id, CancellationToken ct = default);
    Task<Result<AdminFaqDto>> CreateAsync(UpsertFaqDto dto, CancellationToken ct = default);
    Task<Result<AdminFaqDto>> UpdateAsync(long id, UpsertFaqDto dto, CancellationToken ct = default);
    Task<Result> DeleteAsync(long id, CancellationToken ct = default);
}
