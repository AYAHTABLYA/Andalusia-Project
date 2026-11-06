using Andalusia.Domain.Contracts;
using Andalusia.Domain.Enums;
using Andalusia.Domain.Models;
using Andalusia.Services.Specification;
using Andalusia.ServicesAbstraction;
using Andalusia.Shared.CommonResult;
using Andalusia.Shared.Dtos.LearnerDtos;
using Andalusia.Shared.Dtos.StaffDtos;
using AndalusiaApp.Models;

namespace Andalusia.Services;

public sealed class LearnerCourseService(IUnitOfWork uow) : ILearnerCourseService
{
    // ================================================================== GET enrollments/{id}/course

    public async Task<Result<LearnerEnrollmentCourseDto>> GetCourseAsync(long userId, long enrollmentId, CancellationToken ct = default)
    {
        var enrollment = await FindOwnEnrollmentAsync(userId, enrollmentId);
        if (enrollment is null) return Result<LearnerEnrollmentCourseDto>.Fail(EnrollmentNotFound);

        var schedule = enrollment.Schedule;
        var course = enrollment.Course;
        if (course is null && schedule?.CourseId is { } cid)
            course = await uow.GetRepository<Course>().GetByIdAsync(cid);

        Mentor? mentor = null;
        IReadOnlyList<LearnerOutcomeDto> outcomes = [];
        if (course is not null)
        {
            mentor = await uow.GetRepository<Mentor>().GetByIdAsync(course.MentorId);
            var courseId = course.CourseId;
            outcomes = (await uow.GetRepository<LearningOutcome>().GetAllAsync(
                    new QuerySpecification<LearningOutcome>(o => o.CourseId == courseId).OrderByAsc(o => o.Order)))
                .Select(o => new LearnerOutcomeDto(o.Title, o.Text))
                .ToList();
        }

        LearnerScheduleDto? scheduleDto = null;
        if (schedule is not null)
        {
            scheduleDto = new LearnerScheduleDto(
                schedule.ScheduleId, schedule.BatchCode, schedule.StartDate, schedule.EndDate,
                schedule.Status.ToString(), await InstructorsOfAsync(schedule.ScheduleId));
        }

        var title = course?.Title ?? enrollment.Program?.Title ?? "—";
        var dto = new LearnerEnrollmentCourseDto(
            enrollment.EnrollmentId, enrollment.Status.ToString(), enrollment.EnrolledAt,
            course?.CourseId, course?.Slug, title, course?.Description, course?.Category, course?.Level,
            course?.DurationLabel, course?.Accreditation, course?.SyllabusPath,
            mentor?.Name, mentor?.Title,
            outcomes, scheduleDto,
            new LearnerLocationDto(course?.DeliveryMode, course?.Hall, schedule?.VenueName, schedule?.RoomNumber));

        return Result<LearnerEnrollmentCourseDto>.Ok(dto);
    }

    // ================================================================== GET enrollments/{id}/materials

    public async Task<Result<IReadOnlyList<LearnerMaterialDto>>> GetMaterialsAsync(long userId, long enrollmentId, CancellationToken ct = default)
    {
        var access = await OpenContentAsync(userId, enrollmentId);
        if (access.Failure is not null) return Result<IReadOnlyList<LearnerMaterialDto>>.Fail(access.Failure);
        var enrollment = access.Enrollment!;

        var courseId = enrollment.CourseId ?? enrollment.Schedule?.CourseId;
        if (courseId is null) return Result<IReadOnlyList<LearnerMaterialDto>>.Ok([]);

        var cid = courseId.Value;
        var scheduleId = enrollment.ScheduleId;
        // Course-wide materials (ScheduleId == null) + materials attached to the learner's own batch. Never other batches'.
        var materials = await uow.GetRepository<CourseMaterial>().GetAllAsync(
            new QuerySpecification<CourseMaterial>(m =>
                    m.CourseId == cid && (m.ScheduleId == null || m.ScheduleId == scheduleId))
                .OrderByDesc(m => m.MaterialId));

        IReadOnlyList<LearnerMaterialDto> dtos = materials
            .Select(m => new LearnerMaterialDto(m.MaterialId, m.Title, m.FileUrl, m.ResourceType.ToString(), m.UploadedAt, m.ScheduleId))
            .ToList();
        return Result<IReadOnlyList<LearnerMaterialDto>>.Ok(dtos);
    }

