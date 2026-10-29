using Andalusia.ServicesAbstraction;
using Andalusia.Shared.Authorization;
using Andalusia.Shared.Dtos.ContentDtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AndalusiaApp.Controllers;

/// <summary>FAQ management (permission: content.manage - Admin and Content_Manager by default).</summary>
[Route("api/admin/faqs")]
[Authorize(Policy = AppPermissions.ContentManage)]
public sealed class AdminFaqsController(IFaqService svc) : StaffControllerBase
{
    // GET /api/admin/faqs   (includes inactive)
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<AdminFaqDto>>> List(CancellationToken ct)
        => Ok(await svc.GetAdminAllAsync(ct));

    // GET /api/admin/faqs/{id}
    [HttpGet("{id:long}")]
    public async Task<IActionResult> Get(long id, CancellationToken ct)
        => ToOk(await svc.GetAdminAsync(id, ct));

    // POST /api/admin/faqs
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] UpsertFaqDto dto, CancellationToken ct)
        => ToCreated(await svc.CreateAsync(dto, ct));

    // PUT /api/admin/faqs/{id}
    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update(long id, [FromBody] UpsertFaqDto dto, CancellationToken ct)
        => ToOk(await svc.UpdateAsync(id, dto, ct));

    // DELETE /api/admin/faqs/{id}
    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(long id, CancellationToken ct)
        => ToNoContent(await svc.DeleteAsync(id, ct));
}
