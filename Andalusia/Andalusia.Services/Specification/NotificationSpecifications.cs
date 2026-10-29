using Andalusia.Services.Specification;
using AndalusiaApp.Models;

namespace AndalusiaApp.Specifications;

/// <summary>Latest notifications of one user (newest first), optionally only the unread ones.</summary>
public class MyNotificationsSpecification : BaseSpecification<Notification>
{
    public MyNotificationsSpecification(long userId, bool unreadOnly, int take)
        : base(n => n.UserId == userId && (!unreadOnly || !n.IsRead))
    {
        AddOrderByDescending(n => n.NotificationId);
        ApplyPaging(0, take);
    }
}

/// <summary>All unread notifications of one user (used for the badge count and "mark all as read").</summary>
public class MyUnreadNotificationsSpecification : BaseSpecification<Notification>
{
    public MyUnreadNotificationsSpecification(long userId) : base(n => n.UserId == userId && !n.IsRead)
    {
    }
}

/// <summary>One notification, only if it belongs to the given user.</summary>
public class MyNotificationSpecification : BaseSpecification<Notification>
{
    public MyNotificationSpecification(long userId, long id)
        : base(n => n.UserId == userId && n.NotificationId == id)
    {
    }
}

/// <summary>Role assignments of active users holding the given role (broadcast targets).</summary>
public class ActiveUsersByRoleSpecification : BaseSpecification<UserRole>
{
    public ActiveUsersByRoleSpecification(string roleName)
        : base(ur => ur.Role.Name == roleName && ur.User.IsActive)
    {
    }
}