    // ================================================================== GET enrollments/{id}/sessions

    public async Task<Result<IReadOnlyList<LearnerSessionDto>>> GetSessionsAsync(long userId, long enrollmentId, CancellationToken ct = default)
    {
        var access = await OpenContentAsync(userId, enrollmentId);
        if (access.Failure is not null) return Result<IReadOnlyList<LearnerSessionDto>>.Fail(access.Failure);

        var sessions = await SessionsAsync(access.Enrollment!);
        var attendance = await AttendanceByLearnerAsync(userId, sessions);
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        IReadOnlyList<LearnerSessionDto> dtos = sessions
            .Select(s => new LearnerSessionDto(
                s.SessionId, s.Title, s.SessionDate, s.StartTime, s.EndTime, s.RoomDetails,
                s.SessionDate < today, AttendanceLabel(attendance, s.SessionId)))
            .ToList();
        return Result<IReadOnlyList<LearnerSessionDto>>.Ok(dtos);
    }

    // ================================================================== GET enrollments/{id}/assignments

    public async Task<Result<IReadOnlyList<LearnerAssignmentDto>>> GetAssignmentsAsync(long userId, long enrollmentId, CancellationToken ct = default)
    {
        var access = await OpenContentAsync(userId, enrollmentId);
        if (access.Failure is not null) return Result<IReadOnlyList<LearnerAssignmentDto>>.Fail(access.Failure);

        var assignments = await AssignmentsAsync(access.Enrollment!);
        var submissions = await SubmissionsByLearnerAsync(userId, assignments);
        var now = DateTime.UtcNow;

        IReadOnlyList<LearnerAssignmentDto> dtos = assignments
            .Select(a =>
            {
                var mine = submissions.Where(s => s.AssignmentId == a.AssignmentId).OrderByDescending(s => s.AttemptNumber).ToList();
                var latest = mine.FirstOrDefault();
                return new LearnerAssignmentDto(
                    a.AssignmentId, a.Title, a.Description, a.DueDate, a.MaxScore, a.DueDate < now && latest is null,
                    SubmissionLabel(latest), mine.Count, latest?.SubmittedAt, latest?.Score);
            })
            .ToList();
        return Result<IReadOnlyList<LearnerAssignmentDto>>.Ok(dtos);
    }

    // ================================================================== GET assignments/{id}

    public async Task<Result<LearnerAssignmentDetailDto>> GetAssignmentAsync(long userId, long assignmentId, CancellationToken ct = default)
    {
        var found = await FindAssignmentForLearnerAsync(userId, assignmentId);
        if (found.Failure is not null) return Result<LearnerAssignmentDetailDto>.Fail(found.Failure);
        var (assignment, enrollment) = (found.Assignment!, found.Enrollment!);

        var submissions = await SubmissionsByLearnerAsync(userId, [assignment]);
        var ordered = submissions.OrderByDescending(s => s.AttemptNumber).ToList();
        var canSubmit = CanSubmit(enrollment, ordered.FirstOrDefault());

        var dto = new LearnerAssignmentDetailDto(
            assignment.AssignmentId, enrollment.EnrollmentId, assignment.Title, assignment.Description,
            assignment.DueDate, assignment.MaxScore, assignment.DueDate < DateTime.UtcNow && ordered.Count == 0,
            canSubmit, ordered.Select(ToSubmissionDto).ToList());
        return Result<LearnerAssignmentDetailDto>.Ok(dto);
    }

