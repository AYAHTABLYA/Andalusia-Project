using Andalusia.ServicesAbstraction;
using Andalusia.Shared.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AndalusiaApp.Controllers;

[Authorize(Roles = AppRoles.AdminManagerOrCoordinator, Policy = AppPermissions.ReportsView)]
[Route("api/admin/reports")]
public sealed class AdminReportsController(IAdminReportsService service) : StaffControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] DateOnly? from, [FromQuery] DateOnly? to, [FromQuery] string? search, CancellationToken ct)
    {
        try
        {
            var includeFinancial = !User.IsInRole(AppRoles.Coordinator);
            var report = await service.GetAsync(from, to, search, ct, includeFinancial);
            return Ok(report);
        }
        catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
    }
}
