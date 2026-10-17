using System.ComponentModel.DataAnnotations;

namespace Andalusia.Shared.Dtos.ProfileDtos
{
    public record UpdateProfileDto(
        [Required, MaxLength(50)] string FirstName,
        [Required, MaxLength(50)] string LastName,
        [Required, Phone, MaxLength(20)] string MobileNumber,
        [MaxLength(50)] string? Country,
        [MaxLength(10)] string? PreferredLanguage);
}
