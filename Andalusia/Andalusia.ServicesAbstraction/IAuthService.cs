using Andalusia.Shared.Dtos.AuthDtos;

namespace Andalusia.ServicesAbstraction
{
    public interface IAuthService
    {
        Task<RegisterResponseDto> RegisterAsync(RegisterRequestDto dto, CancellationToken ct = default);
        Task<AuthResponseDto> LoginAsync(LoginRequestDto dto, CancellationToken ct = default);
        Task<bool> ConfirmEmailAsync(ConfirmEmailDto dto, CancellationToken ct = default);
        Task<bool> ResendConfirmationEmailAsync(ResendConfirmationDto dto, CancellationToken ct = default);
        Task<bool> ForgotPasswordAsync(ForgotPasswordDto dto, CancellationToken ct = default);
        Task<bool> ResetPasswordAsync(ResetPasswordDto dto, CancellationToken ct = default);
        Task<bool> IsEmailAvailableAsync(string email, CancellationToken ct = default);
        Task<IReadOnlyList<CampusDto>> GetCampusesAsync(CancellationToken ct = default);
    }
}
