using Andalusia.ServicesAbstraction;
using Andalusia.Shared.Dtos.ContentDtos;
using Microsoft.AspNetCore.Mvc;

namespace AndalusiaApp.Controllers;

/// <summary>Public FAQs.</summary>
[ApiController]
[Route("api/faqs")]
public sealed class FaqsController(IFaqService svc) : ControllerBase
{
    // GET /api/faqs                      -> all active FAQs
    // GET /api/faqs?general=true         -> only general FAQs (no category), e.g. the landing page
    // GET /api/faqs?category=fintech     -> FAQs of one category (category slug)
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<FaqDto>>> GetAll(
        [FromQuery] string? category, [FromQuery] bool general, CancellationToken ct)
        => Ok(await svc.GetAllAsync(category, general, ct));
}
