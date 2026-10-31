using Andalusia.Domain.Contracts;
using Andalusia.Domain.Enums;
using Andalusia.Services.Specification;
using Andalusia.ServicesAbstraction;
using Andalusia.Shared;
using Andalusia.Shared.CommonResult;
using Andalusia.Shared.Dtos.AdminDtos;
using AndalusiaApp.Models;

namespace Andalusia.Services;

public sealed class ScheduleAdminService(IUnitOfWork uow) : IScheduleAdminService
{
    public async Task<PaginatedResult<AdminScheduleDto>> GetSchedulesAsync(
        string? search, long? courseId, long? programId, string? status, int page, int pageSize, CancellationToken ct = default)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var s = search?.Trim() ?? "";
        var hasSearch = s.Length > 0;
        var hasCourse = courseId.HasValue; var courseV = courseId.GetValueOrDefault();
        var hasProgram = programId.HasValue; var programV = programId.GetValueOrDefault();
        var hasStatus = TryParseStatus(status, out var statusV);

        System.Linq.Expressions.Expression<Func<Schedule, bool>> criteria = x =>
            (!hasSearch || x.BatchCode.Contains(s)
                || (x.Course != null && x.Course.Title.Contains(s))
                || (x.Program != null && x.Program.Title.Contains(s))) &&
            (!hasCourse || x.CourseId == courseV) &&
            (!hasProgram || x.ProgramId == programV) &&
            (!hasStatus || x.Status == statusV);

        var repo = uow.GetRepository<Schedule>();
        var total = await repo.CountAsync(new QuerySpecification<Schedule>(criteria));
        var rows = (await repo.GetAllAsync(new QuerySpecification<Schedule>(criteria)
            .OrderByDesc(x => x.ScheduleId)
            .Page((page - 1) * pageSize, pageSize))).ToList();

