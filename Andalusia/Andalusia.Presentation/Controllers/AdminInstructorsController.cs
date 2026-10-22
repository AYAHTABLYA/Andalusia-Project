using Andalusia.ServicesAbstraction;
using Andalusia.Shared.Authorization;
using Andalusia.Shared.Dtos.AdminDtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AndalusiaApp.Controllers;

/// <summary>Instructor profiles and their schedules. Permission: instructors.manage (Admin/Manager).</summary>
[Authorize(Roles = AppRoles.AdminOrManager, Policy = AppPermissions.InstructorsManage)]
[Route("api/admin/instructors")]
public sealed class AdminInstructorsController(IInstructorAdminService instructors, IScheduleAdminService schedules)
    : StaffControllerBase
{
    // GET /api/admin/instructors?search=&isActive=&page=1&pageSize=20
    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] string? search, [FromQuery] bool? isActive,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
        => Ok(await instructors.GetInstructorsAsync(search, isActive, page, pageSize, ct));

    // GET /api/admin/instructors/{id}
    [HttpGet("{id:long}")]
    public async Task<IActionResult> Get(long id, CancellationToken ct)
        => ToOk(await instructors.GetInstructorAsync(id, ct));

    // POST /api/admin/instructors
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateInstructorDto dto, CancellationToken ct)
        => ToCreated(await instructors.CreateInstructorAsync(dto, ct));

    // PUT /api/admin/instructors/{id}
    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update(long id, [FromBody] UpdateInstructorDto dto, CancellationToken ct)
        => ToOk(await instructors.UpdateInstructorAsync(id, dto, ct));

    // PUT /api/admin/instructors/{id}/status   body: { "isActive": false }
    [HttpPut("{id:long}/status")]
    public async Task<IActionResult> SetStatus(long id, [FromBody] SetUserStatusDto dto, CancellationToken ct)
    {
        if (TryGetActor(out var actor) is { } denied) return denied;
        return ToOk(await instructors.SetStatusAsync(actor.UserId, id, dto.IsActive, ct));
    }

    // GET /api/admin/instructors/{id}/schedules
    [HttpGet("{id:long}/schedules")]
    public async Task<IActionResult> Schedules(long id, CancellationToken ct)
        => ToOk(await schedules.GetInstructorSchedulesAsync(id, ct));
}