    // ================================================================== POST assignments/{id}/submit

    public async Task<Result<LearnerSubmissionDto>> SubmitAssignmentAsync(
        long userId, long assignmentId, SubmitAssignmentDto dto, CancellationToken ct = default)
    {
        var invalid = ValidateFileUrl(dto?.FileUrl);
        if (invalid is not null) return Result<LearnerSubmissionDto>.Fail(invalid);

        var found = await FindAssignmentForLearnerAsync(userId, assignmentId);
        if (found.Failure is not null) return Result<LearnerSubmissionDto>.Fail(found.Failure);
        var (assignment, enrollment) = (found.Assignment!, found.Enrollment!);

        if (enrollment.Status is EnrollmentStatus.Completed or EnrollmentStatus.Cancelled)
            return Result<LearnerSubmissionDto>.Fail(Error.Conflict("Assignment.EnrollmentClosed",
                "This enrollment is no longer open for submissions."));

        var previous = (await SubmissionsByLearnerAsync(userId, [assignment]))
            .OrderByDescending(s => s.AttemptNumber).FirstOrDefault();
        if (previous?.Score is not null)
            return Result<LearnerSubmissionDto>.Fail(Error.Conflict("Assignment.AlreadyGraded",
                "Your latest submission has already been graded, so it can't be replaced."));

        var now = DateTime.UtcNow;
        var submission = new AssignmentSubmission
        {
            AssignmentId = assignment.AssignmentId,
            LearnerId = userId,
            AttemptNumber = (previous?.AttemptNumber ?? 0) + 1,
            FileUrl = dto!.FileUrl.Trim(),
            Status = now > assignment.DueDate ? AssignmentSubmissionStatus.Late : AssignmentSubmissionStatus.Submitted,
            SubmittedAt = now
        };

        await uow.GetRepository<AssignmentSubmission>().AddAsync(submission);
        await uow.SaveChangesAsync();

        return Result<LearnerSubmissionDto>.Ok(ToSubmissionDto(submission));
    }

    // ================================================================== GET enrollments/{id}/attendance

    public async Task<Result<LearnerAttendanceDto>> GetAttendanceAsync(long userId, long enrollmentId, CancellationToken ct = default)
    {
        var access = await OpenContentAsync(userId, enrollmentId);
        if (access.Failure is not null) return Result<LearnerAttendanceDto>.Fail(access.Failure);

        var sessions = await SessionsAsync(access.Enrollment!);
        var attendance = await AttendanceByLearnerAsync(userId, sessions);
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        int present = attendance.Values.Count(a => a.Status == AttendanceStatus.Present);
        int late = attendance.Values.Count(a => a.Status == AttendanceStatus.Late);
        int absent = attendance.Values.Count(a => a.Status == AttendanceStatus.Absent);
        int excused = attendance.Values.Count(a => a.Status == AttendanceStatus.Excused);
        int counted = present + late + absent; // same definition as the staff-side progress (excused doesn't count)
        var rate = counted == 0 ? 0m : Math.Round((present + late) * 100m / counted, 1);

        var records = sessions
            .Select(s => new LearnerAttendanceRecordDto(
                s.SessionId, s.Title, s.SessionDate, s.StartTime, s.EndTime, AttendanceLabel(attendance, s.SessionId)))
            .ToList();

        return Result<LearnerAttendanceDto>.Ok(new LearnerAttendanceDto(
            sessions.Count, sessions.Count(s => s.SessionDate <= today), present, late, absent, excused, rate, records));
    }

    // ================================================================== GET enrollments/{id}/progress

