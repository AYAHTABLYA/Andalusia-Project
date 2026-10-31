using Andalusia.Shared.CommonResult;
using Andalusia.Shared.Dtos.MessageDtos;

namespace Andalusia.ServicesAbstraction;

/// <summary>
/// Learner &lt;-&gt; instructor direct messages. A learner can only write to instructors teaching one of the
/// learner's (non-cancelled) batches, and an instructor only to learners enrolled in one of their batches.
/// </summary>
public interface IMessageService
{
    /// <summary>The people the caller may message, with unread counts and the latest message of each thread.</summary>
    Task<IReadOnlyList<MessageContactDto>> GetContactsAsync(long userId, bool isInstructor, CancellationToken ct = default);

    /// <summary>The whole thread with one contact (oldest first). Marks the contact's messages as read.</summary>
    Task<Result<IReadOnlyList<MessageDto>>> GetThreadAsync(long userId, bool isInstructor, long otherUserId, CancellationToken ct = default);

    Task<Result<MessageDto>> SendAsync(long userId, bool isInstructor, SendMessageDto dto, CancellationToken ct = default);

    Task<int> GetUnreadCountAsync(long userId, CancellationToken ct = default);
}
