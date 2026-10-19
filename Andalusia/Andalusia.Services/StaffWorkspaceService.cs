using Andalusia.Domain.Contracts;
using Andalusia.Domain.Enums;
using Andalusia.ServicesAbstraction;
using Andalusia.Shared.Dtos.StaffDtos;
using AndalusiaApp.Models;

namespace Andalusia.Services;

/// <summary>Staff dashboard use-cases. Persistence access is kept behind the existing UnitOfWork/repository abstraction.</summary>
public sealed class StaffWorkspaceService(IUnitOfWork uow) : IStaffWorkspaceService
{
    public async Task<StaffDashboardDto> GetDashboardAsync(long? instructorId, bool isAdmin, CancellationToken ct = default)
    {
        var users = (await uow.GetRepository<User>().GetAllAsync()).ToList();
        var roles = (await uow.GetRepository<Role>().GetAllAsync()).ToDictionary(x => x.RoleId, x => x.Name);
        var userRoles = (await uow.GetRepository<UserRole>().GetAllAsync()).ToList();
        var instructors = (await uow.GetRepository<Instructor>().GetAllAsync()).ToList();
        var schedules = (await uow.GetRepository<Schedule>().GetAllAsync()).ToList();
        var scheduleInstructors = (await uow.GetRepository<ScheduleInstructor>().GetAllAsync()).ToList();
        var sessions = (await uow.GetRepository<Session>().GetAllAsync()).ToList();
        var assignments = (await uow.GetRepository<Assignment>().GetAllAsync()).ToList();
        var payouts = (await uow.GetRepository<InstructorPayout>().GetAllAsync()).ToList();
        var courses = (await uow.GetRepository<Course>().GetAllAsync()).ToList();
        var enrollments = (await uow.GetRepository<Enrollment>().GetAllAsync()).ToList();
        var visibleSchedules = isAdmin ? schedules : schedules.Where(s => scheduleInstructors.Any(si => si.ScheduleId == s.ScheduleId && si.InstructorId == instructorId)).ToList();
        var visibleIds = visibleSchedules.Select(s => s.ScheduleId).ToHashSet();
        var learnerIds = userRoles.Where(ur => roles.GetValueOrDefault(ur.RoleId) == "Learner").Select(ur => ur.UserId).Distinct().ToHashSet();
        return new StaffDashboardDto(
            isAdmin ? learnerIds.Count : enrollments.Where(e => e.ScheduleId.HasValue && visibleIds.Contains(e.ScheduleId.Value)).Select(e => e.UserId).Distinct().Count(),
            isAdmin ? instructors.Count : instructors.Count(i => i.InstructorId == instructorId),
            isAdmin ? courses.Count : visibleSchedules.Where(s => s.CourseId.HasValue).Select(s => s.CourseId).Distinct().Count(),
            visibleSchedules.Count,
            sessions.Count(s => visibleIds.Contains(s.ScheduleId) && s.SessionDate >= DateOnly.FromDateTime(DateTime.UtcNow)),
            assignments.Count(a => visibleIds.Contains(a.ScheduleId) && a.DueDate >= DateTime.UtcNow),
            payouts.Count(p => p.Status == InstructorPayoutStatus.Pending && (isAdmin || p.InstructorId == instructorId)));
    }

