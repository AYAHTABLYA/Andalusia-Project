using Andalusia.Shared.CommonResult;
using Andalusia.Shared.Dtos.NotificationDtos;

namespace Andalusia.ServicesAbstraction;

/// <summary>
/// In-app notifications (the bell icon). Every method is scoped to the calling user, so the same
/// service backs the learner portal and the admin / instructor / coordinator dashboards.
/// </summary>
public interface INotificationService
{
    Task<NotificationsDto> GetMineAsync(long userId, bool unreadOnly, int take, CancellationToken ct = default);
    Task<int> GetUnreadCountAsync(long userId, CancellationToken ct = default);
    Task<Result> MarkReadAsync(long userId, long id, CancellationToken ct = default);
    Task<Result> MarkAllReadAsync(long userId, CancellationToken ct = default);
    Task<Result> DeleteAsync(long userId, long id, CancellationToken ct = default);

    /// <summary>Admin/Manager broadcast to one user or to a whole role.</summary>
    Task<Result<SendNotificationResultDto>> SendAsync(SendNotificationDto dto, CancellationToken ct = default);

    /// <summary>
    /// For other services: raise a notification for a user (e.g. payment confirmed, assignment published).
    /// Never throws - a failed notification must not break the business operation that raised it.
    /// </summary>
    Task NotifyAsync(long userId, string title, string message, string type = "Info", CancellationToken ct = default);

    /// <summary>Same as <see cref="NotifyAsync"/> for several users in one save.</summary>
    Task NotifyManyAsync(IEnumerable<long> userIds, string title, string message, string type = "Info", CancellationToken ct = default);
}
