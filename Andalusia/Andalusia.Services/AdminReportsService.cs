using Andalusia.Domain.Contracts;
using Andalusia.Domain.Enums;
using Andalusia.Services.Specification;
using Andalusia.ServicesAbstraction;
using Andalusia.Shared.Dtos.AdminDtos;
using AndalusiaApp.Models;

namespace Andalusia.Services;

public sealed class AdminReportsService(IUnitOfWork uow) : IAdminReportsService
{
    public async Task<AdminReportsDto> GetAsync(DateOnly? from, DateOnly? to, string? search, CancellationToken ct = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var start = from ?? new DateOnly(today.Year, today.Month, 1);
        var end = to ?? today;
        if (start > end) throw new ArgumentException("The from date must be on or before the to date.");

        var startDateTime = start.ToDateTime(TimeOnly.MinValue);
        var endExclusive = end.AddDays(1).ToDateTime(TimeOnly.MinValue);
        var enrollments = await uow.GetRepository<Enrollment>().GetAllAsync(
            new QuerySpecification<Enrollment>(x => x.EnrolledAt >= startDateTime && x.EnrolledAt < endExclusive && x.Status != EnrollmentStatus.Cancelled));
        var studentGrowth = enrollments.Select(x => x.UserId).Distinct().Count();

        var sessions = await uow.GetRepository<Session>().GetAllAsync(
            new QuerySpecification<Session>(x => x.SessionDate >= start && x.SessionDate <= end &&
                (x.SessionDate < today || (x.SessionDate == today && x.EndTime <= TimeOnly.FromDateTime(DateTime.UtcNow)))));
        var deliveredSessions = sessions.Count();

        var payments = await uow.GetRepository<Payment>().GetAllAsync(
            new QuerySpecification<Payment>(x => x.Status == PaymentStatus.Success && x.PaidAt != null && x.PaidAt >= startDateTime && x.PaidAt < endExclusive));
        var revenueRows = payments.GroupBy(x => x.Currency).Select(g => new { Currency = g.Key, Amount = g.Sum(x => x.Amount), Count = g.Count() }).ToList();
        var revenue = revenueRows.Count == 0 ? "0" : string.Join("; ", revenueRows.Select(x => $"{x.Amount:N2} {x.Currency}"));

        var updatedAt = DateTime.UtcNow;
        var period = $"{start:yyyy-MM-dd} – {end:yyyy-MM-dd}";
        var records = new List<AdminReportRecordDto>
        {
            new("Operational report", period, updatedAt, "Available"),
            new("Financial report", period, updatedAt, "Available")
        };
        if (!string.IsNullOrWhiteSpace(search))
            records = records.Where(x => x.Report.Contains(search, StringComparison.OrdinalIgnoreCase) || x.Period.Contains(search, StringComparison.OrdinalIgnoreCase) || x.Status.Contains(search, StringComparison.OrdinalIgnoreCase)).ToList();

        return new AdminReportsDto(studentGrowth, deliveredSessions, revenue, revenueRows.Sum(x => x.Count), start, end, updatedAt, records);
    }
}
