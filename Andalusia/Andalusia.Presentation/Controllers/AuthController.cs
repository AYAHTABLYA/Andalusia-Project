using Andalusia.ServicesAbstraction;
using Andalusia.Shared.Dtos.AuthDtos;
using AndalusiaApp.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AndalusiaApp.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService authService) : ControllerBase
{
    // POST /api/auth/register
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterRequestDto dto, CancellationToken ct)
    {
        try
        {
            var res = await authService.RegisterAsync(dto, ct);
            return StatusCode(StatusCodes.Status201Created, res);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new ProblemDetails { Title = "Registration Conflict", Detail = ex.Message });
        }
    }

    // POST /api/auth/login
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginRequestDto dto, CancellationToken ct)
    {
        try
        {
            var res = await authService.LoginAsync(dto, ct);
            return Ok(res);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new ProblemDetails { Title = "Authentication Failed", Detail = ex.Message });
        }
    }

    // POST /api/auth/confirm-email
    [HttpPost("confirm-email")]
    public async Task<IActionResult> ConfirmEmail([FromBody] ConfirmEmailDto dto, CancellationToken ct)
    {
        var success = await authService.ConfirmEmailAsync(dto, ct);
        return success
            ? Ok(new { message = "Email confirmed successfully." })
            : BadRequest(new ProblemDetails { Title = "Invalid Token", Detail = "Token is invalid or expired." });
    }

    // POST /api/auth/resend-confirmation
    [HttpPost("resend-confirmation")]
    public async Task<IActionResult> ResendConfirmation([FromBody] ResendConfirmationDto dto, CancellationToken ct)
    {
        await authService.ResendConfirmationEmailAsync(dto, ct);
        return Ok(new { message = "If the email is eligible, a confirmation link has been resent." });
    }

    // POST /api/auth/forgot-password
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto, CancellationToken ct)
    {
        await authService.ForgotPasswordAsync(dto, ct);
        return Ok(new { message = "If the email exists, a password reset link has been dispatched." });
    }

    // POST /api/auth/reset-password
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto, CancellationToken ct)
    {
        var success = await authService.ResetPasswordAsync(dto, ct);
        return success
            ? Ok(new { message = "Password updated successfully." })
            : BadRequest(new ProblemDetails { Title = "Reset Failed", Detail = "Token is invalid or expired." });
    }

    // GET /api/auth/check-email?email=test@test.com
    [HttpGet("check-email")]
    public async Task<IActionResult> CheckEmail([FromQuery] string email, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(email)) return BadRequest("Email is required.");
        var isAvailable = await authService.IsEmailAvailableAsync(email, ct);
        return Ok(new { email, isAvailable });
    }
}