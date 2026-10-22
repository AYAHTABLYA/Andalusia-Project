using Andalusia.ServicesAbstraction;
using Andalusia.Shared.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AndalusiaApp.Controllers;

[Authorize(Roles = AppRoles.AdminOrManager, Policy = AppPermissions.ReportsView)]
[Route("api/admin/reports")]
public sealed class AdminReportsController(IAdminReportsService service) : StaffControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] DateOnly? from, [FromQuery] DateOnly? to, [FromQuery] string? search, CancellationToken ct)
    {
        try { return Ok(await service.GetAsync(from, to, search, ct)); }
        catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
    }
}
