namespace Andalusia.Shared.Dtos.AuthDtos
{
    public record RegisterResponseDto(
        long UserId,
        string Email,
        bool RequiresEmailConfirmation,
        string Message
    );
}
