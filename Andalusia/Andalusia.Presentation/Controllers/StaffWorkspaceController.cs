using System.Security.Claims;
using Andalusia.ServicesAbstraction;
using Andalusia.Shared.Authorization;
using Andalusia.Shared.Dtos.StaffDtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AndalusiaApp.Controllers;

[ApiController]
[Authorize]
[Route("api/staff")]
public sealed class StaffWorkspaceController(IStaffWorkspaceService staff) : ControllerBase
{
    private bool TryGetUserId(out long id) => long.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub"), out id);
    private bool IsAdmin => User.IsInRole(AppRoles.Admin) || User.IsInRole(AppRoles.Manager);
    private bool IsInstructor => User.IsInRole(AppRoles.Instructor);
    private bool IsCoordinator => User.IsInRole(AppRoles.Coordinator);
    private bool IsAcademyWide => IsAdmin || IsCoordinator;

    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard(CancellationToken ct) { if (!IsAcademyWide && !IsInstructor) return Forbid(); if (!IsAcademyWide && !TryGetUserId(out _)) return Unauthorized(); TryGetUserId(out var id); return Ok(await staff.GetDashboardAsync(IsAcademyWide ? null : id, IsAcademyWide, ct)); }

    [HttpGet("schedule")]
    [Authorize(Policy = AppPermissions.SessionsManage)]
    public async Task<IActionResult> Schedule([FromQuery] DateOnly? from, [FromQuery] DateOnly? to, CancellationToken ct) { if (!IsAcademyWide && !IsInstructor) return Forbid(); if (!IsAcademyWide && !TryGetUserId(out _)) return Unauthorized(); TryGetUserId(out var id); return Ok(await staff.GetScheduleAsync(IsAcademyWide ? null : id, IsAcademyWide, from, to, ct)); }

    [HttpGet("assignments")]
    [Authorize(Policy = AppPermissions.AssignmentsManage)]
    public async Task<IActionResult> Assignments(CancellationToken ct) { if (!IsAdmin && !IsInstructor) return Forbid(); if (!IsAdmin && !TryGetUserId(out _)) return Unauthorized(); TryGetUserId(out var id); return Ok(await staff.GetAssignmentsAsync(IsAdmin ? null : id, IsAdmin, ct)); }

    [HttpGet("assignments/{id:long}/submissions")]
    [Authorize(Policy = AppPermissions.AssignmentsManage)]
    public async Task<IActionResult> Submissions(long id, CancellationToken ct) { if (!IsAdmin && !IsInstructor) return Forbid(); if (!IsAdmin && !TryGetUserId(out _)) return Unauthorized(); TryGetUserId(out var uid); var result = await staff.GetSubmissionsAsync(id, IsAdmin ? null : uid, IsAdmin, ct); if (result is null) return NotFound(); if (!IsAdmin && result.Count == 0) return Forbid(); return Ok(result); }

    [HttpGet("students")]
    [Authorize(Policy = AppPermissions.StudentsView)]
    public async Task<IActionResult> Students([FromQuery] string? search, CancellationToken ct) { if (!IsAcademyWide && !IsInstructor) return Forbid(); if (!IsAcademyWide && !TryGetUserId(out _)) return Unauthorized(); TryGetUserId(out var id); return Ok(await staff.GetStudentsAsync(IsAcademyWide ? null : id, IsAcademyWide, search, ct)); }

    [HttpGet("payouts")]
    [Authorize(Policy = AppPermissions.PaymentsView)]
    public async Task<IActionResult> Payouts(CancellationToken ct) { if (!IsAdmin && !IsInstructor) return Forbid(); if (!IsAdmin && !TryGetUserId(out _)) return Unauthorized(); TryGetUserId(out var id); return Ok(await staff.GetPayoutsAsync(IsAdmin ? null : id, IsAdmin, ct)); }

    [HttpPut("payouts/{id:long}/status")]
    [Authorize(Roles = AppRoles.Admin + "," + AppRoles.Manager)]
    public async Task<IActionResult> UpdatePayoutStatus(long id, [FromBody] UpdatePayoutStatusDto request, CancellationToken ct) { if (!TryGetUserId(out var actor)) return Unauthorized(); try { var result = await staff.UpdatePayoutStatusAsync(id, actor, request.Status, ct); return result is null ? NotFound() : Ok(result); } catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); } }
}
