using Andalusia.ServicesAbstraction;
using Andalusia.Shared.Dtos.ContentDtos;
using Microsoft.AspNetCore.Mvc;

namespace AndalusiaApp.Controllers;

/// <summary>Public testimonials for the landing page.</summary>
[ApiController]
[Route("api/testimonials")]
public sealed class TestimonialsController(ITestimonialService svc) : ControllerBase
{
    // GET /api/testimonials?featured=true&take=4   (newest first)
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<TestimonialDto>>> GetAll(
        [FromQuery] bool? featured, [FromQuery] int? take, CancellationToken ct)
        => Ok(await svc.GetAllAsync(featured, take, ct));

    // GET /api/testimonials/{id}
    [HttpGet("{id:long}")]
    public async Task<ActionResult<TestimonialDto>> Get(long id, CancellationToken ct)
    {
        var result = await svc.GetAsync(id, ct);
        return result.IsSuccess ? Ok(result.Value) : NotFound();
    }
}
