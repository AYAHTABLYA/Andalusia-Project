using Andalusia.Domain.Contracts;
using Andalusia.Domain.Enums;
using Andalusia.Services.Specification;
using Andalusia.ServicesAbstraction;
using Andalusia.Shared;
using Andalusia.Shared.CommonResult;
using Andalusia.Shared.Dtos.StaffDtos;
using AndalusiaApp.Models;

namespace Andalusia.Services;

public sealed class StaffSessionService(IUnitOfWork uow) : IStaffSessionService
{
    // ------------------------------------------------------------------ sessions

    public async Task<Result<StaffSessionDto>> GetSessionAsync(StaffActor actor, long id, CancellationToken ct = default)
    {
        var session = await uow.GetRepository<Session>().GetByIdAsync(id);
        if (session is null) return Result<StaffSessionDto>.Fail(SessionNotFound);
        if (!await StaffScope.CanAccessScheduleAsync(uow, actor, session.ScheduleId))
            return Result<StaffSessionDto>.Fail(NotYourSchedule);

        return Result<StaffSessionDto>.Ok(await ToDtoAsync(session));
    }

    public async Task<Result<StaffSessionDto>> CreateSessionAsync(StaffActor actor, CreateSessionDto dto, CancellationToken ct = default)
    {
        var invalid = ValidateTimes(dto.Title, dto.StartTime, dto.EndTime);
        if (invalid is not null) return Result<StaffSessionDto>.Fail(invalid);

        var schedule = await uow.GetRepository<Schedule>().GetByIdAsync(dto.ScheduleId);
        if (schedule is null) return Result<StaffSessionDto>.Fail(ScheduleNotFound);
        if (!await StaffScope.CanAccessScheduleAsync(uow, actor, schedule.ScheduleId))
            return Result<StaffSessionDto>.Fail(NotYourSchedule);

        var scheduleError = ValidateAgainstSchedule(schedule, dto.Date);
        if (scheduleError is not null) return Result<StaffSessionDto>.Fail(scheduleError);

        var session = new Session
        {
            ScheduleId = schedule.ScheduleId,
            Title = dto.Title.Trim(),
            SessionDate = dto.Date,
            StartTime = dto.StartTime,
            EndTime = dto.EndTime,
            RoomDetails = dto.RoomDetails?.Trim() ?? ""
        };

        await uow.GetRepository<Session>().AddAsync(session);
        await uow.SaveChangesAsync();
        return Result<StaffSessionDto>.Ok(await ToDtoAsync(session));
    }

    public async Task<Result<StaffSessionDto>> UpdateSessionAsync(StaffActor actor, long id, UpdateSessionDto dto, CancellationToken ct = default)
    {
        var invalid = ValidateTimes(dto.Title, dto.StartTime, dto.EndTime);
        if (invalid is not null) return Result<StaffSessionDto>.Fail(invalid);

        var repo = uow.GetRepository<Session>();
        var session = await repo.GetByIdAsync(id);
        if (session is null) return Result<StaffSessionDto>.Fail(SessionNotFound);
        if (!await StaffScope.CanAccessScheduleAsync(uow, actor, session.ScheduleId))
            return Result<StaffSessionDto>.Fail(NotYourSchedule);

        var schedule = await uow.GetRepository<Schedule>().GetByIdAsync(session.ScheduleId);
        if (schedule is not null)
        {
            var scheduleError = ValidateAgainstSchedule(schedule, dto.Date);
            if (scheduleError is not null) return Result<StaffSessionDto>.Fail(scheduleError);
        }

        session.Title = dto.Title.Trim();
        session.SessionDate = dto.Date;
        session.StartTime = dto.StartTime;
        session.EndTime = dto.EndTime;
        session.RoomDetails = dto.RoomDetails?.Trim() ?? "";

        repo.Update(session);
        await uow.SaveChangesAsync();
        return Result<StaffSessionDto>.Ok(await ToDtoAsync(session));
    }

    public async Task<Result> DeleteSessionAsync(StaffActor actor, long id, CancellationToken ct = default)
    {
        var repo = uow.GetRepository<Session>();
        var session = await repo.GetByIdAsync(id);
        if (session is null) return Result.Fail(SessionNotFound);
        if (!await StaffScope.CanAccessScheduleAsync(uow, actor, session.ScheduleId))
            return Result.Fail(NotYourSchedule);

        var marked = await uow.GetRepository<Attendance>()
            .CountAsync(new QuerySpecification<Attendance>(a => a.SessionId == id));
        if (marked > 0)
            return Result.Fail(Error.Conflict("Session.HasAttendance",
                "This session already has attendance records and cannot be deleted."));

        repo.Remove(session);
        await uow.SaveChangesAsync();
        return Result.Ok();
    }

    // ------------------------------------------------------------------ attendance

    public async Task<Result<SessionAttendanceDto>> GetSessionAttendanceAsync(StaffActor actor, long sessionId, CancellationToken ct = default)
    {
        var session = await uow.GetRepository<Session>().GetByIdAsync(sessionId);
        if (session is null) return Result<SessionAttendanceDto>.Fail(SessionNotFound);
        if (!await StaffScope.CanAccessScheduleAsync(uow, actor, session.ScheduleId))
            return Result<SessionAttendanceDto>.Fail(NotYourSchedule);

        return Result<SessionAttendanceDto>.Ok(await BuildAttendanceAsync(session));
    }

