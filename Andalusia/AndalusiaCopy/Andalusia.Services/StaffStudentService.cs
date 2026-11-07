using Andalusia.Domain.Contracts;
using Andalusia.Domain.Enums;
using Andalusia.Services.Specification;
using Andalusia.ServicesAbstraction;
using Andalusia.Shared.Authorization;
using Andalusia.Shared.CommonResult;
using Andalusia.Shared.Dtos.StaffDtos;
using AndalusiaApp.Models;

namespace Andalusia.Services;

public sealed class StaffStudentService(IUnitOfWork uow) : IStaffStudentService
{
    public async Task<Result<StaffStudentDetailDto>> GetStudentAsync(StaffActor actor, long studentId, CancellationToken ct = default)
    {
        var scoped = await LoadScopedAsync(actor, studentId);
        if (scoped.Failure is not null) return Result<StaffStudentDetailDto>.Fail(scoped.Failure);

        var user = scoped.User!;
        var enrollments = await ToEnrollmentDtosAsync(scoped.Enrollments);
        return Result<StaffStudentDetailDto>.Ok(new StaffStudentDetailDto(
            user.UserId, StaffScope.FullName(user), user.Email,
            actor.IsAdmin ? user.MobileNumber : null, user.Country, user.IsActive, user.CreatedAt, enrollments));
    }

    public async Task<Result<IReadOnlyList<StaffStudentEnrollmentDto>>> GetEnrollmentsAsync(StaffActor actor, long studentId, CancellationToken ct = default)
    {
        var scoped = await LoadScopedAsync(actor, studentId);
        if (scoped.Failure is not null) return Result<IReadOnlyList<StaffStudentEnrollmentDto>>.Fail(scoped.Failure);

        return Result<IReadOnlyList<StaffStudentEnrollmentDto>>.Ok(await ToEnrollmentDtosAsync(scoped.Enrollments));
    }

    public async Task<Result<IReadOnlyList<AttendanceRecordDto>>> GetAttendanceAsync(
        StaffActor actor, long studentId, long? scheduleId, CancellationToken ct = default)
    {
        var scoped = await LoadScopedAsync(actor, studentId);
        if (scoped.Failure is not null) return Result<IReadOnlyList<AttendanceRecordDto>>.Fail(scoped.Failure);

        var scheduleIds = scoped.Enrollments.Where(e => e.ScheduleId.HasValue).Select(e => e.ScheduleId!.Value).Distinct().ToList();
        if (scheduleId.HasValue) scheduleIds = scheduleIds.Where(id => id == scheduleId.Value).ToList();

        var sessions = await SessionsOfAsync(scheduleIds);
        var sessionIds = sessions.Select(s => s.SessionId).ToList();
        var records = sessionIds.Count == 0
            ? new List<Attendance>()
            : (await uow.GetRepository<Attendance>().GetAllAsync(new QuerySpecification<Attendance>(
                a => a.LearnerId == studentId && sessionIds.Contains(a.SessionId)))).ToList();

        var sessionById = sessions.ToDictionary(s => s.SessionId);
        var labels = await StaffScope.LabelsAsync(uow, scheduleIds);
        var name = StaffScope.FullName(scoped.User!);

        IReadOnlyList<AttendanceRecordDto> dtos = records
            .Where(r => sessionById.ContainsKey(r.SessionId))
            .Select(r =>
            {
                var s = sessionById[r.SessionId];
                var label = labels.GetValueOrDefault(s.ScheduleId) ?? new ScheduleLabel("—", "");
                return new AttendanceRecordDto(r.AttendanceId, s.SessionId, s.Title, s.SessionDate, s.ScheduleId,
                    label.Title, studentId, name, r.Status.ToString(), r.MarkedAt);
            })
            .OrderByDescending(r => r.SessionDate)
            .ToList();
        return Result<IReadOnlyList<AttendanceRecordDto>>.Ok(dtos);
    }

