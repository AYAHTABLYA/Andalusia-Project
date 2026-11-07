using Andalusia.ServicesAbstraction;
using Andalusia.Shared;
using Andalusia.Shared.Authorization;
using Andalusia.Shared.Dtos.AdminDtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;


namespace AndalusiaApp.Controllers;

/// <summary>Admin-only user and role management. Enforced by the users.manage permission.</summary>
[ApiController]
[Authorize(Policy = AppPermissions.UsersManage)]
[Route("api/admin")]
public class AdminUsersController(IUserAdminService svc) : ControllerBase
{
    private bool TryGetUserId(out long userId) =>
        long.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub"), out userId);

    // GET /api/admin/users?search=&role=&page=1&pageSize=20
    [HttpGet("users")]
    public async Task<ActionResult<PaginatedResult<AdminUserDto>>> GetUsers(
        [FromQuery] string? search, [FromQuery] string? role,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
        => Ok(await svc.GetUsersAsync(search, role, page, pageSize, ct));

    // POST /api/admin/users  (create a staff account with an explicit role)
    [HttpPost("users")]
    public async Task<ActionResult<AdminUserDto>> Create([FromBody] CreateStaffUserDto dto, CancellationToken ct)
    {
        try
        {
            var created = await svc.CreateStaffUserAsync(dto, ct);
            return StatusCode(StatusCodes.Status201Created, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ProblemDetails { Title = "Invalid user data", Detail = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new ProblemDetails { Title = "User Conflict", Detail = ex.Message });
        }
    }

    // PUT /api/admin/users/{id}/role   body: { "role": "Instructor" }
    [HttpPut("users/{id:long}/role")]
    public async Task<ActionResult<AdminUserDto>> ChangeRole(long id, [FromBody] ChangeUserRoleDto dto, CancellationToken ct)
    {
        if (!TryGetUserId(out var actingUserId)) return Unauthorized();
        try
        {
            return await svc.ChangeRoleAsync(actingUserId, id, dto.Role, ct) is { } res ? Ok(res) : NotFound();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ProblemDetails { Title = "Invalid role", Detail = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new ProblemDetails { Title = "Role Conflict", Detail = ex.Message });
        }
    }

    // PUT /api/admin/users/{id}/status   body: { "isActive": false }
    [HttpPut("users/{id:long}/status")]
    public async Task<ActionResult<AdminUserDto>> SetStatus(long id, [FromBody] SetUserStatusDto dto, CancellationToken ct)
    {
        if (!TryGetUserId(out var actingUserId)) return Unauthorized();
        try
        {
            return await svc.SetStatusAsync(actingUserId, id, dto.IsActive, ct) is { } res ? Ok(res) : NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new ProblemDetails { Title = "Status Conflict", Detail = ex.Message });
        }
    }

    // GET /api/admin/roles   (roles + the permissions each one has + how many users)
    [HttpGet("roles")]
    public async Task<ActionResult<IReadOnlyList<RoleDto>>> GetRoles(CancellationToken ct)
        => Ok(await svc.GetRolesAsync(ct));
}
