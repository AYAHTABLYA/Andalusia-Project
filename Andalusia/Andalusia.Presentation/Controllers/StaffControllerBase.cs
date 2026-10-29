using System.Security.Claims;
using Andalusia.ServicesAbstraction;
using Andalusia.Shared.Authorization;
using Andalusia.Shared.CommonResult;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace AndalusiaApp.Controllers;

/// <summary>
/// Shared plumbing for the staff/admin controllers: resolves the caller (<see cref="StaffActor"/>)
/// and turns service <see cref="Result"/>s into HTTP responses (404 / 403 / 400 / 409 ...).
/// Deliberately does not inherit ApiBaseController, which carries its own api/[controller] route.
/// </summary>
[ApiController]
[Authorize]
public abstract class StaffControllerBase : ControllerBase
{
    protected bool IsAdmin => User.IsInRole(AppRoles.Admin) || User.IsInRole(AppRoles.Manager);

    /// <summary>Returns null on success, or the Forbid()/Unauthorized() response to return immediately.</summary>
    protected ActionResult? TryGetActor(out StaffActor actor)
    {
        actor = default;
        var isAdmin = IsAdmin;
        var isCoordinator = User.IsInRole(AppRoles.Coordinator);
        if (!isAdmin && !isCoordinator && !User.IsInRole(AppRoles.Instructor)) return Forbid();

        var raw = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (!long.TryParse(raw, out var userId)) return Unauthorized();

        // StaffActor.IsAdmin represents academy-wide operational scope in services.
        // Coordinator receives that scope only on endpoints whose role and permission policies allow it.
        actor = new StaffActor(userId, isAdmin || isCoordinator);
        return null;
    }

    protected IActionResult ToOk<T>(Result<T> result) =>
        result.IsSuccess ? Ok(result.Value) : ToProblem(result.Errors);

    protected IActionResult ToCreated<T>(Result<T> result) =>
        result.IsSuccess ? StatusCode(StatusCodes.Status201Created, result.Value) : ToProblem(result.Errors);

    protected IActionResult ToNoContent(Result result) =>
        result.IsSuccess ? NoContent() : ToProblem(result.Errors);

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
