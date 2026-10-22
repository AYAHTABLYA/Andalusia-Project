using Andalusia.Domain.Contracts;
using Andalusia.Domain.Enums;
using Andalusia.Services.Specification;
using Andalusia.ServicesAbstraction;
using Andalusia.Shared.CommonResult;
using Andalusia.Shared.Dtos.StaffDtos;
using AndalusiaApp.Models;

namespace Andalusia.Services;

public sealed class StaffContentService(IUnitOfWork uow) : IStaffContentService
{
    // ================================================================== materials
    // Rules: admins manage everything. Instructors can READ course-wide materials of courses they teach and
    // materials of their own schedules, but can only create/edit/delete materials attached to their own schedules.

    public async Task<Result<IReadOnlyList<StaffMaterialDto>>> GetMaterialsAsync(
        StaffActor actor, long courseId, long? scheduleId, CancellationToken ct = default)
    {
        var course = await uow.GetRepository<Course>().GetByIdAsync(courseId);
        if (course is null) return Result<IReadOnlyList<StaffMaterialDto>>.Fail(CourseNotFound);

        HashSet<long>? mine = null;
        if (!actor.IsAdmin)
        {
            mine = await StaffScope.InstructorScheduleIdsAsync(uow, actor.UserId);
            if (!await TeachesCourseAsync(courseId, mine))
                return Result<IReadOnlyList<StaffMaterialDto>>.Fail(NotYourCourse);
        }

        var hasSchedule = scheduleId.HasValue;
        var scheduleV = scheduleId.GetValueOrDefault();
        var materials = (await uow.GetRepository<CourseMaterial>().GetAllAsync(
            new QuerySpecification<CourseMaterial>(m => m.CourseId == courseId && (!hasSchedule || m.ScheduleId == scheduleV))
                .OrderByDesc(m => m.MaterialId))).ToList();

        if (mine is not null)
            materials = materials.Where(m => m.ScheduleId is null || mine.Contains(m.ScheduleId.Value)).ToList();

        var batches = await BatchCodesAsync(materials);
        IReadOnlyList<StaffMaterialDto> dtos = materials
            .Select(m => ToMaterialDto(m, course.Title, batches, CanEditMaterial(actor, m, mine)))
            .ToList();
        return Result<IReadOnlyList<StaffMaterialDto>>.Ok(dtos);
    }

    public async Task<Result<StaffMaterialDto>> GetMaterialAsync(StaffActor actor, long id, CancellationToken ct = default)
    {
        var material = await uow.GetRepository<CourseMaterial>().GetByIdAsync(id);
        if (material is null) return Result<StaffMaterialDto>.Fail(MaterialNotFound);

        HashSet<long>? mine = null;
        if (!actor.IsAdmin)
        {
            mine = await StaffScope.InstructorScheduleIdsAsync(uow, actor.UserId);
            var canRead = material.ScheduleId.HasValue
                ? mine.Contains(material.ScheduleId.Value)
                : await TeachesCourseAsync(material.CourseId, mine);
            if (!canRead) return Result<StaffMaterialDto>.Fail(NotYourCourse);
        }

        return Result<StaffMaterialDto>.Ok(await ToMaterialDtoAsync(actor, material, mine));
    }

    public async Task<Result<StaffMaterialDto>> CreateMaterialAsync(
        StaffActor actor, long courseId, CreateMaterialDto dto, CancellationToken ct = default)
    {
        var invalid = ValidateMaterial(dto.Title, dto.FileUrl, dto.ResourceType, out var type);
        if (invalid is not null) return Result<StaffMaterialDto>.Fail(invalid);

        var course = await uow.GetRepository<Course>().GetByIdAsync(courseId);
        if (course is null) return Result<StaffMaterialDto>.Fail(CourseNotFound);

        HashSet<long>? mine = null;
        if (dto.ScheduleId is long scheduleId)
        {
            var schedule = await uow.GetRepository<Schedule>().GetByIdAsync(scheduleId);
            if (schedule is null) return Result<StaffMaterialDto>.Fail(Error.NotFound("Schedule.NotFound", "Schedule not found."));
            if (schedule.CourseId != courseId)
                return Result<StaffMaterialDto>.Fail(Error.Validation("Material.Schedule", "This schedule does not belong to the course."));
            if (!await StaffScope.CanAccessScheduleAsync(uow, actor, scheduleId))
                return Result<StaffMaterialDto>.Fail(Error.Forbidden("Schedule.Forbidden", "You do not teach this schedule."));
        }
        else if (!actor.IsAdmin)
        {
            return Result<StaffMaterialDto>.Fail(Error.Forbidden("Material.CourseWide",
                "Only admins can add course-wide materials. Attach the material to one of your schedules."));
        }

        var material = new CourseMaterial
        {
            CourseId = courseId,
            ScheduleId = dto.ScheduleId,
            Title = dto.Title.Trim(),
            FileUrl = dto.FileUrl.Trim(),
            ResourceType = type,
            UploadedAt = DateTime.UtcNow
        };
        await uow.GetRepository<CourseMaterial>().AddAsync(material);
        await uow.SaveChangesAsync();

        if (!actor.IsAdmin) mine = await StaffScope.InstructorScheduleIdsAsync(uow, actor.UserId);
        return Result<StaffMaterialDto>.Ok(await ToMaterialDtoAsync(actor, material, mine));
    }