    public async Task<Result<IReadOnlyList<StudentProgressDto>>> GetProgressAsync(StaffActor actor, long studentId, CancellationToken ct = default)
    {
        var scoped = await LoadScopedAsync(actor, studentId);
        if (scoped.Failure is not null) return Result<IReadOnlyList<StudentProgressDto>>.Fail(scoped.Failure);

        var enrollments = scoped.Enrollments;
        var scheduleIds = enrollments.Where(e => e.ScheduleId.HasValue).Select(e => e.ScheduleId!.Value).Distinct().ToList();

        var sessions = await SessionsOfAsync(scheduleIds);
        var sessionIds = sessions.Select(s => s.SessionId).ToList();
        var attendance = sessionIds.Count == 0
            ? new List<Attendance>()
            : (await uow.GetRepository<Attendance>().GetAllAsync(new QuerySpecification<Attendance>(
                a => a.LearnerId == studentId && sessionIds.Contains(a.SessionId)))).ToList();

        var assignments = await AssignmentsOfAsync(scheduleIds);
        var assignmentIds = assignments.Select(a => a.AssignmentId).ToList();
        var submissions = assignmentIds.Count == 0
            ? new List<AssignmentSubmission>()
            : (await uow.GetRepository<AssignmentSubmission>().GetAllAsync(new QuerySpecification<AssignmentSubmission>(
                s => s.LearnerId == studentId && assignmentIds.Contains(s.AssignmentId)))).ToList();

        var titles = await EnrollmentTitlesAsync(enrollments);

        IReadOnlyList<StudentProgressDto> result = enrollments
            .OrderByDescending(e => e.EnrolledAt)
            .Select(e => ProgressCalculator.Compute(
                e, titles.GetValueOrDefault(e.EnrollmentId).Title ?? "—", titles.GetValueOrDefault(e.EnrollmentId).Batch,
                sessions.Where(s => s.ScheduleId == e.ScheduleId).ToList(), attendance,
                assignments.Where(a => a.ScheduleId == e.ScheduleId).ToList(), submissions))
            .ToList();
        return Result<IReadOnlyList<StudentProgressDto>>.Ok(result);
    }

    public async Task<Result<ScheduleProgressDto>> GetScheduleProgressAsync(StaffActor actor, long scheduleId, CancellationToken ct = default)
    {
        var schedule = await uow.GetRepository<Schedule>().GetByIdAsync(scheduleId);
        if (schedule is null) return Result<ScheduleProgressDto>.Fail(Error.NotFound("Schedule.NotFound", "Schedule not found."));
        if (!await StaffScope.CanAccessScheduleAsync(uow, actor, scheduleId))
            return Result<ScheduleProgressDto>.Fail(Error.Forbidden("Schedule.Forbidden", "You do not teach this schedule."));

        var enrollments = (await uow.GetRepository<Enrollment>().GetAllAsync(new QuerySpecification<Enrollment>(
            e => e.ScheduleId == scheduleId && e.Status != EnrollmentStatus.Cancelled))).ToList();
        var users = await StaffScope.UsersAsync(uow, enrollments.Select(e => e.UserId).Distinct().ToList());

        var sessions = await SessionsOfAsync([scheduleId]);
        var sessionIds = sessions.Select(s => s.SessionId).ToList();
        var attendance = sessionIds.Count == 0
            ? new List<Attendance>()
            : (await uow.GetRepository<Attendance>().GetAllAsync(new QuerySpecification<Attendance>(
                a => sessionIds.Contains(a.SessionId)))).ToList();

        var assignments = await AssignmentsOfAsync([scheduleId]);
        var assignmentIds = assignments.Select(a => a.AssignmentId).ToList();
        var submissions = assignmentIds.Count == 0
            ? new List<AssignmentSubmission>()
            : (await uow.GetRepository<AssignmentSubmission>().GetAllAsync(new QuerySpecification<AssignmentSubmission>(
                s => assignmentIds.Contains(s.AssignmentId)))).ToList();

        var labels = await StaffScope.LabelsAsync(uow, [scheduleId]);
        var label = labels.GetValueOrDefault(scheduleId) ?? new ScheduleLabel("—", schedule.BatchCode);

        var learners = enrollments
            .Where(e => users.ContainsKey(e.UserId))
            .Select(e =>
            {
                var u = users[e.UserId];
                var progress = ProgressCalculator.Compute(
                    e, label.Title, label.BatchCode, sessions, attendance.Where(a => a.LearnerId == e.UserId).ToList(),
                    assignments, submissions.Where(s => s.LearnerId == e.UserId).ToList());
                return new ScheduleLearnerProgressDto(u.UserId, StaffScope.FullName(u), u.Email, progress);
            })
            .OrderBy(l => l.Name)
            .ToList();

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        return Result<ScheduleProgressDto>.Ok(new ScheduleProgressDto(
            scheduleId, label.Title, label.BatchCode, sessions.Count, sessions.Count(s => s.SessionDate <= today),
            assignments.Count, learners));
    }

