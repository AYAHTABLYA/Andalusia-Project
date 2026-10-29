using Andalusia.Shared.Dtos.AdminDtos;

namespace Andalusia.ServicesAbstraction;

public interface IAdminReportsService
{
    Task<AdminReportsDto> GetAsync(DateOnly? from, DateOnly? to, string? search, CancellationToken ct = default, bool includeFinancial = true);
}