    public async Task<Result<StaffMaterialDto>> UpdateMaterialAsync(
        StaffActor actor, long id, UpdateMaterialDto dto, CancellationToken ct = default)
    {
        var invalid = ValidateMaterial(dto.Title, dto.FileUrl, dto.ResourceType, out var type);
        if (invalid is not null) return Result<StaffMaterialDto>.Fail(invalid);

        var repo = uow.GetRepository<CourseMaterial>();
        var material = await repo.GetByIdAsync(id);
        if (material is null) return Result<StaffMaterialDto>.Fail(MaterialNotFound);

        HashSet<long>? mine = actor.IsAdmin ? null : await StaffScope.InstructorScheduleIdsAsync(uow, actor.UserId);
        if (!CanEditMaterial(actor, material, mine)) return Result<StaffMaterialDto>.Fail(CannotEditMaterial);

        material.Title = dto.Title.Trim();
        material.FileUrl = dto.FileUrl.Trim();
        material.ResourceType = type;

        repo.Update(material);
        await uow.SaveChangesAsync();
        return Result<StaffMaterialDto>.Ok(await ToMaterialDtoAsync(actor, material, mine));
    }

    public async Task<Result> DeleteMaterialAsync(StaffActor actor, long id, CancellationToken ct = default)
    {
        var repo = uow.GetRepository<CourseMaterial>();
        var material = await repo.GetByIdAsync(id);
        if (material is null) return Result.Fail(MaterialNotFound);

        HashSet<long>? mine = actor.IsAdmin ? null : await StaffScope.InstructorScheduleIdsAsync(uow, actor.UserId);
        if (!CanEditMaterial(actor, material, mine)) return Result.Fail(CannotEditMaterial);

        repo.Remove(material);
        await uow.SaveChangesAsync();
        return Result.Ok();
    }

    // ================================================================== assignments

    public async Task<Result<StaffAssignmentDto>> GetAssignmentAsync(StaffActor actor, long id, CancellationToken ct = default)
    {
        var assignment = await uow.GetRepository<Assignment>().GetByIdAsync(id);
        if (assignment is null) return Result<StaffAssignmentDto>.Fail(AssignmentNotFound);
        if (!await StaffScope.CanAccessScheduleAsync(uow, actor, assignment.ScheduleId))
            return Result<StaffAssignmentDto>.Fail(NotYourSchedule);

        return Result<StaffAssignmentDto>.Ok(await ToAssignmentDtoAsync(assignment));
    }

    public async Task<Result<StaffAssignmentDto>> CreateAssignmentAsync(StaffActor actor, CreateAssignmentDto dto, CancellationToken ct = default)
    {
        var invalid = ValidateAssignment(dto.Title, dto.MaxScore);
        if (invalid is not null) return Result<StaffAssignmentDto>.Fail(invalid);

        var schedule = await uow.GetRepository<Schedule>().GetByIdAsync(dto.ScheduleId);
        if (schedule is null) return Result<StaffAssignmentDto>.Fail(Error.NotFound("Schedule.NotFound", "Schedule not found."));
        if (!await StaffScope.CanAccessScheduleAsync(uow, actor, schedule.ScheduleId))
            return Result<StaffAssignmentDto>.Fail(NotYourSchedule);
        if (schedule.Status == ScheduleStatus.Cancelled)
            return Result<StaffAssignmentDto>.Fail(Error.Conflict("Schedule.Cancelled", "Assignments cannot be added to a cancelled schedule."));

        var assignment = new Assignment
        {
            ScheduleId = schedule.ScheduleId,
            Title = dto.Title.Trim(),
            Description = dto.Description?.Trim() ?? "",
            DueDate = dto.DueDate,
            MaxScore = dto.MaxScore
        };
        await uow.GetRepository<Assignment>().AddAsync(assignment);
        await uow.SaveChangesAsync();
        return Result<StaffAssignmentDto>.Ok(await ToAssignmentDtoAsync(assignment));
    }