    // ------------------------------------------------------------------ helpers

    private sealed record Scoped(User? User, List<Enrollment> Enrollments, Error? Failure);

    /// <summary>
    /// Loads the learner and their enrollments. Instructors only see enrollments in schedules they teach
    /// (and get 403 when the learner has none there); admins see everything.
    /// </summary>
    private async Task<Scoped> LoadScopedAsync(StaffActor actor, long studentId)
    {
        var user = await uow.GetRepository<User>().GetByIdAsync(studentId);
        if (user is null) return new Scoped(null, [], StudentNotFound);

        var isLearner = await uow.GetRepository<UserRole>().CountAsync(
            new QuerySpecification<UserRole>(ur => ur.UserId == studentId && ur.Role.Name == AppRoles.Learner));
        if (isLearner == 0) return new Scoped(null, [], StudentNotFound);

        var enrollments = (await uow.GetRepository<Enrollment>()
            .GetAllAsync(new QuerySpecification<Enrollment>(e => e.UserId == studentId))).ToList();

        if (!actor.IsAdmin)
        {
            var mine = await StaffScope.InstructorScheduleIdsAsync(uow, actor.UserId);
            enrollments = enrollments.Where(e => e.ScheduleId.HasValue && mine.Contains(e.ScheduleId.Value)).ToList();
            if (enrollments.Count == 0)
                return new Scoped(null, [], Error.Forbidden("Student.Forbidden", "This learner is not enrolled in any of your schedules."));
        }

        return new Scoped(user, enrollments, null);
    }

    private async Task<List<Session>> SessionsOfAsync(IReadOnlyCollection<long> scheduleIds)
    {
        if (scheduleIds.Count == 0) return [];
        return (await uow.GetRepository<Session>().GetAllAsync(
            new QuerySpecification<Session>(s => scheduleIds.Contains(s.ScheduleId)))).ToList();
    }

    private async Task<List<Assignment>> AssignmentsOfAsync(IReadOnlyCollection<long> scheduleIds)
    {
        if (scheduleIds.Count == 0) return [];
        return (await uow.GetRepository<Assignment>().GetAllAsync(
            new QuerySpecification<Assignment>(a => scheduleIds.Contains(a.ScheduleId)))).ToList();
    }

    /// <summary>EnrollmentId -> (course/program title, batch code).</summary>
    private async Task<Dictionary<long, (string Title, string? Batch)>> EnrollmentTitlesAsync(IReadOnlyCollection<Enrollment> enrollments)
    {
        var courseIds = enrollments.Where(e => e.CourseId.HasValue).Select(e => e.CourseId!.Value).Distinct().ToList();
        var programIds = enrollments.Where(e => e.ProgramId.HasValue).Select(e => e.ProgramId!.Value).Distinct().ToList();
        var scheduleIds = enrollments.Where(e => e.ScheduleId.HasValue).Select(e => e.ScheduleId!.Value).Distinct().ToList();

        var courses = courseIds.Count == 0
            ? new Dictionary<long, string>()
            : (await uow.GetRepository<Course>().GetAllAsync(new QuerySpecification<Course>(c => courseIds.Contains(c.CourseId))))
                .ToDictionary(c => c.CourseId, c => c.Title);
        var programs = programIds.Count == 0
            ? new Dictionary<long, string>()
            : (await uow.GetRepository<AndalusiaApp.Models.Program>().GetAllAsync(
                    new QuerySpecification<AndalusiaApp.Models.Program>(p => programIds.Contains(p.ProgramId))))
                .ToDictionary(p => p.ProgramId, p => p.Title);
        var labels = await StaffScope.LabelsAsync(uow, scheduleIds);

        var result = new Dictionary<long, (string Title, string? Batch)>();
        foreach (var e in enrollments)
        {
            var title = e.CourseId.HasValue && courses.TryGetValue(e.CourseId.Value, out var c) ? c
                : e.ProgramId.HasValue && programs.TryGetValue(e.ProgramId.Value, out var p) ? p
                : "—";
            string? batch = e.ScheduleId.HasValue && labels.TryGetValue(e.ScheduleId.Value, out var l) ? l.BatchCode : null;
            result[e.EnrollmentId] = (title, batch);
        }
        return result;
    }