    public async Task<IReadOnlyList<StaffSessionDto>> GetScheduleAsync(long? instructorId, bool isAdmin, DateOnly? from, DateOnly? to, CancellationToken ct = default)
    {
        var sessions = (await uow.GetRepository<Session>().GetAllAsync()).ToList();
        var schedules = (await uow.GetRepository<Schedule>().GetAllAsync()).ToDictionary(x => x.ScheduleId);
        var links = (await uow.GetRepository<ScheduleInstructor>().GetAllAsync()).ToList();
        var courses = (await uow.GetRepository<Course>().GetAllAsync()).ToDictionary(x => x.CourseId);
        return sessions.Where(s => schedules.ContainsKey(s.ScheduleId) && (isAdmin || links.Any(l => l.ScheduleId == s.ScheduleId && l.InstructorId == instructorId)) && (!from.HasValue || s.SessionDate >= from) && (!to.HasValue || s.SessionDate <= to))
            .OrderBy(s => s.SessionDate).ThenBy(s => s.StartTime).Select(s => { var sc = schedules[s.ScheduleId]; return new StaffSessionDto(s.SessionId, s.Title, s.SessionDate, s.StartTime, s.EndTime, s.RoomDetails, s.ScheduleId, sc.CourseId.HasValue && courses.TryGetValue(sc.CourseId.Value, out var c) ? c.Title : "Program session", sc.BatchCode); }).ToList();
    }

    public async Task<IReadOnlyList<StaffAssignmentDto>> GetAssignmentsAsync(long? instructorId, bool isAdmin, CancellationToken ct = default)
    {
        var assignments = (await uow.GetRepository<Assignment>().GetAllAsync()).ToList();
        var schedules = (await uow.GetRepository<Schedule>().GetAllAsync()).ToDictionary(x => x.ScheduleId);
        var links = (await uow.GetRepository<ScheduleInstructor>().GetAllAsync()).ToList();
        var courses = (await uow.GetRepository<Course>().GetAllAsync()).ToDictionary(x => x.CourseId);
        var submissions = (await uow.GetRepository<AssignmentSubmission>().GetAllAsync()).ToList();
        return assignments.Where(a => schedules.ContainsKey(a.ScheduleId) && (isAdmin || links.Any(l => l.ScheduleId == a.ScheduleId && l.InstructorId == instructorId))).OrderBy(a => a.DueDate).Select(a => { var subs = submissions.Where(s => s.AssignmentId == a.AssignmentId).ToList(); var sc = schedules[a.ScheduleId]; return new StaffAssignmentDto(a.AssignmentId, a.Title, a.Description, a.DueDate, a.MaxScore, a.ScheduleId, sc.CourseId.HasValue && courses.TryGetValue(sc.CourseId.Value, out var c) ? c.Title : "Program assignment", subs.Count, subs.Count == 0 ? null : subs.Max(s => (DateTime?)s.SubmittedAt)); }).ToList();
    }

    public async Task<IReadOnlyList<StaffSubmissionDto>?> GetSubmissionsAsync(long assignmentId, long? instructorId, bool isAdmin, CancellationToken ct = default)
    {
        var assignment = await uow.GetRepository<Assignment>().GetByIdAsync(assignmentId);
        if (assignment is null) return null;
        if (!isAdmin && !(await uow.GetRepository<ScheduleInstructor>().GetAllAsync()).Any(l => l.ScheduleId == assignment.ScheduleId && l.InstructorId == instructorId)) return Array.Empty<StaffSubmissionDto>();
        var users = (await uow.GetRepository<User>().GetAllAsync()).ToDictionary(u => u.UserId);
        var submissions = (await uow.GetRepository<AssignmentSubmission>().GetAllAsync()).Where(s => s.AssignmentId == assignmentId).OrderByDescending(s => s.SubmittedAt);
        return submissions.Where(s => users.ContainsKey(s.LearnerId)).Select(s => { var u = users[s.LearnerId]; return new StaffSubmissionDto(s.SubmissionId, s.LearnerId, $"{u.FirstName} {u.LastName}".Trim(), u.Email, s.FileUrl, s.Status.ToString(), s.SubmittedAt, s.AttemptNumber); }).ToList();
    }

