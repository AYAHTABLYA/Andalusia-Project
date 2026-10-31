namespace Andalusia.Shared.Dtos.ProfileDtos
{
    public record ProfileDto(
        long UserId, string FirstName, string LastName, string FullName, string Email,
        string MobileNumber, string Country, string PreferredLanguage, string Role,
        bool IsEmailVerified, DateTime CreatedAt);
}
