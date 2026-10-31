using Andalusia.ServicesAbstraction;
using Andalusia.Shared.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AndalusiaApp.Controllers;

/// <summary>
/// Admin/Manager view of any student. The role gate matters: instructors hold students.view too,
/// but must not reach learners outside their own schedules through /api/admin.
/// </summary>
[Authorize(Roles = AppRoles.AdminOrManager)]
[Route("api/admin/students")]
public sealed class AdminStudentsController(IStaffStudentService svc) : StaffControllerBase
{
    // GET /api/admin/students/{id}
    [HttpGet("{id:long}")]
    [Authorize(Policy = AppPermissions.StudentsView)]
    public async Task<IActionResult> Get(long id, CancellationToken ct)
    {
        if (TryGetActor(out var actor) is { } denied) return denied;
        return ToOk(await svc.GetStudentAsync(actor, id, ct));
    }

    // GET /api/admin/students/{id}/enrollments
    [HttpGet("{id:long}/enrollments")]
    [Authorize(Policy = AppPermissions.EnrollmentsView)]
    public async Task<IActionResult> Enrollments(long id, CancellationToken ct)
    {
        if (TryGetActor(out var actor) is { } denied) return denied;
        return ToOk(await svc.GetEnrollmentsAsync(actor, id, ct));
    }

    // GET /api/admin/students/{id}/progress
    [HttpGet("{id:long}/progress")]
    [Authorize(Policy = AppPermissions.EnrollmentsView)]
    public async Task<IActionResult> Progress(long id, CancellationToken ct)
    {
        if (TryGetActor(out var actor) is { } denied) return denied;
        return ToOk(await svc.GetProgressAsync(actor, id, ct));
    }

    // GET /api/admin/students/{id}/attendance?scheduleId=
    [HttpGet("{id:long}/attendance")]
    [Authorize(Policy = AppPermissions.StudentsView)]
    public async Task<IActionResult> Attendance(long id, [FromQuery] long? scheduleId, CancellationToken ct)
    {
        if (TryGetActor(out var actor) is { } denied) return denied;
        return ToOk(await svc.GetAttendanceAsync(actor, id, scheduleId, ct));
    }
}
