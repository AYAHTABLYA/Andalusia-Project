using Andalusia.ServicesAbstraction;
using Andalusia.Shared.Authorization;
using Andalusia.Shared.Dtos.CourseDtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AndalusiaApp.Controllers;

/// <summary>Course CRUD for Admin/Manager; the create action is Admin-only.</summary>
[ApiController]
[Authorize(Roles = AppRoles.AdminOrManager, Policy = AppPermissions.CoursesManage)]
[Route("api/admin/courses")]
public sealed class AdminCoursesController(ICourseService courses) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<AdminCourseDto>>> List(CancellationToken ct)
        => Ok(await courses.GetAdminCoursesAsync(ct));

    [HttpGet("mentors")]
    public async Task<ActionResult<IReadOnlyList<AdminCourseMentorDto>>> Mentors(CancellationToken ct)
        => Ok(await courses.GetAdminCourseMentorsAsync(ct));

    [HttpGet("{id:long}")]
    public async Task<ActionResult<AdminCourseDto>> Get(long id, CancellationToken ct)
        => await courses.GetAdminCourseAsync(id, ct) is { } dto ? Ok(dto) : NotFound();

    [HttpPost]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<IActionResult> Create([FromBody] CreateAdminCourseDto dto, CancellationToken ct)
    {
        var created = await courses.CreateAdminCourseAsync(dto, ct);
        return created is null
            ? BadRequest(new ProblemDetails { Title = "Invalid course references", Detail = "The selected mentor, program, or career path does not exist." })
            : CreatedAtAction(nameof(Get), new { id = created.CourseId }, created);
    }

    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update(long id, [FromBody] UpdateAdminCourseDto dto, CancellationToken ct)
    {
        var updated = await courses.UpdateAdminCourseAsync(id, dto, ct);
        return updated is null
            ? NotFound(new ProblemDetails { Title = "Course or reference not found", Detail = "Check the course ID and selected mentor, program, and career path." })
            : Ok(updated);
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(long id, CancellationToken ct)
    {
        var deleted = await courses.DeleteAdminCourseAsync(id, ct);
        return deleted is null ? NotFound() : deleted.Value ? NoContent() : Conflict(new ProblemDetails
        {
            Title = "Course is in use",
            Detail = "This course has schedules, applications, or program links. Remove those links before deleting it."
        });
    }
}