    public async Task<Result<SessionAttendanceDto>> SaveSessionAttendanceAsync(
        StaffActor actor, long sessionId, SaveAttendanceDto dto, CancellationToken ct = default)
    {
        var session = await uow.GetRepository<Session>().GetByIdAsync(sessionId);
        if (session is null) return Result<SessionAttendanceDto>.Fail(SessionNotFound);
        if (!await StaffScope.CanAccessScheduleAsync(uow, actor, session.ScheduleId))
            return Result<SessionAttendanceDto>.Fail(NotYourSchedule);

        if (dto.Entries is null || dto.Entries.Count == 0)
            return Result<SessionAttendanceDto>.Fail(Error.Validation("Attendance.Empty", "At least one attendance entry is required."));

        var parsed = new Dictionary<long, AttendanceStatus>();
        foreach (var entry in dto.Entries)
        {
            if (!TryParseStatus(entry.Status, out var status))
                return Result<SessionAttendanceDto>.Fail(Error.Validation("Attendance.Status",
                    $"'{entry.Status}' is not a valid status. Use Present, Absent, Late or Excused."));
            if (!parsed.TryAdd(entry.LearnerId, status))
                return Result<SessionAttendanceDto>.Fail(Error.Validation("Attendance.Duplicate",
                    $"Learner {entry.LearnerId} appears more than once."));
        }

        var roster = await RosterIdsAsync(session.ScheduleId);
        var outsiders = parsed.Keys.Where(l => !roster.Contains(l)).ToList();
        if (outsiders.Count > 0)
            return Result<SessionAttendanceDto>.Fail(Error.Validation("Attendance.NotEnrolled",
                $"Learner(s) {string.Join(", ", outsiders)} are not enrolled in this schedule."));

        var repo = uow.GetRepository<Attendance>();
        var existing = (await repo.GetAllAsync(
            new QuerySpecification<Attendance>(a => a.SessionId == sessionId), trackChanges: true))
            .ToDictionary(a => a.LearnerId);

        var now = DateTime.UtcNow;
        foreach (var (learnerId, status) in parsed)
        {
            if (existing.TryGetValue(learnerId, out var record))
            {
                record.Status = status;
                record.MarkedAt = now;
            }
            else
            {
                await repo.AddAsync(new Attendance
                {
                    SessionId = sessionId,
                    LearnerId = learnerId,
                    Status = status,
                    MarkedAt = now
                });
            }
        }

        await uow.SaveChangesAsync();
        return Result<SessionAttendanceDto>.Ok(await BuildAttendanceAsync(session));
    }

    public async Task<Result<PaginatedResult<AttendanceRecordDto>>> QueryAttendanceAsync(
        StaffActor actor, long? scheduleId, long? sessionId, long? learnerId, string? status,
        DateOnly? from, DateOnly? to, int page, int pageSize, CancellationToken ct = default)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var hasStatus = !string.IsNullOrWhiteSpace(status);
        var statusValue = AttendanceStatus.Present;
        if (hasStatus && !TryParseStatus(status!, out statusValue))
            return Result<PaginatedResult<AttendanceRecordDto>>.Fail(Error.Validation("Attendance.Status",
                $"'{status}' is not a valid status. Use Present, Absent, Late or Excused."));

        var isAdmin = actor.IsAdmin;
        var allowed = isAdmin ? new HashSet<long>() : await StaffScope.InstructorScheduleIdsAsync(uow, actor.UserId);
        var allowedList = allowed.ToList();

        var hasSchedule = scheduleId.HasValue; var scheduleV = scheduleId.GetValueOrDefault();
        var hasSession = sessionId.HasValue; var sessionV = sessionId.GetValueOrDefault();
        var hasLearner = learnerId.HasValue; var learnerV = learnerId.GetValueOrDefault();
        var hasFrom = from.HasValue; var fromV = from.GetValueOrDefault();
        var hasTo = to.HasValue; var toV = to.GetValueOrDefault();

        System.Linq.Expressions.Expression<Func<Attendance, bool>> criteria = a =>
            (isAdmin || allowedList.Contains(a.Session.ScheduleId)) &&
            (!hasSchedule || a.Session.ScheduleId == scheduleV) &&
            (!hasSession || a.SessionId == sessionV) &&
            (!hasLearner || a.LearnerId == learnerV) &&
            (!hasStatus || a.Status == statusValue) &&
            (!hasFrom || a.Session.SessionDate >= fromV) &&
            (!hasTo || a.Session.SessionDate <= toV);

        var repo = uow.GetRepository<Attendance>();
        var total = await repo.CountAsync(new QuerySpecification<Attendance>(criteria));
        var rows = (await repo.GetAllAsync(
            new QuerySpecification<Attendance>(criteria).OrderByDesc(a => a.AttendanceId).Page((page - 1) * pageSize, pageSize))).ToList();

