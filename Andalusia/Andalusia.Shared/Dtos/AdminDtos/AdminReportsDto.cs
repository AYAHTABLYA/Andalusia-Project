namespace Andalusia.Shared.Dtos.AdminDtos;

public sealed record AdminReportRecordDto(string Report, string Period, DateTime Updated, string Status);

public sealed record AdminReportsDto(
    int StudentGrowth,
    int SessionsDelivered,
    string Revenue,
    int SuccessfulTransactions,
    DateOnly From,
    DateOnly To,
    DateTime UpdatedAt,
    IReadOnlyList<AdminReportRecordDto> Records);
