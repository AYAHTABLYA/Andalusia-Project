using Andalusia.ServicesAbstraction;
using Andalusia.Shared.Authorization;
using Andalusia.Shared.Dtos.StaffDtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AndalusiaApp.Controllers;

/// <summary>Sessions + attendance, shared by Admin/Manager and Instructor (instructors: own schedules only).</summary>
[Route("api/staff")]
public sealed class StaffSessionsController(IStaffSessionService svc) : StaffControllerBase
{
    // GET /api/staff/sessions/{id}
    [HttpGet("sessions/{id:long}")]
    [Authorize(Policy = AppPermissions.SessionsManage)]
    public async Task<IActionResult> GetSession(long id, CancellationToken ct)
    {
        if (TryGetActor(out var actor) is { } denied) return denied;
        return ToOk(await svc.GetSessionAsync(actor, id, ct));
    }

    // POST /api/staff/sessions
    [HttpPost("sessions")]
    [Authorize(Policy = AppPermissions.SessionsManage)]
    public async Task<IActionResult> CreateSession([FromBody] CreateSessionDto dto, CancellationToken ct)
    {
        if (TryGetActor(out var actor) is { } denied) return denied;
        return ToCreated(await svc.CreateSessionAsync(actor, dto, ct));
    }

    // PUT /api/staff/sessions/{id}
    [HttpPut("sessions/{id:long}")]
    [Authorize(Policy = AppPermissions.SessionsManage)]
    public async Task<IActionResult> UpdateSession(long id, [FromBody] UpdateSessionDto dto, CancellationToken ct)
    {
        if (TryGetActor(out var actor) is { } denied) return denied;
        return ToOk(await svc.UpdateSessionAsync(actor, id, dto, ct));
    }

    // DELETE /api/staff/sessions/{id}
    [HttpDelete("sessions/{id:long}")]
    [Authorize(Policy = AppPermissions.SessionsManage)]
    public async Task<IActionResult> DeleteSession(long id, CancellationToken ct)
    {
        if (TryGetActor(out var actor) is { } denied) return denied;
        return ToNoContent(await svc.DeleteSessionAsync(actor, id, ct));
    }

    // GET /api/staff/sessions/{sessionId}/attendance   (roster with current marks)
    [HttpGet("sessions/{sessionId:long}/attendance")]
    [Authorize(Policy = AppPermissions.AttendanceManage)]
    public async Task<IActionResult> GetSessionAttendance(long sessionId, CancellationToken ct)
    {
        if (TryGetActor(out var actor) is { } denied) return denied;
        return ToOk(await svc.GetSessionAttendanceAsync(actor, sessionId, ct));
    }

    // PUT /api/staff/sessions/{sessionId}/attendance   body: { "entries": [ { "learnerId": 1, "status": "Present" } ] }
    [HttpPut("sessions/{sessionId:long}/attendance")]
    [Authorize(Policy = AppPermissions.AttendanceManage)]
    public async Task<IActionResult> SaveSessionAttendance(long sessionId, [FromBody] SaveAttendanceDto dto, CancellationToken ct)
    {
        if (TryGetActor(out var actor) is { } denied) return denied;
        return ToOk(await svc.SaveSessionAttendanceAsync(actor, sessionId, dto, ct));
    }

    // GET /api/staff/attendance?scheduleId=&sessionId=&learnerId=&status=&from=&to=&page=1&pageSize=20
    [HttpGet("attendance")]
    [Authorize(Policy = AppPermissions.AttendanceManage)]
    public async Task<IActionResult> QueryAttendance(
        [FromQuery] long? scheduleId, [FromQuery] long? sessionId, [FromQuery] long? learnerId, [FromQuery] string? status,
        [FromQuery] DateOnly? from, [FromQuery] DateOnly? to,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        if (TryGetActor(out var actor) is { } denied) return denied;
        return ToOk(await svc.QueryAttendanceAsync(actor, scheduleId, sessionId, learnerId, status, from, to, page, pageSize, ct));
    }
}