    public async Task<IReadOnlyList<StaffStudentDto>> GetStudentsAsync(long? instructorId, bool isAdmin, string? search, CancellationToken ct = default)
    {
        var enrollments = (await uow.GetRepository<Enrollment>().GetAllAsync()).ToList();
        var users = (await uow.GetRepository<User>().GetAllAsync()).ToDictionary(u => u.UserId);
        var schedules = (await uow.GetRepository<Schedule>().GetAllAsync()).ToDictionary(s => s.ScheduleId);
        var links = (await uow.GetRepository<ScheduleInstructor>().GetAllAsync()).ToList();
        var courses = (await uow.GetRepository<Course>().GetAllAsync()).ToDictionary(c => c.CourseId);
        var programs = (await uow.GetRepository<AndalusiaApp.Models.Program>().GetAllAsync()).ToDictionary(p => p.ProgramId);
        var q = enrollments.Where(e => users.ContainsKey(e.UserId) && (isAdmin || (e.ScheduleId.HasValue && links.Any(l => l.ScheduleId == e.ScheduleId && l.InstructorId == instructorId))));
        if (!string.IsNullOrWhiteSpace(search)) q = q.Where(e => ($"{users[e.UserId].FirstName} {users[e.UserId].LastName}").Contains(search, StringComparison.OrdinalIgnoreCase) || users[e.UserId].Email.Contains(search, StringComparison.OrdinalIgnoreCase));
        return q.Select(e => { var u = users[e.UserId]; string title = e.CourseId.HasValue && courses.TryGetValue(e.CourseId.Value, out var c) ? c.Title : e.ProgramId.HasValue && programs.TryGetValue(e.ProgramId.Value, out var p) ? p.Title : "—"; return new StaffStudentDto(e.UserId, $"{u.FirstName} {u.LastName}".Trim(), u.Email, e.EnrollmentId, e.Status.ToString(), e.EnrolledAt, e.ScheduleId, title); }).ToList();
    }

    public async Task<IReadOnlyList<StaffPayoutDto>> GetPayoutsAsync(long? instructorId, bool isAdmin, CancellationToken ct = default)
    {
        var payouts = (await uow.GetRepository<InstructorPayout>().GetAllAsync()).Where(p => isAdmin || p.InstructorId == instructorId).OrderByDescending(p => p.CreatedAt).ToList();
        var instructors = (await uow.GetRepository<Instructor>().GetAllAsync()).ToDictionary(i => i.InstructorId);
        var users = (await uow.GetRepository<User>().GetAllAsync()).ToDictionary(u => u.UserId);
        return payouts.Select(p => { var name = instructors.TryGetValue(p.InstructorId, out var i) && users.TryGetValue(i.InstructorId, out var u) ? $"{u.FirstName} {u.LastName}".Trim() : "Instructor"; return new StaffPayoutDto(p.PayoutId, p.InstructorId, name, p.Amount, p.Currency, p.Status.ToString(), p.Notes, p.CreatedAt, p.PaidAt, p.ScheduleId); }).ToList();
    }

    public async Task<StaffPayoutDto?> UpdatePayoutStatusAsync(long payoutId, long actorId, string status, CancellationToken ct = default)
    {
        if (!Enum.TryParse<InstructorPayoutStatus>(status, true, out var parsed)) throw new ArgumentException("Status must be Pending, Paid, or Cancelled.");
        var repo = uow.GetRepository<InstructorPayout>();
        var payout = await repo.GetByIdAsync(payoutId);
        if (payout is null) return null;
        payout.Status = parsed;
        payout.PaidAt = parsed == InstructorPayoutStatus.Paid ? DateTime.UtcNow : null;
        payout.ProcessedBy = actorId;
        repo.Update(payout);
        await uow.SaveChangesAsync();
        var instructor = await uow.GetRepository<Instructor>().GetByIdAsync(payout.InstructorId);
        var user = instructor is null ? null : await uow.GetRepository<User>().GetByIdAsync(instructor.InstructorId);
        return new StaffPayoutDto(payout.PayoutId, payout.InstructorId, user is null ? "Instructor" : $"{user.FirstName} {user.LastName}".Trim(), payout.Amount, payout.Currency, payout.Status.ToString(), payout.Notes, payout.CreatedAt, payout.PaidAt, payout.ScheduleId);
    }
}
