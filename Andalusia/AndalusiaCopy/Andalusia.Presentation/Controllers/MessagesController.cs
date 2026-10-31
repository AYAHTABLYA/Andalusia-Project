using System.Security.Claims;
using Andalusia.ServicesAbstraction;
using Andalusia.Shared.Authorization;
using Andalusia.Shared.Dtos.MessageDtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AndalusiaApp.Controllers;

/// <summary>Direct messages between a learner and their instructors (both dashboards use this controller).</summary>
[Authorize(Roles = AppRoles.Learner + "," + AppRoles.Instructor)]
[Route("api/messages")]
public sealed class MessagesController(IMessageService svc) : StaffControllerBase
{
    private bool TryGetUserId(out long userId) =>
        long.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub"), out userId);

    private bool IsInstructor => User.IsInRole(AppRoles.Instructor);

    // GET /api/messages/contacts
    [HttpGet("contacts")]
    public async Task<IActionResult> Contacts(CancellationToken ct)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();
        return Ok(await svc.GetContactsAsync(userId, IsInstructor, ct));
    }

    // GET /api/messages/with/{userId}
    [HttpGet("with/{otherUserId:long}")]
    public async Task<IActionResult> Thread(long otherUserId, CancellationToken ct)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();
        return ToOk(await svc.GetThreadAsync(userId, IsInstructor, otherUserId, ct));
    }

    // POST /api/messages   body: { "recipientId": 12, "body": "Hello" }
    [HttpPost]
    public async Task<IActionResult> Send([FromBody] SendMessageDto dto, CancellationToken ct)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();
        return ToCreated(await svc.SendAsync(userId, IsInstructor, dto, ct));
    }

    // GET /api/messages/unread-count
    [HttpGet("unread-count")]
    public async Task<IActionResult> UnreadCount(CancellationToken ct)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();
        return Ok(new { count = await svc.GetUnreadCountAsync(userId, ct) });
    }
}
