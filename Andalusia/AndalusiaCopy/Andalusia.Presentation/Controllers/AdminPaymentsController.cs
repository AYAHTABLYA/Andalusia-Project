using Andalusia.ServicesAbstraction;
using Andalusia.Shared.Authorization;
using Andalusia.Shared.Dtos.AdminDtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AndalusiaApp.Controllers;

/// <summary>Learner payments (money data: Admin/Manager only, plus payments.view).</summary>
[Authorize(Roles = AppRoles.AdminOrManager, Policy = AppPermissions.PaymentsView)]
[Route("api/admin/payments")]
public sealed class AdminPaymentsController(IPaymentAdminService svc) : StaffControllerBase
{
    // GET /api/admin/payments?status=&search=&page=1&pageSize=20
    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] string? status, [FromQuery] string? search,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
        => ToOk(await svc.GetPaymentsAsync(status, search, page, pageSize, ct));

    // GET /api/admin/payments/{id}
    [HttpGet("{id:long}")]
    public async Task<IActionResult> Get(long id, CancellationToken ct)
        => ToOk(await svc.GetPaymentAsync(id, ct));

    // PUT /api/admin/payments/{id}/status   body: { "status": "Refunded" }
    [HttpPut("{id:long}/status")]
    public async Task<IActionResult> UpdateStatus(long id, [FromBody] UpdatePaymentStatusDto dto, CancellationToken ct)
        => ToOk(await svc.UpdateStatusAsync(id, dto, ct));
}