    public async Task<Result<StaffAssignmentDto>> UpdateAssignmentAsync(StaffActor actor, long id, UpdateAssignmentDto dto, CancellationToken ct = default)
    {
        var invalid = ValidateAssignment(dto.Title, dto.MaxScore);
        if (invalid is not null) return Result<StaffAssignmentDto>.Fail(invalid);

        var repo = uow.GetRepository<Assignment>();
        var assignment = await repo.GetByIdAsync(id);
        if (assignment is null) return Result<StaffAssignmentDto>.Fail(AssignmentNotFound);
        if (!await StaffScope.CanAccessScheduleAsync(uow, actor, assignment.ScheduleId))
            return Result<StaffAssignmentDto>.Fail(NotYourSchedule);

        if (dto.MaxScore < assignment.MaxScore)
        {
            var submissions = await SubmissionsOfAsync(id);
            var highest = submissions.Where(s => s.Score.HasValue).Select(s => s.Score!.Value).DefaultIfEmpty(0).Max();
            if (highest > dto.MaxScore)
                return Result<StaffAssignmentDto>.Fail(Error.Conflict("Assignment.MaxScore",
                    $"MaxScore cannot be lower than an already given score ({highest})."));
        }

        assignment.Title = dto.Title.Trim();
        assignment.Description = dto.Description?.Trim() ?? "";
        assignment.DueDate = dto.DueDate;
        assignment.MaxScore = dto.MaxScore;

        repo.Update(assignment);
        await uow.SaveChangesAsync();
        return Result<StaffAssignmentDto>.Ok(await ToAssignmentDtoAsync(assignment));
    }

    public async Task<Result> DeleteAssignmentAsync(StaffActor actor, long id, CancellationToken ct = default)
    {
        var repo = uow.GetRepository<Assignment>();
        var assignment = await repo.GetByIdAsync(id);
        if (assignment is null) return Result.Fail(AssignmentNotFound);
        if (!await StaffScope.CanAccessScheduleAsync(uow, actor, assignment.ScheduleId))
            return Result.Fail(NotYourSchedule);

        var count = await uow.GetRepository<AssignmentSubmission>()
            .CountAsync(new QuerySpecification<AssignmentSubmission>(s => s.AssignmentId == id));
        if (count > 0)
            return Result.Fail(Error.Conflict("Assignment.HasSubmissions",
                "This assignment already has submissions and cannot be deleted."));

        repo.Remove(assignment);
        await uow.SaveChangesAsync();
        return Result.Ok();
    }

    // ================================================================== grading

    public async Task<Result<StaffSubmissionDto>> GradeSubmissionAsync(
        StaffActor actor, long submissionId, GradeSubmissionDto dto, CancellationToken ct = default)
    {
        var repo = uow.GetRepository<AssignmentSubmission>();
        var submission = await repo.GetByIdAsync(submissionId);
        if (submission is null)
            return Result<StaffSubmissionDto>.Fail(Error.NotFound("Submission.NotFound", "Submission not found."));

        var assignment = await uow.GetRepository<Assignment>().GetByIdAsync(submission.AssignmentId);
        if (assignment is null) return Result<StaffSubmissionDto>.Fail(AssignmentNotFound);
        if (!await StaffScope.CanAccessScheduleAsync(uow, actor, assignment.ScheduleId))
            return Result<StaffSubmissionDto>.Fail(NotYourSchedule);

        if (dto.Score < 0 || dto.Score > assignment.MaxScore)
            return Result<StaffSubmissionDto>.Fail(Error.Validation("Submission.Score",
                $"Score must be between 0 and {assignment.MaxScore}."));

        submission.Score = dto.Score;
        submission.Feedback = string.IsNullOrWhiteSpace(dto.Feedback) ? null : dto.Feedback.Trim();
        submission.GradedAt = DateTime.UtcNow;
        submission.GradedBy = actor.UserId;

        repo.Update(submission);
        await uow.SaveChangesAsync();

        var learner = await uow.GetRepository<User>().GetByIdAsync(submission.LearnerId);
        return Result<StaffSubmissionDto>.Ok(new StaffSubmissionDto(
            submission.SubmissionId, submission.LearnerId,
            learner is null ? "Learner" : StaffScope.FullName(learner), learner?.Email ?? "",
            submission.FileUrl, submission.Status.ToString(), submission.SubmittedAt, submission.AttemptNumber,
            submission.Score, submission.Feedback, submission.GradedAt));
    }

    // ================================================================== helpers

    private async Task<List<AssignmentSubmission>> SubmissionsOfAsync(long assignmentId) =>
        (await uow.GetRepository<AssignmentSubmission>()
            .GetAllAsync(new QuerySpecification<AssignmentSubmission>(s => s.AssignmentId == assignmentId))).ToList();

