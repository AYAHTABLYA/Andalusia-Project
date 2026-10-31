using Andalusia.Shared.CommonResult;
using Andalusia.Shared.Dtos.ContentDtos;

namespace Andalusia.ServicesAbstraction;

public interface ITestimonialService
{
    /// <summary>Newest first. featured = null returns everything; take = null returns all rows (max 50 when set).</summary>
    Task<IReadOnlyList<TestimonialDto>> GetAllAsync(bool? featured, int? take, CancellationToken ct = default);
    Task<RatingSummaryDto> GetRatingSummaryAsync(CancellationToken ct = default);
    Task<Result<TestimonialDto>> GetAsync(long id, CancellationToken ct = default);
    Task<Result<TestimonialDto>> CreateAsync(UpsertTestimonialDto dto, CancellationToken ct = default);
    Task<Result<TestimonialDto>> UpdateAsync(long id, UpsertTestimonialDto dto, CancellationToken ct = default);
    Task<Result> DeleteAsync(long id, CancellationToken ct = default);
}
