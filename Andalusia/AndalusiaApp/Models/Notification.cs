namespace AndalusiaApp.Models
{
    public class Notification
    {
        public long NotificationId { get; set; }
        public long UserId { get; set; }
        public string Title { get; set; } = "";
        public string Message { get; set; } = "";
        public string Type { get; set; } = "";
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public User User { get; set; } = null!;









    }
}
