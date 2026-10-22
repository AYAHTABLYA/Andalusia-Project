using Andalusia.Domain.Contracts;
using Andalusia.Domain.Enums;
using Andalusia.Services.Specification;
using Andalusia.ServicesAbstraction;
using Andalusia.Shared;
using Andalusia.Shared.CommonResult;
using Andalusia.Shared.Dtos.AdminDtos;
using AndalusiaApp.Models;

namespace Andalusia.Services;

public sealed class PaymentAdminService(IUnitOfWork uow) : IPaymentAdminService
{
    public async Task<Result<PaginatedResult<AdminPaymentDto>>> GetPaymentsAsync(
        string? status, string? search, int page, int pageSize, CancellationToken ct = default)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var hasStatus = !string.IsNullOrWhiteSpace(status);
        var statusV = PaymentStatus.Initiated;
        if (hasStatus && !TryParseStatus(status!, out statusV))
            return Result<PaginatedResult<AdminPaymentDto>>.Fail(Error.Validation("Payment.Status",
                "Status must be Initiated, Success, Failed or Refunded."));

        var s = search?.Trim().ToLowerInvariant() ?? "";
        var hasSearch = s.Length > 0;

        System.Linq.Expressions.Expression<Func<Payment, bool>> criteria = p =>
            (!hasStatus || p.Status == statusV) &&
            (!hasSearch || p.TransactionRef.Contains(s) || p.User.Email.Contains(s)
                || p.User.FirstName.Contains(s) || p.User.LastName.Contains(s));

        var repo = uow.GetRepository<Payment>();
        var total = await repo.CountAsync(new QuerySpecification<Payment>(criteria));
        var rows = (await repo.GetAllAsync(new QuerySpecification<Payment>(criteria)
            .Include(p => p.User)
            .OrderByDesc(p => p.PaymentId)
            .Page((page - 1) * pageSize, pageSize))).ToList();

        return Result<PaginatedResult<AdminPaymentDto>>.Ok(
            new PaginatedResult<AdminPaymentDto>(page, pageSize, total, await ToDtosAsync(rows)));
    }

    public async Task<Result<AdminPaymentDto>> GetPaymentAsync(long id, CancellationToken ct = default)
    {
        var payment = await LoadAsync(id, track: false);
        if (payment is null) return Result<AdminPaymentDto>.Fail(NotFound);
        return Result<AdminPaymentDto>.Ok((await ToDtosAsync([payment]))[0]);
    }

    /// <summary>
    /// Allowed manual transitions: Initiated -> Failed, Success -> Refunded. Marking a payment as Success is not
    /// allowed here because it must also create the enrollment (that happens in the learner confirm flow).
    /// A refund does NOT cancel the enrollment automatically.
    /// </summary>
    public async Task<Result<AdminPaymentDto>> UpdateStatusAsync(long id, UpdatePaymentStatusDto dto, CancellationToken ct = default)
    {
        if (!TryParseStatus(dto.Status, out var target))
            return Result<AdminPaymentDto>.Fail(Error.Validation("Payment.Status", "Status must be Initiated, Success, Failed or Refunded."));

        var payment = await LoadAsync(id, track: true);
        if (payment is null) return Result<AdminPaymentDto>.Fail(NotFound);

        if (payment.Status == target) // idempotent
            return Result<AdminPaymentDto>.Ok((await ToDtosAsync([payment]))[0]);

        var allowed = (payment.Status, target) switch
        {
            (PaymentStatus.Initiated, PaymentStatus.Failed) => true,
            (PaymentStatus.Success, PaymentStatus.Refunded) => true,
            _ => false
        };
        if (!allowed)
            return Result<AdminPaymentDto>.Fail(Error.Conflict("Payment.Transition",
                $"A {payment.Status} payment cannot be changed to {target}. Allowed: Initiated→Failed, Success→Refunded."));

        payment.Status = target;
        await uow.SaveChangesAsync();
        return Result<AdminPaymentDto>.Ok((await ToDtosAsync([payment]))[0]);
    }

    // ------------------------------------------------------------------ helpers

    private async Task<Payment?> LoadAsync(long id, bool track) =>
        await uow.GetRepository<Payment>().GetAsync(
            new QuerySpecification<Payment>(p => p.PaymentId == id).Include(p => p.User), trackChanges: track);

    private async Task<IReadOnlyList<AdminPaymentDto>> ToDtosAsync(IReadOnlyCollection<Payment> payments)
    {
        if (payments.Count == 0) return [];

        var appIds = payments.Where(p => p.ApplicationId.HasValue).Select(p => p.ApplicationId!.Value).Distinct().ToList();
        var enrollmentIds = payments.Where(p => p.EnrollmentId.HasValue).Select(p => p.EnrollmentId!.Value).Distinct().ToList();

        var apps = appIds.Count == 0
            ? new Dictionary<long, Application>()
            : (await uow.GetRepository<Application>().GetAllAsync(
                    new QuerySpecification<Application>(a => appIds.Contains(a.ApplicationId)).Include(a => a.Course).Include(a => a.Program)))
                .ToDictionary(a => a.ApplicationId);
        var enrollments = enrollmentIds.Count == 0
            ? new Dictionary<long, Enrollment>()
            : (await uow.GetRepository<Enrollment>().GetAllAsync(
                    new QuerySpecification<Enrollment>(e => enrollmentIds.Contains(e.EnrollmentId)).Include(e => e.Course).Include(e => e.Program)))
                .ToDictionary(e => e.EnrollmentId);

        return payments.Select(p =>
        {
            apps.TryGetValue(p.ApplicationId ?? 0, out var app);
            enrollments.TryGetValue(p.EnrollmentId ?? 0, out var enr);
            var item = app?.Course?.Title ?? app?.Program?.Title ?? enr?.Course?.Title ?? enr?.Program?.Title;
            return new AdminPaymentDto(
                p.PaymentId, p.UserId, StaffScope.FullName(p.User), p.User.Email, p.ApplicationId, p.EnrollmentId,
                item, p.Amount, p.Currency, p.GatewayName, p.TransactionRef, p.Status.ToString(), p.PaidAt);
        }).ToList();
    }

    private static bool TryParseStatus(string text, out PaymentStatus status) =>
        Enum.TryParse(text?.Trim(), ignoreCase: true, out status) && Enum.IsDefined(status) && !int.TryParse(text, out _);

    private static Error NotFound => Error.NotFound("Payment.NotFound", "Payment not found.");
}
