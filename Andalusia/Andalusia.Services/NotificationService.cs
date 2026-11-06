using Andalusia.Domain.Contracts;
using AndalusiaApp.Specifications;
using Andalusia.ServicesAbstraction;
using Andalusia.Shared.Authorization;
using Andalusia.Shared.CommonResult;
using Andalusia.Shared.Dtos.NotificationDtos;
using AndalusiaApp.Models;

namespace Andalusia.Services;

public sealed class NotificationService(IUnitOfWork uow) : INotificationService
{
    private static readonly Error NotFound = Error.NotFound("Notification.NotFound", "Notification not found.");

    public async Task<NotificationsDto> GetMineAsync(long userId, bool unreadOnly, int take, CancellationToken ct = default)
    {
        take = Math.Clamp(take, 1, 100);
        var repo = uow.GetRepository<Notification>();

        var rows = (await repo.GetAllAsync(new MyNotificationsSpecification(userId, unreadOnly, take))).ToList();

        var unread = await GetUnreadCountAsync(userId, ct);
        return new NotificationsDto(rows.Select(ToDto).ToList(), unread);
    }

    public async Task<int> GetUnreadCountAsync(long userId, CancellationToken ct = default)
        => await uow.GetRepository<Notification>()
            .CountAsync(new MyUnreadNotificationsSpecification(userId));

    public async Task<Result> MarkReadAsync(long userId, long id, CancellationToken ct = default)
    {
        var n = await uow.GetRepository<Notification>()
            .GetAsync(new MyNotificationSpecification(userId, id), trackChanges: true);
        if (n is null) return Result.Fail(NotFound);

        if (!n.IsRead)
        {
            n.IsRead = true;
            await uow.SaveChangesAsync();
        }
        return Result.Ok();
    }

    public async Task<Result> MarkAllReadAsync(long userId, CancellationToken ct = default)
    {
        var unread = (await uow.GetRepository<Notification>()
            .GetAllAsync(new MyUnreadNotificationsSpecification(userId), trackChanges: true))
            .ToList();
        if (unread.Count == 0) return Result.Ok();

        foreach (var n in unread) n.IsRead = true;
        await uow.SaveChangesAsync();
        return Result.Ok();
    }

    public async Task<Result> DeleteAsync(long userId, long id, CancellationToken ct = default)
    {
        var repo = uow.GetRepository<Notification>();
        var n = await repo.GetAsync(new MyNotificationSpecification(userId, id), trackChanges: true);
        if (n is null) return Result.Fail(NotFound);

        repo.Remove(n);
        await uow.SaveChangesAsync();
        return Result.Ok();
    }

    public async Task<Result<SendNotificationResultDto>> SendAsync(SendNotificationDto dto, CancellationToken ct = default)
    {
        var title = dto.Title?.Trim() ?? "";
        var message = dto.Message?.Trim() ?? "";
        var role = dto.Role?.Trim();
        var hasRole = !string.IsNullOrWhiteSpace(role);

        if (title.Length == 0 || message.Length == 0)
            return Result<SendNotificationResultDto>.Fail(Error.Validation("Notification.Content", "Title and message are required."));
        if (title.Length > 200 || message.Length > 1000)
            return Result<SendNotificationResultDto>.Fail(Error.Validation("Notification.Length", "Title max 200 characters, message max 1000."));
        if (dto.UserId.HasValue == hasRole)
            return Result<SendNotificationResultDto>.Fail(Error.Validation("Notification.Target", "Provide either userId or role (not both)."));

        List<long> targets;
        if (dto.UserId.HasValue)
        {
            var user = await uow.GetRepository<User>().GetByIdAsync(dto.UserId.Value);
            if (user is null || !user.IsActive)
                return Result<SendNotificationResultDto>.Fail(Error.NotFound("User.NotFound", "User not found."));
            targets = [user.UserId];
        }
        else
        {
            if (!AppRoles.IsValid(role))
                return Result<SendNotificationResultDto>.Fail(Error.Validation("Notification.Role", "Unknown role."));

            targets = (await uow.GetRepository<UserRole>()
                    .GetAllAsync(new ActiveUsersByRoleSpecification(role!)))
                .Select(ur => ur.UserId)
                .Distinct()
                .ToList();
        }

        var type = string.IsNullOrWhiteSpace(dto.Type) ? "Info" : dto.Type.Trim();
        await AddAsync(targets, title, message, type);
        return Result<SendNotificationResultDto>.Ok(new SendNotificationResultDto(targets.Count));
    }

    public Task NotifyAsync(long userId, string title, string message, string type = "Info", CancellationToken ct = default)
        => NotifyManyAsync([userId], title, message, type, ct);

    public async Task NotifyManyAsync(IEnumerable<long> userIds, string title, string message, string type = "Info", CancellationToken ct = default)
    {
        try
        {
            var ids = userIds.Distinct().ToList();
            if (ids.Count == 0) return;
            await AddAsync(ids, title, message, type);
        }
        catch
        {
            // A notification is a nice-to-have: never fail the caller's business operation because of it.
        }
    }

    private async Task AddAsync(IReadOnlyCollection<long> userIds, string title, string message, string type)
    {
        if (userIds.Count == 0) return;

        var repo = uow.GetRepository<Notification>();
        var now = DateTime.UtcNow;
        foreach (var userId in userIds)
        {
            await repo.AddAsync(new Notification
            {
                UserId = userId,
                Title = Trim(title, 200),
                Message = Trim(message, 1000),
                Type = Trim(type, 50),
                IsRead = false,
                CreatedAt = now
            });
        }
        await uow.SaveChangesAsync();
    }

    private static string Trim(string value, int max) => value.Length <= max ? value : value[..max];

    private static NotificationDto ToDto(Notification n)
        => new(n.NotificationId, n.Title, n.Message, n.Type, n.IsRead, DateTime.SpecifyKind(n.CreatedAt, DateTimeKind.Utc));
}
