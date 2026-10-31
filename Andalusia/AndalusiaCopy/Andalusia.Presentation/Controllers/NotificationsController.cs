using System.Security.Claims;
using Andalusia.ServicesAbstraction;
using Andalusia.Shared.Authorization;
using Andalusia.Shared.Dtos.NotificationDtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Andalusia.Presentation.Controllers
{
    /// <summary>
    /// The bell icon API. One controller serves every dashboard (learner portal, instructor, coordinator,
    /// admin): each call is scoped to the user in the JWT, so nobody can read another user's notifications.
    /// </summary>
    [Authorize]
    public class NotificationsController(INotificationService notifications) : ApiBaseController
    {
        private bool TryGetUserId(out long userId) =>
            long.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub"), out userId);

        // GET /api/notifications?unreadOnly=false&take=20
        [HttpGet]
        public async Task<ActionResult<NotificationsDto>> GetMine(
            [FromQuery] bool unreadOnly = false, [FromQuery] int take = 20, CancellationToken ct = default)
        {
            if (!TryGetUserId(out var userId)) return Unauthorized();
            return Ok(await notifications.GetMineAsync(userId, unreadOnly, take, ct));
        }

        // GET /api/notifications/unread-count
        [HttpGet("unread-count")]
        public async Task<ActionResult<UnreadCountDto>> UnreadCount(CancellationToken ct)
        {
            if (!TryGetUserId(out var userId)) return Unauthorized();
            return Ok(new UnreadCountDto(await notifications.GetUnreadCountAsync(userId, ct)));
        }

        // PUT /api/notifications/{id}/read
        [HttpPut("{id:long}/read")]
        public async Task<IActionResult> MarkRead(long id, CancellationToken ct)
        {
            if (!TryGetUserId(out var userId)) return Unauthorized();
            return HandleResult(await notifications.MarkReadAsync(userId, id, ct));
        }

        // PUT /api/notifications/read-all
        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllRead(CancellationToken ct)
        {
            if (!TryGetUserId(out var userId)) return Unauthorized();
            return HandleResult(await notifications.MarkAllReadAsync(userId, ct));
        }

        // DELETE /api/notifications/{id}
        [HttpDelete("{id:long}")]
        public async Task<IActionResult> Delete(long id, CancellationToken ct)
        {
            if (!TryGetUserId(out var userId)) return Unauthorized();
            return HandleResult(await notifications.DeleteAsync(userId, id, ct));
        }

        // POST /api/notifications  (Admin / Manager): send to one user or to a whole role
        [HttpPost]
        [Authorize(Roles = AppRoles.AdminOrManager)]
        public async Task<ActionResult<SendNotificationResultDto>> Send([FromBody] SendNotificationDto dto, CancellationToken ct)
            => HandleResult(await notifications.SendAsync(dto, ct));
    }
}
