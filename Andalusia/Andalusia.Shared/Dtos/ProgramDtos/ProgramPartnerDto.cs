namespace Andalusia.Shared.Dtos.ProgramDtos;

public record ProgramPartnerDto(
    long PartnerId,
    string Name,
    string LogoUrl,
    string AccreditationDetails
);
