namespace Andalusia.Shared.Dtos.MessageDtos;

/// <param name="Subtitle">Course / batch the two people share, e.g. "Open Banking APIs - B-101".</param>
public sealed record MessageContactDto(
    long UserId, string FullName, string Subtitle, int UnreadCount, string? LastMessage, DateTime? LastMessageAt);

public sealed record MessageDto(long MessageId, long SenderId, string Body, DateTime SentAt, bool IsMine, DateTime? ReadAt);

public sealed record SendMessageDto(long RecipientId, string Body);