        var dtos = await ToRecordDtosAsync(rows);
        return Result<PaginatedResult<AttendanceRecordDto>>.Ok(new PaginatedResult<AttendanceRecordDto>(page, pageSize, total, dtos));
    }

    // ------------------------------------------------------------------ helpers

    private async Task<IReadOnlyList<AttendanceRecordDto>> ToRecordDtosAsync(IReadOnlyCollection<Attendance> rows)
    {
        if (rows.Count == 0) return [];

        var sessionIds = rows.Select(r => r.SessionId).Distinct().ToList();
        var sessions = (await uow.GetRepository<Session>()
            .GetAllAsync(new QuerySpecification<Session>(s => sessionIds.Contains(s.SessionId))))
            .ToDictionary(s => s.SessionId);
        var labels = await StaffScope.LabelsAsync(uow, sessions.Values.Select(s => s.ScheduleId).Distinct().ToList());
        var users = await StaffScope.UsersAsync(uow, rows.Select(r => r.LearnerId).Distinct().ToList());

        var result = new List<AttendanceRecordDto>();
        foreach (var r in rows)
        {
            if (!sessions.TryGetValue(r.SessionId, out var s)) continue;
            var label = labels.GetValueOrDefault(s.ScheduleId) ?? new ScheduleLabel("—", "");
            var name = users.TryGetValue(r.LearnerId, out var u) ? StaffScope.FullName(u) : "Learner";
            result.Add(new AttendanceRecordDto(r.AttendanceId, s.SessionId, s.Title, s.SessionDate, s.ScheduleId,
                label.Title, r.LearnerId, name, r.Status.ToString(), r.MarkedAt));
        }
        return result;
    }

    private async Task<HashSet<long>> RosterIdsAsync(long scheduleId)
    {
        var enrollments = await uow.GetRepository<Enrollment>().GetAllAsync(new QuerySpecification<Enrollment>(
            e => e.ScheduleId == scheduleId && e.Status != EnrollmentStatus.Cancelled));
        return enrollments.Select(e => e.UserId).ToHashSet();
    }

    private async Task<SessionAttendanceDto> BuildAttendanceAsync(Session session)
    {
        var roster = await RosterIdsAsync(session.ScheduleId);
        var users = await StaffScope.UsersAsync(uow, roster);
        var records = (await uow.GetRepository<Attendance>()
            .GetAllAsync(new QuerySpecification<Attendance>(a => a.SessionId == session.SessionId)))
            .ToDictionary(a => a.LearnerId);
        var labels = await StaffScope.LabelsAsync(uow, [session.ScheduleId]);
        var label = labels.GetValueOrDefault(session.ScheduleId) ?? new ScheduleLabel("—", "");

        var learners = roster
            .Where(users.ContainsKey)
            .Select(id =>
            {
                var u = users[id];
                records.TryGetValue(id, out var rec);
                return new AttendanceRowDto(id, StaffScope.FullName(u), u.Email, rec?.Status.ToString(), rec?.MarkedAt);
            })
            .OrderBy(l => l.Name)
            .ToList();

        return new SessionAttendanceDto(session.SessionId, session.Title, session.SessionDate, session.ScheduleId,
            label.Title, label.BatchCode, learners);
    }

    private async Task<StaffSessionDto> ToDtoAsync(Session s)
    {
        var labels = await StaffScope.LabelsAsync(uow, [s.ScheduleId]);
        var label = labels.GetValueOrDefault(s.ScheduleId) ?? new ScheduleLabel("Program session", "");
        return new StaffSessionDto(s.SessionId, s.Title, s.SessionDate, s.StartTime, s.EndTime, s.RoomDetails,
            s.ScheduleId, label.Title, label.BatchCode);
    }

    private static Error? ValidateTimes(string title, TimeOnly start, TimeOnly end)
    {
        if (string.IsNullOrWhiteSpace(title))
            return Error.Validation("Session.Title", "Title is required.");
        if (end <= start)
            return Error.Validation("Session.Time", "EndTime must be after StartTime.");
        return null;
    }

    private static Error? ValidateAgainstSchedule(Schedule schedule, DateOnly date)
    {
        if (schedule.Status == ScheduleStatus.Cancelled)
            return Error.Conflict("Schedule.Cancelled", "Sessions cannot be added to a cancelled schedule.");
        if (date < schedule.StartDate || date > schedule.EndDate)
            return Error.Validation("Session.Date",
                $"Session date must be within the schedule dates ({schedule.StartDate:yyyy-MM-dd} to {schedule.EndDate:yyyy-MM-dd}).");
        return null;
    }

    private static bool TryParseStatus(string value, out AttendanceStatus status) =>
        Enum.TryParse(value?.Trim(), ignoreCase: true, out status) && Enum.IsDefined(status) && !int.TryParse(value, out _);

    private static Error SessionNotFound => Error.NotFound("Session.NotFound", "Session not found.");
    private static Error ScheduleNotFound => Error.NotFound("Schedule.NotFound", "Schedule not found.");
    private static Error NotYourSchedule => Error.Forbidden("Schedule.Forbidden", "You do not teach this schedule.");
}
