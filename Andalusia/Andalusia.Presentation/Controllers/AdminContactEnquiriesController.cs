using Andalusia.ServicesAbstraction;
using Andalusia.Shared.Authorization;
using Andalusia.Shared.Dtos.ContactDtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AndalusiaApp.Controllers;

/// <summary>Admission-interview requests inbox (permission: applications.review - Admin and Manager by default).</summary>
[Route("api/admin/contact-enquiries")]
[Authorize(Policy = AppPermissions.ApplicationsReview)]
public sealed class AdminContactEnquiriesController(IContactEnquiryService svc) : StaffControllerBase
{
    // GET /api/admin/contact-enquiries?status=New   (newest first)
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? status, CancellationToken ct)
        => ToOk(await svc.GetAdminAllAsync(status, ct));

    // PUT /api/admin/contact-enquiries/{id}/status   body: { "status": "In_Progress" }
    [HttpPut("{id:long}/status")]
    public async Task<IActionResult> UpdateStatus(long id, [FromBody] UpdateContactEnquiryStatusDto dto, CancellationToken ct)
    {
        if (TryGetActor(out var actor) is { } denied) return denied;
        return ToOk(await svc.UpdateStatusAsync(id, dto.Status, actor.UserId, ct));
    }
}
