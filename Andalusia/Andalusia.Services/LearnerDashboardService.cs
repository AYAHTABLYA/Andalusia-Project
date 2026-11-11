using Andalusia.Domain.Contracts;
using Andalusia.ServicesAbstraction;
using Andalusia.Shared.Dtos.LearnerDtos;
using AndalusiaApp.Models;

namespace Andalusia.Services;

public sealed class LearnerDashboardService(
    IUnitOfWork uow,
    IPortalRecordsService portal,
    IPaymentService payments) : ILearnerDashboardService
{
    public async Task<LearnerDashboardDto?> GetAsync(long userId, CancellationToken ct = default)
    {
        var user = await uow.GetRepository<User>().GetByIdAsync(userId);
        if (user is null) return null;

        var apps = await portal.GetMyApplicationsAsync(userId, ct);
        var enrollments = await portal.GetMyEnrollmentsAsync(userId, ct);
        var pays = await payments.GetMyPaymentsAsync(userId, ct);

        var stats = new DashboardStatsDto(
            TotalApplications: apps.Count,
            PendingApplications: apps.Count(a => a.Status is "Submitted" or "Under_Review"),
            ApprovedApplications: apps.Count(a => a.Status == "Approved"),
            ActiveEnrollments: enrollments.Count(e => e.Status is "Enrolled" or "Active"),
            CompletedEnrollments: enrollments.Count(e => e.Status == "Completed"),
            TotalPaid: pays.Where(p => p.Status == "Success").Sum(p => p.Amount),
            Currency: "EGP");

        return new LearnerDashboardDto(
            new DashboardLearnerDto(user.UserId, $"{user.FirstName} {user.LastName}".Trim(), user.Email),
            stats,
            apps.Take(5).ToList(),
            enrollments,
            pays.Take(5).ToList());
    }
}
