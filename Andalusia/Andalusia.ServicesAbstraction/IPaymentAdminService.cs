using Andalusia.Shared;
using Andalusia.Shared.CommonResult;
using Andalusia.Shared.Dtos.AdminDtos;

namespace Andalusia.ServicesAbstraction;

public interface IPaymentAdminService
{
    Task<Result<PaginatedResult<AdminPaymentDto>>> GetPaymentsAsync(string? status, string? search, int page, int pageSize, CancellationToken ct = default);
    Task<Result<AdminPaymentDto>> GetPaymentAsync(long id, CancellationToken ct = default);
    Task<Result<AdminPaymentDto>> UpdateStatusAsync(long id, UpdatePaymentStatusDto dto, CancellationToken ct = default);
}
