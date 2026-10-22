using Andalusia.Shared;
using Andalusia.Shared.CommonResult;
using Andalusia.Shared.Dtos.AdminDtos;

namespace Andalusia.ServicesAbstraction;

public interface IScheduleAdminService
{
    Task<PaginatedResult<AdminScheduleDto>> GetSchedulesAsync(
        string? search, long? courseId, long? programId, string? status, int page, int pageSize, CancellationToken ct = default);
    Task<Result<AdminScheduleDto>> GetScheduleAsync(long id, CancellationToken ct = default);
    Task<Result<AdminScheduleDto>> CreateScheduleAsync(CreateScheduleDto dto, CancellationToken ct = default);
    Task<Result<AdminScheduleDto>> UpdateScheduleAsync(long id, UpdateScheduleDto dto, CancellationToken ct = default);
    Task<Result> DeleteScheduleAsync(long id, CancellationToken ct = default);
    Task<Result<AdminScheduleDto>> SetInstructorsAsync(long scheduleId, SetScheduleInstructorsDto dto, CancellationToken ct = default);
    Task<Result<IReadOnlyList<AdminScheduleDto>>> GetInstructorSchedulesAsync(long instructorId, CancellationToken ct = default);
}
