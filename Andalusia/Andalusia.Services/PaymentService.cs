using Andalusia.Domain.Contracts;
using Andalusia.Domain.Enums;
using Andalusia.ServicesAbstraction;
using Andalusia.Shared.Dtos.PaymentDtos;
using AndalusiaApp.Models;
using AndalusiaApp.Specifications;

namespace Andalusia.Services;

public sealed class PaymentService(IUnitOfWork uow) : IPaymentService
{
    private const string Currency = "EGP";
    private const string Gateway = "Simulation";

    public async Task<IReadOnlyList<PaymentDto>> GetMyPaymentsAsync(long userId, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();

        var payments = (await uow.GetRepository<Payment>()
            .GetAllAsync(new MyPaymentsSpecification(userId))).ToList();
        if (payments.Count == 0) return [];

        var apps = (await uow.GetRepository<Application>()
            .GetAllAsync(new MyApplicationsSpecification(userId)))
            .ToDictionary(a => a.ApplicationId);

        return payments
            .Select(p => ToDto(p, p.ApplicationId is long id && apps.TryGetValue(id, out var app) ? app : null))
            .ToList();
    }

    public async Task<PaymentDto?> GetMyPaymentAsync(long userId, long id, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();

        var payment = await uow.GetRepository<Payment>().GetAsync(new MyPaymentSpecification(userId, id));
        if (payment is null) return null;

        Application? app = null;
        if (payment.ApplicationId is long appId)
            app = await uow.GetRepository<Application>().GetAsync(new MyApplicationSpecification(userId, appId));

        return ToDto(payment, app);
    }

    public async Task<PaymentDto?> InitiateAsync(long userId, CreatePaymentDto dto, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();

        var app = await uow.GetRepository<Application>()
            .GetAsync(new MyApplicationSpecification(userId, dto.ApplicationId));
        if (app is null) return null;

        if (app.Status is ApplicationStatus.Rejected or ApplicationStatus.Cancelled)
            throw new InvalidOperationException($"This application is {app.Status} and cannot be paid.");

        var payRepo = uow.GetRepository<Payment>();
        var existing = (await payRepo.GetAllAsync(
            new PaymentsByApplicationSpecification(app.ApplicationId), trackChanges: true)).ToList();

        if (existing.Any(p => p.Status == PaymentStatus.Success))
            throw new InvalidOperationException("This application is already paid.");

        var alreadyEnrolled = await uow.GetRepository<Enrollment>().GetAsync(
            new ActiveEnrollmentForTargetSpecification(userId, app.CourseId, app.ProgramId, app.ScheduleId));
        if (alreadyEnrolled is not null)
            throw new InvalidOperationException("You are already enrolled in this course/program.");

        // Reuse the pending payment instead of creating duplicates.
        var pending = existing
            .Where(p => p.Status == PaymentStatus.Initiated)
            .OrderByDescending(p => p.PaymentId)
            .FirstOrDefault();
        if (pending is not null) return ToDto(pending, app);

        var payment = new Payment
        {
            UserId = userId,
            ApplicationId = app.ApplicationId,
            Amount = app.Course?.Tuition ?? app.Program?.Price ?? 0m,
            Currency = Currency,
            GatewayName = Gateway,
            TransactionRef = $"SIM-{Guid.NewGuid():N}",
            Status = PaymentStatus.Initiated
        };

        await payRepo.AddAsync(payment);
        await uow.SaveChangesAsync();
        return ToDto(payment, app);
    }

    public async Task<PaymentDto?> ConfirmAsync(long userId, long paymentId, ConfirmPaymentDto dto, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();

        var payment = await uow.GetRepository<Payment>()
            .GetAsync(new MyPaymentSpecification(userId, paymentId), trackChanges: true);
        if (payment is null) return null;

        Application? app = null;
        if (payment.ApplicationId is long appId)
            app = await uow.GetRepository<Application>()
                .GetAsync(new MyApplicationSpecification(userId, appId), trackChanges: true);

        // Idempotent: confirming an already successful payment just returns it.
        if (payment.Status == PaymentStatus.Success) return ToDto(payment, app);

        if (payment.Status != PaymentStatus.Initiated)
            throw new InvalidOperationException($"This payment is already {payment.Status}.");

        if (app is null)
            throw new InvalidOperationException("This payment is not linked to an application.");

        if (!dto.Success)
        {
            payment.Status = PaymentStatus.Failed;
            await uow.SaveChangesAsync();
            return ToDto(payment, app);
        }

        if (app.Status is ApplicationStatus.Rejected or ApplicationStatus.Cancelled)
            throw new InvalidOperationException($"This application is {app.Status} and cannot be paid.");

        var enrollRepo = uow.GetRepository<Enrollment>();

        var alreadyEnrolled = await enrollRepo.GetAsync(
            new ActiveEnrollmentForTargetSpecification(userId, app.CourseId, app.ProgramId, app.ScheduleId));
        if (alreadyEnrolled is not null)
            throw new InvalidOperationException("You are already enrolled in this course/program.");

        if (app.ScheduleId is long scheduleId)
        {
            var schedule = await uow.GetRepository<Schedule>().GetByIdAsync(scheduleId);
            if (schedule is not null && schedule.Capacity > 0)
            {
                var taken = await enrollRepo.CountAsync(new ScheduleEnrollmentsSpecification(scheduleId));
                if (taken >= schedule.Capacity)
                {
                    payment.Status = PaymentStatus.Failed;
                    await uow.SaveChangesAsync();
                    throw new InvalidOperationException("This schedule is full. The payment was not completed.");
                }
            }
        }

        var enrollment = new Enrollment
        {
            UserId = userId,
            CourseId = app.CourseId,
            ProgramId = app.ProgramId,
            ScheduleId = app.ScheduleId,
            ApplicationId = app.ApplicationId,
            Status = EnrollmentStatus.Enrolled,
            EnrolledAt = DateTime.UtcNow,
            Progress = new Progress()
        };

        payment.Status = PaymentStatus.Success;
        payment.PaidAt = DateTime.UtcNow;
        payment.Enrollment = enrollment;
        app.Status = ApplicationStatus.Approved;

        await enrollRepo.AddAsync(enrollment);
        await uow.SaveChangesAsync();   // payment + enrollment + application in one transaction

        return ToDto(payment, app);
    }

    private static PaymentDto ToDto(Payment p, Application? app) => new(
        p.PaymentId, p.ApplicationId, p.EnrollmentId,
        app?.Course?.Title ?? app?.Program?.Title,
        p.Amount, p.Currency, p.GatewayName, p.TransactionRef,
        p.Status.ToString(), p.PaidAt);
}
