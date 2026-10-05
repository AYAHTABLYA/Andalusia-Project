using Andalusia.Shared;
using Andalusia.Shared.Dtos.CourseDtos;
using AndalusiaApp.Services;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AndalusiaApp.Controllers;

[ApiController]
[Route("api/courses")]
public class CoursesController(ICourseService svc) : ControllerBase
{
    // 1. GET /api/courses?search=&category=&page=1&pageSize=12
    [HttpGet]
    public async Task<ActionResult<PaginatedResult<CourseListItemDto>>> GetAll(
        [FromQuery] CourseQuery q, CancellationToken ct)
        => Ok(await svc.GetAllAsync(q, ct));

    // 2. GET /api/courses/categories
    [HttpGet("categories")]
    public async Task<ActionResult<string[]>> Categories(CancellationToken ct)
        => Ok(await svc.GetCategoriesAsync(ct));

    // 6. GET /api/courses/featured?take=3
    [HttpGet("featured")]
    public async Task<ActionResult<List<FeaturedCourseDto>>> Featured(
        [FromQuery] int take = 3, CancellationToken ct = default)
        => Ok(await svc.GetFeaturedAsync(take, ct));

    // 3. GET /api/courses/{slug}
    [HttpGet("{slug}")]
    public async Task<ActionResult<CourseDetailDto>> Get(string slug, CancellationToken ct)
        => await svc.GetBySlugAsync(slug, ct) is { } dto ? Ok(dto) : NotFound();

    // 4. POST /api/courses/{slug}/applications
    [HttpPost("{slug}/applications")]
    public async Task<IActionResult> Apply(string slug, [FromBody] CreateApplicationDto dto, CancellationToken ct)
    {
        long? userId = null;
        var claimValue = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (long.TryParse(claimValue, out var id))
        {
            userId = id;
        }

        if (userId is null)
        {
            if (string.IsNullOrWhiteSpace(dto.FullName) || string.IsNullOrWhiteSpace(dto.Email))
            {
                ModelState.AddModelError("FullName", "Full name and email are required for guest applications.");
                return ValidationProblem(ModelState);
            }
        }

        var appId = await svc.ApplyAsync(slug, dto, userId, ct);
        if (appId is null) return NotFound();

        return Ok(new ApplicationResponseDto(appId.Value, "Submitted"));
    }

    // 5. GET /api/courses/{slug}/syllabus
    [HttpGet("{slug}/syllabus")]
    public async Task<IActionResult> DownloadSyllabus(string slug, CancellationToken ct)
    {
        var file = await svc.GetSyllabusAsync(slug, ct);
        if (file is null) return NotFound("Syllabus is not available for this course yet.");

        return File(file.Value.Bytes, file.Value.ContentType, file.Value.FileName);
    }
}