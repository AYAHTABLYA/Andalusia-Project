using System.Security.Claims;
using Andalusia.ServicesAbstraction;
using Andalusia.Shared.Authorization;
using Andalusia.Shared.Dtos;
using Andalusia.Shared.Dtos.CoordinatorDtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AndalusiaApp.Controllers;

[ApiController]
[Authorize(Roles = AppRoles.Coordinator, Policy = AppPermissions.EnrollmentsManage)]
[Route("api/coordinator")]
public sealed class CoordinatorEnrollmentsController(ICoordinatorEnrollmentService service) : ControllerBase
{
    private bool TryActorId(out long id) => long.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub"), out id);

    [HttpGet("learners")]
    public async Task<IActionResult> SearchLearners([FromQuery] string? search, [FromQuery] long? scheduleId, CancellationToken ct)
    {
        try { return Ok(await service.SearchEligibleLearnersAsync(search, scheduleId, ct)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    [HttpPost("enrollments")]
    public async Task<IActionResult> Enroll([FromBody] CoordinatorEnrollmentRequest request, CancellationToken ct)
    {
        if (!TryActorId(out var actorId)) return Unauthorized();
        try { return StatusCode(StatusCodes.Status201Created, await service.EnrollAsync(actorId, request, ct)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [HttpDelete("enrollments/{id:long}")]
    public async Task<IActionResult> Cancel(long id, [FromQuery] string? reason, CancellationToken ct)
    {
        if (!TryActorId(out var actorId)) return Unauthorized();
        try { return Ok(await service.CancelAsync(actorId, id, reason, ct)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }
}
