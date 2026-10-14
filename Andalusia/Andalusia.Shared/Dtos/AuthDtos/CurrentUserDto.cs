namespace Andalusia.Shared.Dtos.AuthDtos
{
    public record CurrentUserDto(long UserId, string FullName, string Email, string Role, bool IsEmailVerified);
}
