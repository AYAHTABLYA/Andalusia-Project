using Andalusia.Shared;
using Andalusia.Shared.Dtos.CareerPathDtos;
using AndalusiaApp.Services;
using Microsoft.AspNetCore.Mvc;

namespace AndalusiaApp.Controllers;

[ApiController]
[Route("api/career-paths")]
public class CareerPathsController(ICareerPathService svc) : ControllerBase
{
    // GET /api/career-paths?search=&domain=&status=&page=1&pageSize=12
    [HttpGet]
    public async Task<ActionResult<PaginatedResult<CareerPathListItemDto>>> GetAll(
        [FromQuery] CareerPathQuery q,
        CancellationToken ct)
        => Ok(await svc.GetAllAsync(q, ct));

    // GET /api/career-paths/statuses
    [HttpGet("statuses")]
    public async Task<ActionResult<string[]>> Statuses(CancellationToken ct)
        => Ok(await svc.GetStatusesAsync(ct));

    // GET /api/career-paths/domains
    [HttpGet("domains")]
    public async Task<ActionResult<string[]>> Domains(CancellationToken ct)
        => Ok(await svc.GetDomainsAsync(ct));

    // GET /api/career-paths/{slug}
    [HttpGet("{slug}")]
    public async Task<ActionResult<CareerPathDetailDto>> Get(
        string slug,
        CancellationToken ct)
        => await svc.GetBySlugAsync(slug, ct) is { } dto ? Ok(dto) : NotFound();

    // GET /api/career-paths/{slug}/syllabus
    [HttpGet("{slug}/syllabus")]
    public async Task<IActionResult> DownloadSyllabus(
        string slug,
        CancellationToken ct)
    {
        var file = await svc.GetSyllabusAsync(slug, ct);
        if (file is null)
            return NotFound("Syllabus is not available for this career path yet.");

        return File(file.Value.Bytes, file.Value.ContentType, file.Value.FileName);
    }
}
