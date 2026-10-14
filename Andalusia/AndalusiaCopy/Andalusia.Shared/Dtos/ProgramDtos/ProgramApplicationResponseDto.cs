namespace Andalusia.Shared.Dtos.ProgramDtos;

public record ProgramApplicationResponseDto(
    long ApplicationId,
    string ProgramSlug,
    string Status,
    DateTime SubmissionDate
);
