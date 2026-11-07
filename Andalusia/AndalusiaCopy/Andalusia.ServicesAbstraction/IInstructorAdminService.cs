using Andalusia.Shared;
using Andalusia.Shared.CommonResult;
using Andalusia.Shared.Dtos.AdminDtos;

namespace Andalusia.ServicesAbstraction;

public interface IInstructorAdminService
{
    Task<PaginatedResult<AdminInstructorDto>> GetInstructorsAsync(string? search, bool? isActive, int page, int pageSize, CancellationToken ct = default);
    Task<Result<AdminInstructorDetailDto>> GetInstructorAsync(long id, CancellationToken ct = default);
    Task<Result<AdminInstructorDetailDto>> CreateInstructorAsync(CreateInstructorDto dto, CancellationToken ct = default);
    Task<Result<AdminInstructorDetailDto>> UpdateInstructorAsync(long id, UpdateInstructorDto dto, CancellationToken ct = default);
    Task<Result<AdminInstructorDetailDto>> SetStatusAsync(long actingUserId, long id, bool isActive, CancellationToken ct = default);
}
