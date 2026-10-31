using Andalusia.ServicesAbstraction;
using Andalusia.Shared.Authorization;
using Andalusia.Shared.Dtos.AdminDtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AndalusiaApp.Controllers;

/// <summary>Course/program schedules (cohorts) and their instructors. Permission: schedules.manage.</summary>
[Authorize(Roles = AppRoles.AdminManagerOrCoordinator, Policy = AppPermissions.SchedulesManage)]
[Route("api/admin/schedules")]
public sealed class AdminSchedulesController(IScheduleAdminService svc) : StaffControllerBase
{
    // GET /api/admin/schedules?search=&courseId=&programId=&status=&page=1&pageSize=20
    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] string? search, [FromQuery] long? courseId, [FromQuery] long? programId, [FromQuery] string? status,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
        => Ok(await svc.GetSchedulesAsync(search, courseId, programId, status, page, pageSize, ct));

    // GET /api/admin/schedules/{id}
    [HttpGet("{id:long}")]
    public async Task<IActionResult> Get(long id, CancellationToken ct)
        => ToOk(await svc.GetScheduleAsync(id, ct));

    // POST /api/admin/schedules
    [HttpPost]
    [Authorize(Roles = AppRoles.AdminOrManager)]
    public async Task<IActionResult> Create([FromBody] CreateScheduleDto dto, CancellationToken ct)
        => ToCreated(await svc.CreateScheduleAsync(dto, ct));

    // PUT /api/admin/schedules/{id}
    [HttpPut("{id:long}")]
    [Authorize(Roles = AppRoles.AdminOrManager)]
    public async Task<IActionResult> Update(long id, [FromBody] UpdateScheduleDto dto, CancellationToken ct)
        => ToOk(await svc.UpdateScheduleAsync(id, dto, ct));

    // DELETE /api/admin/schedules/{id}
    [HttpDelete("{id:long}")]
    [Authorize(Roles = AppRoles.AdminOrManager)]
    public async Task<IActionResult> Delete(long id, CancellationToken ct)
        => ToNoContent(await svc.DeleteScheduleAsync(id, ct));

    // PUT /api/admin/schedules/{scheduleId}/instructors   body: { "instructorIds": [5, 7] }  (replaces the whole set)
    [HttpPut("{scheduleId:long}/instructors")]
    [Authorize(Roles = AppRoles.AdminOrManager)]
    public async Task<IActionResult> SetInstructors(long scheduleId, [FromBody] SetScheduleInstructorsDto dto, CancellationToken ct)
        => ToOk(await svc.SetInstructorsAsync(scheduleId, dto, ct));
}
