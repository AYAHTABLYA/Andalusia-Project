using Andalusia.ServicesAbstraction;
using Andalusia.Shared.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AndalusiaApp.Controllers;

/// <summary>Student details / attendance / progress for staff (instructors: only learners in their schedules).</summary>
[Route("api/staff")]
public sealed class StaffStudentsController(IStaffStudentService svc) : StaffControllerBase
{
    // GET /api/staff/students/{id}
    [HttpGet("students/{id:long}")]
    [Authorize(Policy = AppPermissions.StudentsView)]
    public async Task<IActionResult> GetStudent(long id, CancellationToken ct)
    {
        if (TryGetActor(out var actor) is { } denied) return denied;
        return ToOk(await svc.GetStudentAsync(actor, id, ct));
    }

    // GET /api/staff/students/{id}/attendance?scheduleId=
    [HttpGet("students/{id:long}/attendance")]
    [Authorize(Policy = AppPermissions.StudentsView)]
    public async Task<IActionResult> GetStudentAttendance(long id, [FromQuery] long? scheduleId, CancellationToken ct)
    {
        if (TryGetActor(out var actor) is { } denied) return denied;
        return ToOk(await svc.GetAttendanceAsync(actor, id, scheduleId, ct));
    }

    // GET /api/staff/students/{id}/progress
    [HttpGet("students/{id:long}/progress")]
    [Authorize(Policy = AppPermissions.EnrollmentsView)]
    public async Task<IActionResult> GetStudentProgress(long id, CancellationToken ct)
    {
        if (TryGetActor(out var actor) is { } denied) return denied;
        return ToOk(await svc.GetProgressAsync(actor, id, ct));
    }

    // GET /api/staff/schedules/{scheduleId}/progress
    [HttpGet("schedules/{scheduleId:long}/progress")]
    [Authorize(Policy = AppPermissions.EnrollmentsView)]
    public async Task<IActionResult> GetScheduleProgress(long scheduleId, CancellationToken ct)
    {
        if (TryGetActor(out var actor) is { } denied) return denied;
        return ToOk(await svc.GetScheduleProgressAsync(actor, scheduleId, ct));
    }
}
