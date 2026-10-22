using Andalusia.Shared;
using Andalusia.Shared.CommonResult;
using Andalusia.Shared.Dtos.StaffDtos;

namespace Andalusia.ServicesAbstraction;

/// <summary>Sessions and attendance, shared by Admin and Instructor (instructors only touch their own schedules).</summary>
public interface IStaffSessionService
{
    Task<Result<StaffSessionDto>> GetSessionAsync(StaffActor actor, long id, CancellationToken ct = default);
    Task<Result<StaffSessionDto>> CreateSessionAsync(StaffActor actor, CreateSessionDto dto, CancellationToken ct = default);
    Task<Result<StaffSessionDto>> UpdateSessionAsync(StaffActor actor, long id, UpdateSessionDto dto, CancellationToken ct = default);
    Task<Result> DeleteSessionAsync(StaffActor actor, long id, CancellationToken ct = default);

    Task<Result<SessionAttendanceDto>> GetSessionAttendanceAsync(StaffActor actor, long sessionId, CancellationToken ct = default);
    Task<Result<SessionAttendanceDto>> SaveSessionAttendanceAsync(StaffActor actor, long sessionId, SaveAttendanceDto dto, CancellationToken ct = default);
    Task<Result<PaginatedResult<AttendanceRecordDto>>> QueryAttendanceAsync(
        StaffActor actor, long? scheduleId, long? sessionId, long? learnerId, string? status,
        DateOnly? from, DateOnly? to, int page, int pageSize, CancellationToken ct = default);
}
