using Andalusia.ServicesAbstraction;
using Andalusia.Shared.Dtos.PortalDtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AndalusiaApp.Controllers;

[ApiController]
[Authorize]
[Route("api/applications")]
public class ApplicationsController(IPortalRecordsService svc) : ControllerBase
{
    private bool TryGetUserId(out long userId) =>
        long.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub"), out userId);

    // GET /api/applications
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ApplicationDto>>> GetMine(CancellationToken ct)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();
        return Ok(await svc.GetMyApplicationsAsync(userId, ct));
    }

    // GET /api/applications/{id}
    [HttpGet("{id:long}")]
    public async Task<ActionResult<ApplicationDto>> GetById(long id, CancellationToken ct)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();
        return await svc.GetMyApplicationAsync(userId, id, ct) is { } dto ? Ok(dto) : NotFound();
    }

    // PUT /api/applications/{id}/cancel
    [HttpPut("{id:long}/cancel")]
    public async Task<IActionResult> Cancel(long id, CancellationToken ct)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();
        try
        {
            return await svc.CancelMyApplicationAsync(userId, id, ct) ? NoContent() : NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new ProblemDetails { Title = "Cancel Conflict", Detail = ex.Message });
        }
    }
}
