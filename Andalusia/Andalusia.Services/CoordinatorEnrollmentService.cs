using Andalusia.Domain.Contracts;
using Andalusia.Domain.Enums;
using Andalusia.Domain.Models;
using Andalusia.Services.Specification;
using Andalusia.ServicesAbstraction;
using Andalusia.Shared.Dtos.CoordinatorDtos;
using AndalusiaApp.Models;

namespace Andalusia.Services;

/// <summary>Coordinator enrollment use-cases. All persistence goes through the existing UnitOfWork abstraction.</summary>
public sealed class CoordinatorEnrollmentService(IUnitOfWork uow) : ICoordinatorEnrollmentService
{
    public async Task<IReadOnlyList<EligibleLearnerDto>> SearchEligibleLearnersAsync(string? search, long? scheduleId, CancellationToken ct = default)
    {
        var users = (await uow.GetRepository<User>().GetAllAsync()).ToList();
        var roles = (await uow.GetRepository<Role>().GetAllAsync()).ToDictionary(x => x.RoleId, x => x.Name);
        var userRoles = (await uow.GetRepository<UserRole>().GetAllAsync()).ToList();
        var enrollments = (await uow.GetRepository<Enrollment>().GetAllAsync()).ToList();
        if (scheduleId.HasValue && await uow.GetRepository<Schedule>().GetByIdAsync(scheduleId.Value) is null)
            throw new KeyNotFoundException("Schedule not found.");
        var query = users.Where(u => u.IsActive && u.IsEmailVerified && userRoles.Any(ur => ur.UserId == u.UserId && roles.GetValueOrDefault(ur.RoleId) == "Learner"));
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(u => ($"{u.FirstName} {u.LastName}").Contains(term, StringComparison.OrdinalIgnoreCase) || u.Email.Contains(term, StringComparison.OrdinalIgnoreCase));
        }
        if (scheduleId.HasValue)
            query = query.Where(u => !enrollments.Any(e => e.UserId == u.UserId && e.ScheduleId == scheduleId.Value && e.Status != EnrollmentStatus.Cancelled));
        return query.OrderBy(u => u.FirstName).ThenBy(u => u.LastName).Take(100)
            .Select(u => new EligibleLearnerDto(u.UserId, $"{u.FirstName} {u.LastName}".Trim(), u.Email)).ToList();
    }

    public async Task<CoordinatorEnrollmentDto> EnrollAsync(long actorId, CoordinatorEnrollmentRequest request, CancellationToken ct = default)
    {
        if (request.ScheduleId <= 0 || request.LearnerId <= 0) throw new ArgumentException("A valid schedule and learner are required.");
        var schedule = await uow.GetRepository<Schedule>().GetByIdAsync(request.ScheduleId) ?? throw new KeyNotFoundException("Schedule not found.");
        var users = (await uow.GetRepository<User>().GetAllAsync()).ToDictionary(x => x.UserId);
        if (!users.TryGetValue(request.LearnerId, out var learner) || !learner.IsActive || !learner.IsEmailVerified)
            throw new InvalidOperationException("The learner must have an active, verified account.");
        var userRoles = (await uow.GetRepository<UserRole>().GetAllAsync()).Where(x => x.UserId == learner.UserId).ToList();
        var roles = (await uow.GetRepository<Role>().GetAllAsync()).ToDictionary(x => x.RoleId, x => x.Name);
        if (!userRoles.Any(x => roles.GetValueOrDefault(x.RoleId) == "Learner")) throw new InvalidOperationException("The selected account is not a learner.");
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        if (schedule.StartDate > schedule.EndDate || schedule.EndDate < today) throw new InvalidOperationException("The schedule is outside its enrollment dates.");
        var repo = uow.GetRepository<Enrollment>();
        var all = (await repo.GetAllAsync(trackChanges: true)).ToList();
        var existing = all.FirstOrDefault(e => e.ScheduleId == schedule.ScheduleId && e.UserId == learner.UserId);
        if (existing is not null && existing.Status != EnrollmentStatus.Cancelled) throw new InvalidOperationException("The learner is already enrolled.");
        var activeCount = all.Count(e => e.ScheduleId == schedule.ScheduleId && e.Status != EnrollmentStatus.Cancelled);
        if (schedule.Capacity <= 0 || activeCount >= schedule.Capacity) throw new InvalidOperationException("This schedule has reached capacity.");
        var now = DateTime.UtcNow;
        var previous = existing?.Status.ToString() ?? "None";
        if (existing is null)
        {
            existing = new Enrollment { UserId = learner.UserId, ScheduleId = schedule.ScheduleId, CourseId = schedule.CourseId, ProgramId = schedule.ProgramId, Status = EnrollmentStatus.Enrolled, EnrolledAt = now };
            await repo.AddAsync(existing);
            await uow.SaveChangesAsync(); // obtains identity for audit FK
        }
        else
        {
            existing.Status = EnrollmentStatus.Enrolled; existing.EnrolledAt = now; repo.Update(existing);
            await uow.SaveChangesAsync();
        }
        await uow.GetRepository<EnrollmentAudit>().AddAsync(new EnrollmentAudit { EnrollmentId = existing.EnrollmentId, ActorUserId = actorId, Action = previous == "None" ? "Created" : "Reactivated", PreviousStatus = previous, NewStatus = EnrollmentStatus.Enrolled.ToString(), Reason = TrimReason(request.Reason, "Coordinator enrollment"), PerformedAtUtc = now });
        await uow.SaveChangesAsync();
        var actor = users.GetValueOrDefault(actorId);
        return new(existing.EnrollmentId, schedule.ScheduleId, learner.UserId, existing.Status.ToString(), actor is null ? "Coordinator" : $"{actor.FirstName} {actor.LastName}".Trim(), now);
    }

    public async Task<CoordinatorEnrollmentDto> CancelAsync(long actorId, long enrollmentId, string? reason, CancellationToken ct = default)
    {
        var repo = uow.GetRepository<Enrollment>();
        var enrollment = await repo.GetByIdAsync(enrollmentId) ?? throw new KeyNotFoundException("Enrollment not found.");
        if (!enrollment.ScheduleId.HasValue) throw new InvalidOperationException("Only schedule enrollments can be cancelled here.");
        if (enrollment.Status == EnrollmentStatus.Cancelled) throw new InvalidOperationException("Enrollment is already cancelled.");
        var previous = enrollment.Status.ToString();
        enrollment.Status = EnrollmentStatus.Cancelled; repo.Update(enrollment);
        var now = DateTime.UtcNow;
        await uow.GetRepository<EnrollmentAudit>().AddAsync(new EnrollmentAudit { EnrollmentId = enrollment.EnrollmentId, ActorUserId = actorId, Action = "Cancelled", PreviousStatus = previous, NewStatus = EnrollmentStatus.Cancelled.ToString(), Reason = TrimReason(reason, "Coordinator removed enrollment"), PerformedAtUtc = now });
        await uow.SaveChangesAsync();
        var actor = await uow.GetRepository<User>().GetByIdAsync(actorId);
        return new(enrollment.EnrollmentId, enrollment.ScheduleId.Value, enrollment.UserId, enrollment.Status.ToString(), actor is null ? "Coordinator" : $"{actor.FirstName} {actor.LastName}".Trim(), now);
    }

    private static string TrimReason(string? reason, string fallback) => string.IsNullOrWhiteSpace(reason) ? fallback : reason.Trim()[..Math.Min(reason.Trim().Length, 500)];
}
