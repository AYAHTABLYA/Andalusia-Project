
namespace AndalusiaApp.Models;

public class EmailVerificationToken
{
    public long VerificationId { get; set; }
    public long UserId { get; set; }
    public string Token { get; set; } = "";
    public DateTime ExpiresAt { get; set; }
    public DateTime? VerifiedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public User User { get; set; } = null!;
}