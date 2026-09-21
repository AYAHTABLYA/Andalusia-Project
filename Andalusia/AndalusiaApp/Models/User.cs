namespace AndalusiaApp.Models;

public class User
{
    public long UserId { get; set; }
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public string Email { get; set; } = "";
    public string MobileNumber { get; set; } = "";
    public string Country { get; set; } = "";
    public string PreferredLanguage { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public DateTime TermsAcceptedAt { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Instructor? Instructor { get; set; }
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}