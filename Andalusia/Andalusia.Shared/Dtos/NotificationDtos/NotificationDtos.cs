using System.ComponentModel.DataAnnotations;

namespace Andalusia.Shared.Dtos.NotificationDtos;

/// <summary>One notification as shown in the bell dropdown.</summary>
public record NotificationDto(
    long Id,
    string Title,
    string Message,
    // Info | Success | Warning | Alert (free text, max 50 chars)
    string Type,
    bool IsRead,
    DateTime CreatedAt);

/// <summary>The signed-in user's latest notifications + how many are still unread (for the badge).</summary>
public record NotificationsDto(IReadOnlyList<NotificationDto> Items, int UnreadCount);

public record UnreadCountDto(int UnreadCount);

/// <summary>
/// Admin/Manager broadcast. Send to ONE user (<see cref="UserId"/>) or to everybody holding a role
/// (<see cref="Role"/>, e.g. "Learner", "Instructor", "Coordinator"). Exactly one of them is required.
/// </summary>
public record SendNotificationDto(
    long? UserId,
    string? Role,
    [Required, MaxLength(200)] string Title,
    [Required, MaxLength(1000)] string Message,
    [MaxLength(50)] string? Type);

public record SendNotificationResultDto(int Recipients);
