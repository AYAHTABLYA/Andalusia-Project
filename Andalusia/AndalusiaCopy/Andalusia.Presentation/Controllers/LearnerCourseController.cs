using Andalusia.ServicesAbstraction;
using Andalusia.Shared.Authorization;
using Andalusia.Shared.CommonResult;
using Andalusia.Shared.Dtos.LearnerDtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using System.Security.Claims;

namespace AndalusiaApp.Controllers;

/// <summary>
/// "My enrolled course" endpoints for the Learner portal. Every call is scoped to the caller's own data:
/// an enrollment / assignment that isn't theirs returns 404, exactly like one that doesn't exist.
/// </summary>
[ApiController]
[Authorize(Roles = AppRoles.Learner)]
[Route("api/learner")]
public sealed class LearnerCourseController(ILearnerCourseService svc) : ControllerBase
{
    // GET /api/learner/enrollments/{id}/course      (course details + schedule + location)
    [HttpGet("enrollments/{id:long}/course")]
    public async Task<IActionResult> GetCourse(long id, CancellationToken ct)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();
        return ToOk(await svc.GetCourseAsync(userId, id, ct));
    }

    // GET /api/learner/enrollments/{id}/materials
    [HttpGet("enrollments/{id:long}/materials")]
    public async Task<IActionResult> GetMaterials(long id, CancellationToken ct)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();
        return ToOk(await svc.GetMaterialsAsync(userId, id, ct));
    }

    // GET /api/learner/enrollments/{id}/sessions
    [HttpGet("enrollments/{id:long}/sessions")]
    public async Task<IActionResult> GetSessions(long id, CancellationToken ct)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();
        return ToOk(await svc.GetSessionsAsync(userId, id, ct));
    }

    // GET /api/learner/enrollments/{id}/assignments
    [HttpGet("enrollments/{id:long}/assignments")]
    public async Task<IActionResult> GetAssignments(long id, CancellationToken ct)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();
        return ToOk(await svc.GetAssignmentsAsync(userId, id, ct));
    }

    // GET /api/learner/assignments/{assignmentId}
    [HttpGet("assignments/{assignmentId:long}")]
    public async Task<IActionResult> GetAssignment(long assignmentId, CancellationToken ct)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();
        return ToOk(await svc.GetAssignmentAsync(userId, assignmentId, ct));
    }

    // POST /api/learner/assignments/{assignmentId}/submit
    [HttpPost("assignments/{assignmentId:long}/submit")]
    public async Task<IActionResult> SubmitAssignment(
        long assignmentId, [FromBody] SubmitAssignmentDto dto, CancellationToken ct)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();
        var result = await svc.SubmitAssignmentAsync(userId, assignmentId, dto, ct);
        return result.IsSuccess ? StatusCode(StatusCodes.Status201Created, result.Value) : ToProblem(result.Errors);
    }

    // GET /api/learner/enrollments/{id}/attendance
    [HttpGet("enrollments/{id:long}/attendance")]
    public async Task<IActionResult> GetAttendance(long id, CancellationToken ct)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();
        return ToOk(await svc.GetAttendanceAsync(userId, id, ct));
    }

    // GET /api/learner/enrollments/{id}/progress
    [HttpGet("enrollments/{id:long}/progress")]
    public async Task<IActionResult> GetProgress(long id, CancellationToken ct)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();
        return ToOk(await svc.GetProgressAsync(userId, id, ct));
    }

    // ------------------------------------------------------------------ plumbing

    private bool TryGetUserId(out long userId) =>
        long.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub"), out userId);

    private IActionResult ToOk<T>(Result<T> result) =>
        result.IsSuccess ? Ok(result.Value) : ToProblem(result.Errors);

    private IActionResult ToProblem(IReadOnlyList<Error> errors)
    {
        if (errors.Count == 0)
            return Problem(statusCode: StatusCodes.Status500InternalServerError, title: "Internal Server Error",
                detail: "Unexpected error occurred.");

        if (errors.All(e => e.Type == ErrorType.Validation))
        {
            var modelState = new ModelStateDictionary();
            foreach (var error in errors) modelState.AddModelError(error.Code, error.Description);
            return ValidationProblem(modelState);
        }

        var first = errors[0];
        return Problem(title: first.Code, detail: first.Description, type: first.Type.ToString(),
            statusCode: first.Type switch
            {
                ErrorType.Validation => StatusCodes.Status400BadRequest,
                ErrorType.NotFound => StatusCodes.Status404NotFound,
                ErrorType.Unauthorized or ErrorType.InvalidCredentials => StatusCodes.Status401Unauthorized,
                ErrorType.Forbidden => StatusCodes.Status403Forbidden,
                ErrorType.Conflict => StatusCodes.Status409Conflict,
                _ => StatusCodes.Status500InternalServerError
            });
    }
}
