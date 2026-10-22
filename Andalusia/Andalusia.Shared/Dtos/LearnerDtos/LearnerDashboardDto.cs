using Andalusia.Shared.Dtos.PaymentDtos;
using Andalusia.Shared.Dtos.PortalDtos;

namespace Andalusia.Shared.Dtos.LearnerDtos
{
    public record DashboardLearnerDto(long UserId, string FullName, string Email);

    public record DashboardStatsDto(
        int TotalApplications,
        int PendingApplications,
        int ApprovedApplications,
        int ActiveEnrollments,
        int CompletedEnrollments,
        decimal TotalPaid,
        string Currency);

    public record LearnerDashboardDto(
        DashboardLearnerDto Learner,
        DashboardStatsDto Stats,
        IReadOnlyList<ApplicationDto> RecentApplications,
        IReadOnlyList<EnrollmentDto> Enrollments,
        IReadOnlyList<PaymentDto> RecentPayments);
}