    public async Task<Result<StudentProgressDto>> GetProgressAsync(long userId, long enrollmentId, CancellationToken ct = default)
    {
        var access = await OpenContentAsync(userId, enrollmentId);
        if (access.Failure is not null) return Result<StudentProgressDto>.Fail(access.Failure);
        var enrollment = access.Enrollment!;

        var sessions = await SessionsAsync(enrollment);
        var attendance = (await AttendanceByLearnerAsync(userId, sessions)).Values.ToList();
        var assignments = await AssignmentsAsync(enrollment);
        var submissions = await SubmissionsByLearnerAsync(userId, assignments);

        var title = enrollment.Course?.Title ?? enrollment.Program?.Title ?? "—";
        var progress = ProgressCalculator.Compute(
            enrollment, title, enrollment.Schedule?.BatchCode, sessions, attendance, assignments, submissions);
        return Result<StudentProgressDto>.Ok(progress);
    }

    // ================================================================== helpers: access

    /// <summary>The learner's own enrollment (with Course / Program / Schedule), or null if it isn't theirs / doesn't exist.</summary>
    private async Task<Enrollment?> FindOwnEnrollmentAsync(long userId, long enrollmentId)
    {
        return await uow.GetRepository<Enrollment>().GetAsync(
            new QuerySpecification<Enrollment>(e => e.UserId == userId && e.EnrollmentId == enrollmentId)
                .Include(e => e.Course!)
                .Include(e => e.Program!)
                .Include(e => e.Schedule!));
    }

    private sealed record EnrollmentAccess(Enrollment? Enrollment, Error? Failure);

    /// <summary>Own enrollment + must not be cancelled (a cancelled learner loses access to batch content).</summary>
    private async Task<EnrollmentAccess> OpenContentAsync(long userId, long enrollmentId)
    {
        var enrollment = await FindOwnEnrollmentAsync(userId, enrollmentId);
        if (enrollment is null) return new(null, EnrollmentNotFound);
        if (enrollment.Status == EnrollmentStatus.Cancelled)
            return new(null, Error.Forbidden("Enrollment.Cancelled", "This enrollment was cancelled."));
        return new(enrollment, null);
    }

    private sealed record AssignmentAccess(Assignment? Assignment, Enrollment? Enrollment, Error? Failure);

    /// <summary>
    /// An assignment is visible only to learners holding a non-cancelled enrollment on the assignment's schedule.
    /// Anything else (unknown id, other batch, someone else's) is a plain 404 so ids can't be probed.
    /// </summary>
    private async Task<AssignmentAccess> FindAssignmentForLearnerAsync(long userId, long assignmentId)
    {
        var assignment = await uow.GetRepository<Assignment>().GetByIdAsync(assignmentId);
        if (assignment is null) return new(null, null, AssignmentNotFound);

        var scheduleId = assignment.ScheduleId;
        var enrollment = await uow.GetRepository<Enrollment>().GetAsync(
            new QuerySpecification<Enrollment>(e =>
                    e.UserId == userId && e.ScheduleId == scheduleId && e.Status != EnrollmentStatus.Cancelled)
                .OrderByDesc(e => e.EnrolledAt));
        if (enrollment is null) return new(null, null, AssignmentNotFound);

        return new(assignment, enrollment, null);
    }

    // ================================================================== helpers: data

    private async Task<List<Session>> SessionsAsync(Enrollment enrollment)
    {
        if (enrollment.ScheduleId is not { } scheduleId) return [];
        var rows = await uow.GetRepository<Session>().GetAllAsync(
            new QuerySpecification<Session>(s => s.ScheduleId == scheduleId));
        return rows.OrderBy(s => s.SessionDate).ThenBy(s => s.StartTime).ToList();
    }

    private async Task<List<Assignment>> AssignmentsAsync(Enrollment enrollment)
    {
        if (enrollment.ScheduleId is not { } scheduleId) return [];
        var rows = await uow.GetRepository<Assignment>().GetAllAsync(
            new QuerySpecification<Assignment>(a => a.ScheduleId == scheduleId));
        return rows.OrderBy(a => a.DueDate).ToList();
    }

