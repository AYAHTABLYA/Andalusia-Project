using Andalusia.Shared;
using Andalusia.Shared.Dtos.ProgramDtos;
using AndalusiaApp.Services;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AndalusiaApp.Controllers;

[ApiController]
[Route("api/programs")]
public class ProgramsController(IProgramService svc) : ControllerBase
{
    // GET /api/programs?search=&category=&page=1&pageSize=12
    [HttpGet]
    public async Task<ActionResult<PaginatedResult<ProgramListItemDto>>> GetAll(
        [FromQuery] ProgramQuery q,
        CancellationToken ct)
        => Ok(await svc.GetAllAsync(q, ct));

    // GET /api/programs/categories
    [HttpGet("categories")]
    public async Task<ActionResult<IReadOnlyList<CategoryDto>>> Categories(CancellationToken ct)
        => Ok(await svc.GetCategoriesAsync(ct));

    // GET /api/programs/{slug}
    [HttpGet("{slug}")]
    public async Task<ActionResult<ProgramDetailDto>> Get(
        string slug,
        CancellationToken ct)
        => await svc.GetBySlugAsync(slug, ct) is { } dto ? Ok(dto) : NotFound();

    // POST /api/programs/{slug}/applications
    [HttpPost("{slug}/applications")]
    public async Task<IActionResult> Apply(
        string slug,
        [FromBody] ApplyToProgramRequest? request,
        CancellationToken ct)
    {
        var claimValue = User.FindFirstValue(ClaimTypes.NameIdentifier)
                          ?? User.FindFirstValue("sub");

        if (!long.TryParse(claimValue, out var userId))
            return Unauthorized();

        var applicationId = await svc.ApplyAsync(slug, userId, request, ct);
        if (applicationId is null)
            return NotFound();

        return Ok(new ProgramApplicationResponseDto(
            applicationId.Value,
            slug,
            "Submitted",
            DateTime.UtcNow));
    }

    // GET /api/programs/{slug}/syllabus
    [HttpGet("{slug}/syllabus")]
    public async Task<IActionResult> DownloadSyllabus(
        string slug,
        CancellationToken ct)
    {
        var file = await svc.GetSyllabusAsync(slug, ct);
        if (file is null)
            return NotFound("Syllabus is not available for this program yet.");

        return File(file.Value.Bytes, file.Value.ContentType, file.Value.FileName);
    }
}
