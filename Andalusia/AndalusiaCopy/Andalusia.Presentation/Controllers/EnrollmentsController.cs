using Andalusia.ServicesAbstraction;
using Andalusia.Shared.Dtos.PortalDtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AndalusiaApp.Controllers;

[ApiController]
[Authorize]
[Route("api/enrollments")]
public class EnrollmentsController(IPortalRecordsService svc) : ControllerBase
{
    private bool TryGetUserId(out long userId) =>
        long.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub"), out userId);

    // GET /api/enrollments
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<EnrollmentDto>>> GetMine(CancellationToken ct)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();
        return Ok(await svc.GetMyEnrollmentsAsync(userId, ct));
    }

    // GET /api/enrollments/{id}
    [HttpGet("{id:long}")]
    public async Task<ActionResult<EnrollmentDto>> GetById(long id, CancellationToken ct)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();
        return await svc.GetMyEnrollmentAsync(userId, id, ct) is { } dto ? Ok(dto) : NotFound();
    }
}