        return new PaginatedResult<AdminScheduleDto>(page, pageSize, total, await ToDtosAsync(rows));
    }

    public async Task<Result<AdminScheduleDto>> GetScheduleAsync(long id, CancellationToken ct = default)
    {
        var schedule = await uow.GetRepository<Schedule>().GetByIdAsync(id);
        if (schedule is null) return Result<AdminScheduleDto>.Fail(NotFound);
        return Result<AdminScheduleDto>.Ok((await ToDtosAsync([schedule]))[0]);
    }

    public async Task<Result<AdminScheduleDto>> CreateScheduleAsync(CreateScheduleDto dto, CancellationToken ct = default)
    {
        // Matches CK_Schedules_CourseXorProgram: exactly one of course / program.
        if (dto.CourseId.HasValue == dto.ProgramId.HasValue)
            return Result<AdminScheduleDto>.Fail(Error.Validation("Schedule.Target", "Provide exactly one of CourseId or ProgramId."));

        if (dto.CourseId is long courseId && await uow.GetRepository<Course>().GetByIdAsync(courseId) is null)
            return Result<AdminScheduleDto>.Fail(Error.NotFound("Course.NotFound", "Course not found."));
        if (dto.ProgramId is long programId && await uow.GetRepository<AndalusiaApp.Models.Program>().GetByIdAsync(programId) is null)
            return Result<AdminScheduleDto>.Fail(Error.NotFound("Program.NotFound", "Program not found."));

        var common = ValidateCommon(dto.BatchCode, dto.StartDate, dto.EndDate, dto.Status, out var status);
        if (common is not null) return Result<AdminScheduleDto>.Fail(common);

        var instructorError = await ValidateInstructorsAsync(dto.InstructorIds);
        if (instructorError is not null) return Result<AdminScheduleDto>.Fail(instructorError);

        var schedule = new Schedule
        {
            CourseId = dto.CourseId,
            ProgramId = dto.ProgramId,
            BatchCode = dto.BatchCode.Trim(),
            VenueName = dto.VenueName?.Trim() ?? "",
            RoomNumber = dto.RoomNumber?.Trim() ?? "",
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            Capacity = dto.Capacity,
            Status = status
        };
        foreach (var instructorId in (dto.InstructorIds ?? []).Distinct())
            schedule.ScheduleInstructors.Add(new ScheduleInstructor { InstructorId = instructorId });

        await uow.GetRepository<Schedule>().AddAsync(schedule);
        await uow.SaveChangesAsync();
        return Result<AdminScheduleDto>.Ok((await ToDtosAsync([schedule]))[0]);
    }

    public async Task<Result<AdminScheduleDto>> UpdateScheduleAsync(long id, UpdateScheduleDto dto, CancellationToken ct = default)
    {
        var repo = uow.GetRepository<Schedule>();
        var schedule = await repo.GetByIdAsync(id);
        if (schedule is null) return Result<AdminScheduleDto>.Fail(NotFound);

        var common = ValidateCommon(dto.BatchCode, dto.StartDate, dto.EndDate, dto.Status, out var status);
        if (common is not null) return Result<AdminScheduleDto>.Fail(common);

        var enrolled = await EnrolledCountAsync(id);
        if (dto.Capacity > 0 && dto.Capacity < enrolled)
            return Result<AdminScheduleDto>.Fail(Error.Conflict("Schedule.Capacity",
                $"Capacity cannot be lower than the number of enrolled learners ({enrolled})."));

        if (dto.InstructorIds is not null)
        {
            var instructorError = await ValidateInstructorsAsync(dto.InstructorIds);
            if (instructorError is not null) return Result<AdminScheduleDto>.Fail(instructorError);
        }

        schedule.BatchCode = dto.BatchCode.Trim();
        schedule.VenueName = dto.VenueName?.Trim() ?? "";
        schedule.RoomNumber = dto.RoomNumber?.Trim() ?? "";
        schedule.StartDate = dto.StartDate;
        schedule.EndDate = dto.EndDate;
        schedule.Capacity = dto.Capacity;
        // Status is only changed when the caller sent one; an empty value keeps the current status.
        if (!string.IsNullOrWhiteSpace(dto.Status)) schedule.Status = status;

        repo.Update(schedule);
        if (dto.InstructorIds is not null) await ReplaceInstructorsAsync(id, dto.InstructorIds);

        await uow.SaveChangesAsync();
        return Result<AdminScheduleDto>.Ok((await ToDtosAsync([schedule]))[0]);
    }

    public async Task<Result> DeleteScheduleAsync(long id, CancellationToken ct = default)
    {
        var repo = uow.GetRepository<Schedule>();
        var schedule = await repo.GetByIdAsync(id);
        if (schedule is null) return Result.Fail(NotFound);

        var blockers = new List<string>();
        if (await uow.GetRepository<Session>().CountAsync(new QuerySpecification<Session>(x => x.ScheduleId == id)) > 0) blockers.Add("sessions");
        if (await uow.GetRepository<Enrollment>().CountAsync(new QuerySpecification<Enrollment>(x => x.ScheduleId == id)) > 0) blockers.Add("enrollments");
        if (await uow.GetRepository<Assignment>().CountAsync(new QuerySpecification<Assignment>(x => x.ScheduleId == id)) > 0) blockers.Add("assignments");
        if (await uow.GetRepository<CourseMaterial>().CountAsync(new QuerySpecification<CourseMaterial>(x => x.ScheduleId == id)) > 0) blockers.Add("materials");
        if (await uow.GetRepository<InstructorPayout>().CountAsync(new QuerySpecification<InstructorPayout>(x => x.ScheduleId == id)) > 0) blockers.Add("payouts");
        if (await uow.GetRepository<Application>().CountAsync(new QuerySpecification<Application>(x => x.ScheduleId == id)) > 0) blockers.Add("applications");

        if (blockers.Count > 0)
            return Result.Fail(Error.Conflict("Schedule.HasRelatedRecords",
                $"This schedule has {string.Join(", ", blockers)} and cannot be deleted. Set its status to Cancelled instead."));

        repo.Remove(schedule);
        await uow.SaveChangesAsync();
        return Result.Ok();
    }

    public async Task<Result<AdminScheduleDto>> SetInstructorsAsync(long scheduleId, SetScheduleInstructorsDto dto, CancellationToken ct = default)
    {
        var schedule = await uow.GetRepository<Schedule>().GetByIdAsync(scheduleId);
        if (schedule is null) return Result<AdminScheduleDto>.Fail(NotFound);

        var error = await ValidateInstructorsAsync(dto.InstructorIds);
        if (error is not null) return Result<AdminScheduleDto>.Fail(error);

        await ReplaceInstructorsAsync(scheduleId, dto.InstructorIds);
        await uow.SaveChangesAsync();
        return Result<AdminScheduleDto>.Ok((await ToDtosAsync([schedule]))[0]);
    }

    public async Task<Result<IReadOnlyList<AdminScheduleDto>>> GetInstructorSchedulesAsync(long instructorId, CancellationToken ct = default)
    {
        if (await uow.GetRepository<Instructor>().GetByIdAsync(instructorId) is null)
            return Result<IReadOnlyList<AdminScheduleDto>>.Fail(Error.NotFound("Instructor.NotFound", "Instructor not found."));

        var links = await uow.GetRepository<ScheduleInstructor>()
            .GetAllAsync(new QuerySpecification<ScheduleInstructor>(l => l.InstructorId == instructorId));
        var scheduleIds = links.Select(l => l.ScheduleId).ToList();

        var schedules = scheduleIds.Count == 0
            ? new List<Schedule>()
            : (await uow.GetRepository<Schedule>().GetAllAsync(
                new QuerySpecification<Schedule>(s => scheduleIds.Contains(s.ScheduleId)).OrderByDesc(s => s.StartDate))).ToList();

        return Result<IReadOnlyList<AdminScheduleDto>>.Ok(await ToDtosAsync(schedules));
    }

    // ------------------------------------------------------------------ helpers

    /// <summary>Makes the schedule's instructor set exactly equal to <paramref name="instructorIds"/> (caller saves).</summary>
    private async Task ReplaceInstructorsAsync(long scheduleId, IReadOnlyList<long> instructorIds)
    {
        var wanted = instructorIds.Distinct().ToHashSet();
        var repo = uow.GetRepository<ScheduleInstructor>();
        var existing = (await repo.GetAllAsync(
            new QuerySpecification<ScheduleInstructor>(l => l.ScheduleId == scheduleId), trackChanges: true)).ToList();

        foreach (var link in existing.Where(l => !wanted.Contains(l.InstructorId)))
            repo.Remove(link);

        var have = existing.Select(l => l.InstructorId).ToHashSet();
        foreach (var id in wanted.Where(id => !have.Contains(id)))
            await repo.AddAsync(new ScheduleInstructor { ScheduleId = scheduleId, InstructorId = id });
    }

    /// <summary>Every id must be an existing, active instructor.</summary>
    private async Task<Error?> ValidateInstructorsAsync(IReadOnlyList<long>? ids)
    {
        var list = (ids ?? []).Distinct().ToList();
        if (list.Count == 0) return null;

        var instructors = (await uow.GetRepository<Instructor>().GetAllAsync(
            new QuerySpecification<Instructor>(i => list.Contains(i.InstructorId)).Include(i => i.User))).ToList();

        var missing = list.Except(instructors.Select(i => i.InstructorId)).ToList();
        if (missing.Count > 0)
            return Error.Validation("Schedule.Instructors", $"Instructor(s) not found: {string.Join(", ", missing)}.");

        var inactive = instructors.Where(i => !i.User.IsActive).Select(i => i.InstructorId).ToList();
        if (inactive.Count > 0)
            return Error.Validation("Schedule.Instructors", $"Instructor(s) are deactivated: {string.Join(", ", inactive)}.");

        return null;
    }

    private async Task<int> EnrolledCountAsync(long scheduleId) =>
        await uow.GetRepository<Enrollment>().CountAsync(
            new QuerySpecification<Enrollment>(e => e.ScheduleId == scheduleId && e.Status != EnrollmentStatus.Cancelled));

    private async Task<IReadOnlyList<AdminScheduleDto>> ToDtosAsync(IReadOnlyCollection<Schedule> schedules)
    {
        if (schedules.Count == 0) return [];
        var ids = schedules.Select(s => s.ScheduleId).ToList();

        var titles = await StaffScope.TargetTitlesAsync(uow, schedules);

        var links = (await uow.GetRepository<ScheduleInstructor>()
            .GetAllAsync(new QuerySpecification<ScheduleInstructor>(l => ids.Contains(l.ScheduleId)))).ToList();
        var users = await StaffScope.UsersAsync(uow, links.Select(l => l.InstructorId).Distinct().ToList());

        var enrolled = (await uow.GetRepository<Enrollment>().GetAllAsync(new QuerySpecification<Enrollment>(
                e => e.ScheduleId != null && ids.Contains(e.ScheduleId.Value) && e.Status != EnrollmentStatus.Cancelled)))
            .GroupBy(e => e.ScheduleId!.Value).ToDictionary(g => g.Key, g => g.Count());
        var sessions = (await uow.GetRepository<Session>().GetAllAsync(new QuerySpecification<Session>(s => ids.Contains(s.ScheduleId))))
            .GroupBy(s => s.ScheduleId).ToDictionary(g => g.Key, g => g.Count());

        return schedules.Select(s => new AdminScheduleDto(
            s.ScheduleId, s.CourseId, s.ProgramId, s.CourseId.HasValue ? "Course" : "Program",
            StaffScope.TitleOf(s, titles.Courses, titles.Programs), s.BatchCode, s.VenueName, s.RoomNumber,
            s.StartDate, s.EndDate, s.Capacity, enrolled.GetValueOrDefault(s.ScheduleId), sessions.GetValueOrDefault(s.ScheduleId),
            s.Status.ToString(),
            links.Where(l => l.ScheduleId == s.ScheduleId && users.ContainsKey(l.InstructorId))
                .Select(l => new ScheduleInstructorDto(l.InstructorId, StaffScope.FullName(users[l.InstructorId]), users[l.InstructorId].Email))
                .OrderBy(i => i.Name).ToList()))
            .ToList();
    }

    private static Error? ValidateCommon(string batchCode, DateOnly start, DateOnly end, string? statusText, out ScheduleStatus status)
    {
        status = ScheduleStatus.Scheduled;
        if (string.IsNullOrWhiteSpace(batchCode)) return Error.Validation("Schedule.BatchCode", "BatchCode is required.");
        if (end < start) return Error.Validation("Schedule.Dates", "EndDate cannot be before StartDate.");
        if (!string.IsNullOrWhiteSpace(statusText) && !TryParseStatus(statusText, out status))
            return Error.Validation("Schedule.Status", "Status must be Scheduled, Running, Completed or Cancelled.");
        return null;
    }

    private static bool TryParseStatus(string? text, out ScheduleStatus status)
    {
        status = ScheduleStatus.Scheduled;
        return !string.IsNullOrWhiteSpace(text)
               && Enum.TryParse(text.Trim(), ignoreCase: true, out status)
               && Enum.IsDefined(status)
               && !int.TryParse(text, out _);
    }

    private static Error NotFound => Error.NotFound("Schedule.NotFound", "Schedule not found.");
}
