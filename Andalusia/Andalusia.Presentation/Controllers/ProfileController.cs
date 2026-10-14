using Andalusia.ServicesAbstraction;
using Andalusia.Shared.Dtos.ProfileDtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AndalusiaApp.Controllers;

[ApiController]
[Authorize]
[Route("api/profile")]
public class ProfileController(IProfileService svc) : ControllerBase
{
    private bool TryGetUserId(out long userId) =>
        long.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub"), out userId);

    // GET /api/profile
    [HttpGet]
    public async Task<ActionResult<ProfileDto>> Get(CancellationToken ct)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();
        return await svc.GetAsync(userId, ct) is { } dto ? Ok(dto) : NotFound();
    }

    // PUT /api/profile
    [HttpPut]
    public async Task<ActionResult<ProfileDto>> Update([FromBody] UpdateProfileDto dto, CancellationToken ct)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();
        try
        {
            return await svc.UpdateAsync(userId, dto, ct) is { } res ? Ok(res) : NotFound();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ProblemDetails { Title = "Invalid profile data", Detail = ex.Message });
        }
    }

    // PUT /api/profile/change-password
    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto, CancellationToken ct)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();
        try
        {
            return await svc.ChangePasswordAsync(userId, dto, ct)
                ? Ok(new { message = "Password changed successfully." })
                : NotFound();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ProblemDetails { Title = "Change password failed", Detail = ex.Message });
        }
    }
}
