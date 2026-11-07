using Andalusia.ServicesAbstraction;
using Andalusia.Shared.Dtos.LearnerDtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AndalusiaApp.Controllers;

[ApiController]
[Authorize(Roles = Andalusia.Shared.Authorization.AppRoles.Learner)]
[Route("api/learner")]
public class LearnerController(ILearnerDashboardService svc) : ControllerBase
{
    // GET /api/learner/dashboard
    [HttpGet("dashboard")]
    public async Task<ActionResult<LearnerDashboardDto>> Dashboard(CancellationToken ct)
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (!long.TryParse(claim, out var userId)) return Unauthorized();

        return await svc.GetAsync(userId, ct) is { } dto ? Ok(dto) : NotFound();
    }
}