    /// <summary>The learner's attendance keyed by SessionId (one row per session is expected).</summary>
    private async Task<Dictionary<long, Attendance>> AttendanceByLearnerAsync(long userId, IReadOnlyCollection<Session> sessions)
    {
        var ids = sessions.Select(s => s.SessionId).ToList();
        if (ids.Count == 0) return [];
        var rows = await uow.GetRepository<Attendance>().GetAllAsync(
            new QuerySpecification<Attendance>(a => a.LearnerId == userId && ids.Contains(a.SessionId)));
        return rows
            .GroupBy(a => a.SessionId)
            .ToDictionary(g => g.Key, g => g.OrderByDescending(a => a.MarkedAt).First());
    }

    private async Task<List<AssignmentSubmission>> SubmissionsByLearnerAsync(long userId, IReadOnlyCollection<Assignment> assignments)
    {
        var ids = assignments.Select(a => a.AssignmentId).ToList();
        if (ids.Count == 0) return [];
        return (await uow.GetRepository<AssignmentSubmission>().GetAllAsync(
            new QuerySpecification<AssignmentSubmission>(s => s.LearnerId == userId && ids.Contains(s.AssignmentId)))).ToList();
    }

    private async Task<IReadOnlyList<LearnerInstructorDto>> InstructorsOfAsync(long scheduleId)
    {
        var links = (await uow.GetRepository<ScheduleInstructor>().GetAllAsync(
            new QuerySpecification<ScheduleInstructor>(si => si.ScheduleId == scheduleId).Include(si => si.Instructor))).ToList();
        if (links.Count == 0) return [];

        var userIds = links.Select(l => l.InstructorId).ToList();
        var users = (await uow.GetRepository<User>().GetAllAsync(
            new QuerySpecification<User>(u => userIds.Contains(u.UserId)))).ToDictionary(u => u.UserId);

        return links
            .Select(l => new LearnerInstructorDto(
                l.InstructorId,
                users.TryGetValue(l.InstructorId, out var u) ? StaffScope.FullName(u) : "Instructor",
                l.Instructor?.JobTitle ?? "",
                l.Instructor?.AvatarUrl ?? ""))
            .ToList();
    }

    // ================================================================== helpers: mapping / rules

    private static string AttendanceLabel(IReadOnlyDictionary<long, Attendance> byUser, long sessionId) =>
        byUser.TryGetValue(sessionId, out var a) ? a.Status.ToString() : "NotMarked";

    private static string SubmissionLabel(AssignmentSubmission? latest) =>
        latest is null ? "NotSubmitted"
        : latest.Score.HasValue ? "Graded"
        : latest.Status.ToString();

    private static LearnerSubmissionDto ToSubmissionDto(AssignmentSubmission s) => new(
        s.SubmissionId, s.AttemptNumber, s.FileUrl, s.Status.ToString(), s.SubmittedAt, s.Score, s.Feedback, s.GradedAt);

    private static bool CanSubmit(Enrollment enrollment, AssignmentSubmission? latest) =>
        (enrollment.Status is EnrollmentStatus.Enrolled or EnrollmentStatus.Active) && latest?.Score is null;

    private static Error? ValidateFileUrl(string? fileUrl)
    {
        if (string.IsNullOrWhiteSpace(fileUrl))
            return Error.Validation("Submission.FileUrl", "FileUrl is required.");
        var url = fileUrl.Trim();
        if (url.Length > 500)
            return Error.Validation("Submission.FileUrl", "FileUrl must be at most 500 characters.");
        if (!Uri.TryCreate(url, UriKind.Absolute, out var uri) || (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps))
            return Error.Validation("Submission.FileUrl", "FileUrl must be an absolute http(s) URL.");
        return null;
    }

    private static Error EnrollmentNotFound => Error.NotFound("Enrollment.NotFound", "Enrollment not found.");
    private static Error AssignmentNotFound => Error.NotFound("Assignment.NotFound", "Assignment not found.");
}