    private async Task<bool> TeachesCourseAsync(long courseId, HashSet<long> mySchedules)
    {
        if (mySchedules.Count == 0) return false;
        var ids = mySchedules.ToList();
        var count = await uow.GetRepository<Schedule>().CountAsync(
            new QuerySpecification<Schedule>(s => s.CourseId == courseId && ids.Contains(s.ScheduleId)));
        return count > 0;
    }

    private static bool CanEditMaterial(StaffActor actor, CourseMaterial m, HashSet<long>? mine) =>
        actor.IsAdmin || (m.ScheduleId.HasValue && mine is not null && mine.Contains(m.ScheduleId.Value));

    private async Task<Dictionary<long, string>> BatchCodesAsync(IReadOnlyCollection<CourseMaterial> materials)
    {
        var ids = materials.Where(m => m.ScheduleId.HasValue).Select(m => m.ScheduleId!.Value).Distinct().ToList();
        if (ids.Count == 0) return new Dictionary<long, string>();
        return (await uow.GetRepository<Schedule>().GetAllAsync(new QuerySpecification<Schedule>(s => ids.Contains(s.ScheduleId))))
            .ToDictionary(s => s.ScheduleId, s => s.BatchCode);
    }

    private static StaffMaterialDto ToMaterialDto(CourseMaterial m, string courseTitle, IReadOnlyDictionary<long, string> batches, bool canEdit) =>
        new(m.MaterialId, m.CourseId, courseTitle, m.ScheduleId,
            m.ScheduleId.HasValue && batches.TryGetValue(m.ScheduleId.Value, out var b) ? b : null,
            m.Title, m.FileUrl, m.ResourceType.ToString(), m.UploadedAt, canEdit);

    private async Task<StaffMaterialDto> ToMaterialDtoAsync(StaffActor actor, CourseMaterial m, HashSet<long>? mine)
    {
        var course = await uow.GetRepository<Course>().GetByIdAsync(m.CourseId);
        var batches = await BatchCodesAsync([m]);
        return ToMaterialDto(m, course?.Title ?? "—", batches, CanEditMaterial(actor, m, mine));
    }

    private async Task<StaffAssignmentDto> ToAssignmentDtoAsync(Assignment a)
    {
        var submissions = await SubmissionsOfAsync(a.AssignmentId);
        var labels = await StaffScope.LabelsAsync(uow, [a.ScheduleId]);
        var title = labels.TryGetValue(a.ScheduleId, out var l) ? l.Title : "Program assignment";
        return new StaffAssignmentDto(a.AssignmentId, a.Title, a.Description, a.DueDate, a.MaxScore, a.ScheduleId, title,
            submissions.Count, submissions.Count == 0 ? null : submissions.Max(s => (DateTime?)s.SubmittedAt));
    }

    private static Error? ValidateMaterial(string title, string fileUrl, string resourceType, out CourseMaterialResourceType type)
    {
        type = CourseMaterialResourceType.Document;
        if (string.IsNullOrWhiteSpace(title)) return Error.Validation("Material.Title", "Title is required.");
        if (string.IsNullOrWhiteSpace(fileUrl)) return Error.Validation("Material.FileUrl", "FileUrl is required.");
        if (!Enum.TryParse(resourceType?.Trim(), ignoreCase: true, out type) || !Enum.IsDefined(type) || int.TryParse(resourceType, out _))
            return Error.Validation("Material.ResourceType", "ResourceType must be Slide, Document or Reference_Link.");
        if (type == CourseMaterialResourceType.Reference_Link &&
            !(Uri.TryCreate(fileUrl.Trim(), UriKind.Absolute, out var uri) && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps)))
            return Error.Validation("Material.FileUrl", "A Reference_Link must be an absolute http(s) URL.");
        return null;
    }

    private static Error? ValidateAssignment(string title, int maxScore)
    {
        if (string.IsNullOrWhiteSpace(title)) return Error.Validation("Assignment.Title", "Title is required.");
        if (maxScore < 1) return Error.Validation("Assignment.MaxScore", "MaxScore must be at least 1.");
        return null;
    }

    private static Error CourseNotFound => Error.NotFound("Course.NotFound", "Course not found.");
    private static Error MaterialNotFound => Error.NotFound("Material.NotFound", "Material not found.");
    private static Error AssignmentNotFound => Error.NotFound("Assignment.NotFound", "Assignment not found.");
    private static Error NotYourSchedule => Error.Forbidden("Schedule.Forbidden", "You do not teach this schedule.");
    private static Error NotYourCourse => Error.Forbidden("Course.Forbidden", "You do not teach this course.");
    private static Error CannotEditMaterial => Error.Forbidden("Material.Forbidden", "You can only modify materials attached to your own schedules.");
}