    private async Task<IReadOnlyList<StaffStudentEnrollmentDto>> ToEnrollmentDtosAsync(IReadOnlyCollection<Enrollment> enrollments)
    {
        var titles = await EnrollmentTitlesAsync(enrollments);
        return enrollments
            .OrderByDescending(e => e.EnrolledAt)
            .Select(e =>
            {
                var t = titles.GetValueOrDefault(e.EnrollmentId);
                return new StaffStudentEnrollmentDto(e.EnrollmentId, e.Status.ToString(), e.EnrolledAt, e.CourseId,
                    e.ProgramId, e.ScheduleId, t.Title ?? "—", t.Batch);
            })
            .ToList();
    }

    private static Error StudentNotFound => Error.NotFound("Student.NotFound", "Student not found.");
}

/// <summary>Pure progress math (see <see cref="StudentProgressDto"/> for the definitions).</summary>
internal static class ProgressCalculator
{
    /// <param name="sessions">Sessions of the enrollment's schedule.</param>
    /// <param name="attendance">Attendance rows of THIS learner (rows of other sessions are ignored).</param>
    /// <param name="assignments">Assignments of the enrollment's schedule.</param>
    /// <param name="submissions">Submissions of THIS learner (rows of other assignments are ignored).</param>
    public static StudentProgressDto Compute(
        Enrollment enrollment, string title, string? batch,
        IReadOnlyCollection<Session> sessions, IReadOnlyCollection<Attendance> attendance,
        IReadOnlyCollection<Assignment> assignments, IReadOnlyCollection<AssignmentSubmission> submissions)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var sessionIds = sessions.Select(s => s.SessionId).ToHashSet();
        var mine = attendance.Where(a => sessionIds.Contains(a.SessionId)).ToList();

        int present = mine.Count(a => a.Status == AttendanceStatus.Present);
        int late = mine.Count(a => a.Status == AttendanceStatus.Late);
        int absent = mine.Count(a => a.Status == AttendanceStatus.Absent);
        int excused = mine.Count(a => a.Status == AttendanceStatus.Excused);
        int counted = present + late + absent;
        decimal attendanceRate = counted == 0 ? 0m : Math.Round((present + late) * 100m / counted, 1);

        var assignmentById = assignments.ToDictionary(a => a.AssignmentId);
        var byAssignment = submissions
            .Where(s => assignmentById.ContainsKey(s.AssignmentId))
            .GroupBy(s => s.AssignmentId)
            .ToList();
        int submitted = byAssignment.Count;

        var scorePercents = new List<decimal>();
        foreach (var group in byAssignment)
        {
            var graded = group.Where(s => s.Score.HasValue).OrderByDescending(s => s.AttemptNumber).FirstOrDefault();
            var max = assignmentById[group.Key].MaxScore;
            if (graded is not null && max > 0)
                scorePercents.Add(graded.Score!.Value * 100m / max);
        }
        decimal? averageScore = scorePercents.Count == 0 ? null : Math.Round(scorePercents.Average(), 1);

        var components = new List<decimal>();
        if (counted > 0) components.Add(attendanceRate);
        if (assignments.Count > 0) components.Add(submitted * 100m / assignments.Count);
        decimal overall = components.Count == 0 ? 0m : Math.Round(components.Average(), 1);

        return new StudentProgressDto(
            enrollment.EnrollmentId, enrollment.ScheduleId, title, batch, enrollment.Status.ToString(),
            sessions.Count, sessions.Count(s => s.SessionDate <= today), present, late, absent, excused, attendanceRate,
            assignments.Count, submitted, scorePercents.Count, averageScore, overall);
    }
}
