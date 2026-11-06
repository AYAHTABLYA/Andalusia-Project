using Andalusia.ServicesAbstraction;
using Andalusia.Shared.Dtos.ContentDtos;
using Microsoft.AspNetCore.Mvc;

namespace AndalusiaApp.Controllers;

/// <summary>Public rating summary (average + star distribution) computed from the testimonial ratings.</summary>
[ApiController]
[Route("api/ratings")]
public sealed class RatingsController(ITestimonialService svc) : ControllerBase
{
    // GET /api/ratings/summary
    [HttpGet("summary")]
    public async Task<ActionResult<RatingSummaryDto>> Summary(CancellationToken ct)
        => Ok(await svc.GetRatingSummaryAsync(ct));
}
