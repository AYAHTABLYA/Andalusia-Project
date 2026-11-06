using Andalusia.Shared.CommonResult;
using Andalusia.Shared.Dtos.StaffDtos;

namespace Andalusia.ServicesAbstraction;

/// <summary>Student details, attendance and progress. Backs both /api/staff/students/... and /api/admin/students/...</summary>
public interface IStaffStudentService
{
    Task<Result<StaffStudentDetailDto>> GetStudentAsync(StaffActor actor, long studentId, CancellationToken ct = default);
    Task<Result<IReadOnlyList<StaffStudentEnrollmentDto>>> GetEnrollmentsAsync(StaffActor actor, long studentId, CancellationToken ct = default);
    Task<Result<IReadOnlyList<AttendanceRecordDto>>> GetAttendanceAsync(StaffActor actor, long studentId, long? scheduleId, CancellationToken ct = default);
    Task<Result<IReadOnlyList<StudentProgressDto>>> GetProgressAsync(StaffActor actor, long studentId, CancellationToken ct = default);
    Task<Result<ScheduleProgressDto>> GetScheduleProgressAsync(StaffActor actor, long scheduleId, CancellationToken ct = default);
}
