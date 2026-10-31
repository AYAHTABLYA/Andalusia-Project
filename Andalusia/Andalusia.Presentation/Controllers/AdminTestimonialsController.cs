using Andalusia.ServicesAbstraction;
using Andalusia.Shared.Authorization;
using Andalusia.Shared.Dtos.ContentDtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AndalusiaApp.Controllers;

/// <summary>Testimonials management (permission: content.manage - Admin and Content_Manager by default).</summary>
[Route("api/admin/testimonials")]
[Authorize(Policy = AppPermissions.ContentManage)]
public sealed class AdminTestimonialsController(ITestimonialService svc) : StaffControllerBase
{
    // GET /api/admin/testimonials
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<TestimonialDto>>> List(CancellationToken ct)
        => Ok(await svc.GetAllAsync(null, null, ct));

    // GET /api/admin/testimonials/{id}
    [HttpGet("{id:long}")]
    public async Task<IActionResult> Get(long id, CancellationToken ct)
        => ToOk(await svc.GetAsync(id, ct));

    // POST /api/admin/testimonials
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] UpsertTestimonialDto dto, CancellationToken ct)
        => ToCreated(await svc.CreateAsync(dto, ct));

    // PUT /api/admin/testimonials/{id}
    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update(long id, [FromBody] UpsertTestimonialDto dto, CancellationToken ct)
        => ToOk(await svc.UpdateAsync(id, dto, ct));

    // DELETE /api/admin/testimonials/{id}
    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(long id, CancellationToken ct)
        => ToNoContent(await svc.DeleteAsync(id, ct));
}
