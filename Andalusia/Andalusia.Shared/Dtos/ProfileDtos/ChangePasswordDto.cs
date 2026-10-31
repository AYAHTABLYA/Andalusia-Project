using System.ComponentModel.DataAnnotations;

namespace Andalusia.Shared.Dtos.ProfileDtos
{
    public record ChangePasswordDto(
        [Required] string CurrentPassword,
        [Required, MinLength(8)] string NewPassword);
}
