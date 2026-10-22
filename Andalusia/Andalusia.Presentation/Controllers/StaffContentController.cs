using Andalusia.ServicesAbstraction;
using Andalusia.Shared.Authorization;
using Andalusia.Shared.Dtos.StaffDtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AndalusiaApp.Controllers;

/// <summary>Course materials, assignments and grading, shared by Admin/Manager and Instructor.</summary>
[Route("api/staff")]
public sealed class StaffContentController(IStaffContentService svc) : StaffControllerBase
{
    // ---------------- materials (permission: sessions.manage - there is no dedicated materials permission) ----------------

    // GET /api/staff/courses/{courseId}/materials?scheduleId=
    [HttpGet("courses/{courseId:long}/materials")]
    [Authorize(Policy = AppPermissions.SessionsManage)]
    public async Task<IActionResult> GetMaterials(long courseId, [FromQuery] long? scheduleId, CancellationToken ct)
    {
        if (TryGetActor(out var actor) is { } denied) return denied;
        return ToOk(await svc.GetMaterialsAsync(actor, courseId, scheduleId, ct));
    }

    // GET /api/staff/materials/{id}
    [HttpGet("materials/{id:long}")]
    [Authorize(Policy = AppPermissions.SessionsManage)]
    public async Task<IActionResult> GetMaterial(long id, CancellationToken ct)
    {
        if (TryGetActor(out var actor) is { } denied) return denied;
        return ToOk(await svc.GetMaterialAsync(actor, id, ct));
    }

    // POST /api/staff/courses/{courseId}/materials
    [HttpPost("courses/{courseId:long}/materials")]
    [Authorize(Policy = AppPermissions.SessionsManage)]
    public async Task<IActionResult> CreateMaterial(long courseId, [FromBody] CreateMaterialDto dto, CancellationToken ct)
    {
        if (TryGetActor(out var actor) is { } denied) return denied;
        return ToCreated(await svc.CreateMaterialAsync(actor, courseId, dto, ct));
    }

    // PUT /api/staff/materials/{id}
    [HttpPut("materials/{id:long}")]
    [Authorize(Policy = AppPermissions.SessionsManage)]
    public async Task<IActionResult> UpdateMaterial(long id, [FromBody] UpdateMaterialDto dto, CancellationToken ct)
    {
        if (TryGetActor(out var actor) is { } denied) return denied;
        return ToOk(await svc.UpdateMaterialAsync(actor, id, dto, ct));
    }

    // DELETE /api/staff/materials/{id}
    [HttpDelete("materials/{id:long}")]
    [Authorize(Policy = AppPermissions.SessionsManage)]
    public async Task<IActionResult> DeleteMaterial(long id, CancellationToken ct)
    {
        if (TryGetActor(out var actor) is { } denied) return denied;
        return ToNoContent(await svc.DeleteMaterialAsync(actor, id, ct));
    }

    // ---------------- assignments (permission: assignments.manage) ----------------

    // GET /api/staff/assignments/{id}
    [HttpGet("assignments/{id:long}")]
    [Authorize(Policy = AppPermissions.AssignmentsManage)]
    public async Task<IActionResult> GetAssignment(long id, CancellationToken ct)
    {
        if (TryGetActor(out var actor) is { } denied) return denied;
        return ToOk(await svc.GetAssignmentAsync(actor, id, ct));
    }

    // POST /api/staff/assignments
    [HttpPost("assignments")]
    [Authorize(Policy = AppPermissions.AssignmentsManage)]
    public async Task<IActionResult> CreateAssignment([FromBody] CreateAssignmentDto dto, CancellationToken ct)
    {
        if (TryGetActor(out var actor) is { } denied) return denied;
        return ToCreated(await svc.CreateAssignmentAsync(actor, dto, ct));
    }

    // PUT /api/staff/assignments/{id}
    [HttpPut("assignments/{id:long}")]
    [Authorize(Policy = AppPermissions.AssignmentsManage)]
    public async Task<IActionResult> UpdateAssignment(long id, [FromBody] UpdateAssignmentDto dto, CancellationToken ct)
    {
        if (TryGetActor(out var actor) is { } denied) return denied;
        return ToOk(await svc.UpdateAssignmentAsync(actor, id, dto, ct));
    }

    // DELETE /api/staff/assignments/{id}
    [HttpDelete("assignments/{id:long}")]
    [Authorize(Policy = AppPermissions.AssignmentsManage)]
    public async Task<IActionResult> DeleteAssignment(long id, CancellationToken ct)
    {
        if (TryGetActor(out var actor) is { } denied) return denied;
        return ToNoContent(await svc.DeleteAssignmentAsync(actor, id, ct));
    }

    // PUT /api/staff/submissions/{id}/grade   body: { "score": 85, "feedback": "..." }
    [HttpPut("submissions/{id:long}/grade")]
    [Authorize(Policy = AppPermissions.AssignmentsManage)]
    public async Task<IActionResult> GradeSubmission(long id, [FromBody] GradeSubmissionDto dto, CancellationToken ct)
    {
        if (TryGetActor(out var actor) is { } denied) return denied;
        return ToOk(await svc.GradeSubmissionAsync(actor, id, dto, ct));
    }
}
