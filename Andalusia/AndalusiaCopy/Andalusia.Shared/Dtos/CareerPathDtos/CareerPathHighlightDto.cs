namespace Andalusia.Shared.Dtos.CareerPathDtos;

public record CareerPathHighlightDto(
    string Label,
    string? Value,
    string Tone = "neutral"
);
