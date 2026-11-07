namespace AndalusiaApp.Models;

/// <summary>A direct message between a learner and one of the instructors teaching them.</summary>
public class DirectMessage
{
    public long DirectMessageId { get; set; }
    public long SenderId { get; set; }
    public long RecipientId { get; set; }
    public string Body { get; set; } = "";
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReadAt { get; set; }

    public User Sender { get; set; } = null!;
    public User Recipient { get; set; } = null!;
}
