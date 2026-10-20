using Andalusia.Domain.Contracts;
using Andalusia.Domain.Enums;
using Andalusia.Domain.Models;
using Andalusia.Shared;
using Andalusia.Shared.Dtos.CourseDtos;
using Andalusia.ServicesAbstraction;
using AndalusiaApp.Models;
using AndalusiaApp.Specifications;

namespace AndalusiaApp.Services;

public class CourseService(IUnitOfWork uow) : ICourseService
{
    public async Task<PaginatedResult<CourseListItemDto>> GetAllAsync(CourseQuery query, CancellationToken ct = default)
    {
        var page = Math.Max(query.Page, 1);
        var pageSize = Math.Clamp(query.PageSize, 1, 50);
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var repo = uow.GetRepository<Course>();
        var spec = new CourseWithMentorAndCohortsSpecification(query);
        var countSpec = new CourseCountSpecification(query);

        var courses = await repo.GetAllAsync(spec, trackChanges: false);
        var totalCount = await repo.CountAsync(countSpec);

        var items = courses.Select(c =>
        {
            var cohort = c.Cohorts
                .Where(ch => ch.StartDate >= today && ch.Status != ScheduleStatus.Cancelled)
                .OrderBy(ch => ch.StartDate)
                .FirstOrDefault();

            return new CourseListItemDto(
                c.CourseId,
                c.Slug,
                c.Title,
                c.Category,
                c.DeliveryMode,
                c.DurationLabel,
                c.Mentor.Name,
                c.Mentor.Title,
                c.Tuition,
                "EGP",
                CalculateSeatsLabel(cohort?.Capacity, cohort?.EnrolledCount, cohort?.Status)
            );
        }).ToList();

        return new PaginatedResult<CourseListItemDto>(page, pageSize, totalCount, items);
    }

    public async Task<string[]> GetCategoriesAsync(CancellationToken ct = default)
    {
        var repo = uow.GetRepository<Course>();
        var courses = await repo.GetAllAsync(trackChanges: false);

        return courses
            .Select(c => c.Category)
            .Where(cat => !string.IsNullOrWhiteSpace(cat))
            .Distinct()
            .OrderBy(cat => cat)
            .ToArray();
    }

    public async Task<List<FeaturedCourseDto>> GetFeaturedAsync(int take = 3, CancellationToken ct = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var repo = uow.GetRepository<Course>();
        var spec = new FeaturedCoursesSpecification(take);

        var courses = await repo.GetAllAsync(spec, trackChanges: false);

        return courses.Select(c =>
        {
            var cohort = c.Cohorts
                .Where(ch => ch.StartDate >= today && ch.Status != ScheduleStatus.Cancelled)
                .OrderBy(ch => ch.StartDate)
                .FirstOrDefault();

            return new FeaturedCourseDto(
                c.CourseId,
                c.Slug,
                c.Title,
                c.Description,
                c.Category,
                c.DeliveryMode,
                "offline",
                cohort?.StartDate.ToString("MMM yyyy") ?? "Upcoming",
                c.Hall,
                c.DurationLabel,
                c.Mentor.Name,
                c.Mentor.Title,
                c.Tuition,
                CalculateSeatsLabel(cohort?.Capacity, cohort?.EnrolledCount, cohort?.Status)
            );
        }).ToList();
    }

    public async Task<CourseDetailDto?> GetBySlugAsync(string slug, CancellationToken ct = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var repo = uow.GetRepository<Course>(); //[cite: 4]
        var spec = new CourseDetailsBySlugSpecification(slug);

        var course = await repo.GetAsync(spec, trackChanges: false); //[cite: 2]
        if (course is null) return null;

        var cohort = course.Cohorts
            .Where(ch => ch.StartDate >= today && ch.Status != ScheduleStatus.Cancelled)
            .OrderBy(ch => ch.StartDate)
            .FirstOrDefault();

        var seats = CalculateSeatsLabel(cohort?.Capacity, cohort?.EnrolledCount, cohort?.Status);
        var statusLabel = $"{seats} • {course.DeliveryMode}";
        var cohortDate = cohort?.StartDate.ToString("yyyy-MM-dd") ?? "TBD";

        return new CourseDetailDto(
            course.Slug,
            course.Title,
            course.Description,
            statusLabel,
            new CourseStatsDto(course.DurationLabel, course.Level, course.Accreditation, cohortDate),
            course.LearningOutcomes.OrderBy(o => o.Order).Select(o => new LearningOutcomeDto(o.Title, o.Text)).ToList(),
            new MentorDto(course.Mentor.Name, course.Mentor.Title, course.Mentor.Bio),
            new CourseEnrollDto(course.Tuition, "EGP", course.TuitionNote, course.Bullets.Select(b => b.Text).ToList()),
            course.Program != null ? new ProgramLinkDto(course.Program.Slug, course.Program.Title) : null,
            course.CareerPath != null ? new CareerPathLinkDto(course.CareerPath.Slug, course.CareerPath.Title) : null
        );
    }

    public async Task<long?> ApplyAsync(string slug, CreateApplicationDto dto, long? userId = null, CancellationToken ct = default)
    {
        var courseRepo = uow.GetRepository<Course>();
        var spec = new CourseDetailsBySlugSpecification(slug);
        var course = await courseRepo.GetAsync(spec, trackChanges: false);

        if (course is null) return null;

        var userRepo = uow.GetRepository<User>();
        var fullName = dto.FullName ?? string.Empty;
        var email = dto.Email ?? string.Empty;
        var phone = dto.Phone ?? string.Empty;

        if (userId.HasValue)
        {
            var user = await userRepo.GetByIdAsync(userId.Value);
            if (user != null)
            {
                fullName = string.IsNullOrWhiteSpace(fullName) ? $"{user.FirstName} {user.LastName}" : fullName;
                email = string.IsNullOrWhiteSpace(email) ? user.Email : email;
                phone = string.IsNullOrWhiteSpace(phone) ? user.MobileNumber : phone;
            }
        }

        // Authenticated course applications use APPLICATIONS so they appear in My Applications.
        // Guest submissions remain in COURSE_APPLICATIONS because APPLICATIONS requires UserId.
        if (userId.HasValue)
        {
            var learnerApplication = new AndalusiaApp.Models.Application
            {
                CourseId = course.CourseId,
                UserId = userId.Value,
                Status = ApplicationStatus.Submitted,
                SubmissionDate = DateTime.UtcNow
            };
            var learnerAppRepo = uow.GetRepository<AndalusiaApp.Models.Application>();
            await learnerAppRepo.AddAsync(learnerApplication);
            await uow.SaveChangesAsync();
            return learnerApplication.ApplicationId;
        }

        var guestApplication = new CourseApplication
        {
            CourseId = course.CourseId,
            UserId = null,
            FullName = fullName,
            Email = email,
            Phone = phone,
            Message = dto.Message ?? string.Empty,
            Status = ApplicationStatus.Submitted,
            CreatedAt = DateTime.UtcNow
        };
        var guestAppRepo = uow.GetRepository<CourseApplication>();
        await guestAppRepo.AddAsync(guestApplication);
        await uow.SaveChangesAsync();
        return guestApplication.Id;
    }

    public async Task<(byte[] Bytes, string ContentType, string FileName)?> GetSyllabusAsync(string slug, CancellationToken ct = default)
    {
        var repo = uow.GetRepository<Course>();
        var spec = new CourseDetailsBySlugSpecification(slug);
        var course = await repo.GetAsync(spec, trackChanges: false);

        if (course is null || string.IsNullOrWhiteSpace(course.SyllabusPath) || !File.Exists(course.SyllabusPath))
            return null;

        var bytes = await File.ReadAllBytesAsync(course.SyllabusPath, ct);
        return (bytes, "application/pdf", $"{slug}-syllabus.pdf");
    }


    public async Task<IReadOnlyList<AdminCourseDto>> GetAdminCoursesAsync(CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();
        var courses = await uow.GetRepository<Course>().GetAllAsync(new AdminCoursesSpecification(), trackChanges: false);
        return courses.Select(ToAdminDto).ToList();
    }

    public async Task<IReadOnlyList<AdminCourseMentorDto>> GetAdminCourseMentorsAsync(CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();
        var mentors = await uow.GetRepository<Mentor>().GetAllAsync(trackChanges: false);
        return mentors.OrderBy(m => m.Name).Select(m => new AdminCourseMentorDto(m.Id, m.Name, m.Title)).ToList();
    }

    public async Task<AdminCourseDto?> GetAdminCourseAsync(long id, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();
        var course = await uow.GetRepository<Course>().GetAsync(new AdminCoursesSpecification(id), trackChanges: false);
        return course is null ? null : ToAdminDto(course);
    }

    public async Task<AdminCourseDto?> CreateAdminCourseAsync(CreateAdminCourseDto dto, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();
        var mentor = await uow.GetRepository<Mentor>().GetByIdAsync(dto.MentorId);
        if (mentor is null) return null;
        if (dto.ProgramId.HasValue && await uow.GetRepository<AndalusiaApp.Models.Program>().GetByIdAsync(dto.ProgramId.Value) is null) return null;
        if (dto.CareerPathId.HasValue && await uow.GetRepository<CareerPath>().GetByIdAsync(dto.CareerPathId.Value) is null) return null;

        var allCourses = await uow.GetRepository<Course>().GetAllAsync(trackChanges: false);
        var slug = MakeUniqueSlug(dto.Title, allCourses.Select(c => c.Slug));
        var course = new Course
        {
            Slug = slug,
            Title = dto.Title.Trim(),
            Description = dto.Description.Trim(),
            Category = dto.Category.Trim(),
            DeliveryMode = dto.DeliveryMode.Trim(),
            Hall = dto.Hall.Trim(),
            DurationLabel = dto.DurationLabel.Trim(),
            Level = dto.Level.Trim(),
            Accreditation = dto.Accreditation.Trim(),
            Tuition = dto.Tuition,
            TuitionNote = dto.TuitionNote.Trim(),
            IsFeatured = dto.IsFeatured,
            MentorId = dto.MentorId,
            ProgramId = dto.ProgramId,
            CareerPathId = dto.CareerPathId
        };
        await uow.GetRepository<Course>().AddAsync(course);
        await uow.SaveChangesAsync();
        course.Mentor = mentor;
        return ToAdminDto(course);
    }

    public async Task<AdminCourseDto?> UpdateAdminCourseAsync(long id, UpdateAdminCourseDto dto, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();
        var repo = uow.GetRepository<Course>();
        var course = await repo.GetByIdAsync(id);
        if (course is null) return null;
        var mentor = await uow.GetRepository<Mentor>().GetByIdAsync(dto.MentorId);
        if (mentor is null) return null;
        if (dto.ProgramId.HasValue && await uow.GetRepository<AndalusiaApp.Models.Program>().GetByIdAsync(dto.ProgramId.Value) is null) return null;
        if (dto.CareerPathId.HasValue && await uow.GetRepository<CareerPath>().GetByIdAsync(dto.CareerPathId.Value) is null) return null;

        course.Title = dto.Title.Trim();
        course.Description = dto.Description.Trim();
        course.Category = dto.Category.Trim();
        course.DeliveryMode = dto.DeliveryMode.Trim();
        course.Hall = dto.Hall.Trim();
        course.DurationLabel = dto.DurationLabel.Trim();
        course.Level = dto.Level.Trim();
        course.Accreditation = dto.Accreditation.Trim();
        course.Tuition = dto.Tuition;
        course.TuitionNote = dto.TuitionNote.Trim();
        course.IsFeatured = dto.IsFeatured;
        course.MentorId = dto.MentorId;
        course.ProgramId = dto.ProgramId;
        course.CareerPathId = dto.CareerPathId;
        repo.Update(course);
        await uow.SaveChangesAsync();
        course.Mentor = mentor;
        return ToAdminDto(course);
    }

    public async Task<bool?> DeleteAdminCourseAsync(long id, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();
        var repo = uow.GetRepository<Course>();
        var course = await repo.GetAsync(new AdminCoursesSpecification(id), trackChanges: true);
        if (course is null) return null;
        // Do not cascade-delete courses that already have schedules, applications or program links.
        if (course.Cohorts.Count > 0 || course.Applications.Count > 0 || course.ProgramCourses.Count > 0) return false;
        repo.Remove(course);
        await uow.SaveChangesAsync();
        return true;
    }

    private static AdminCourseDto ToAdminDto(Course c) => new(
        c.CourseId, c.Slug, c.Title, c.Description, c.Category, c.DeliveryMode, c.Hall, c.DurationLabel,
        c.Level, c.Accreditation, c.Tuition, c.TuitionNote, c.IsFeatured, c.MentorId, c.Mentor?.Name ?? string.Empty,
        c.ProgramId, c.CareerPathId);

    private static string MakeUniqueSlug(string title, IEnumerable<string> existingSlugs)
    {
        var baseSlug = System.Text.RegularExpressions.Regex.Replace(title.Trim().ToLowerInvariant(), @"[^\p{L}\p{N}]+", "-").Trim('-');
        if (string.IsNullOrWhiteSpace(baseSlug)) baseSlug = "course";
        var slugs = existingSlugs.ToHashSet(StringComparer.OrdinalIgnoreCase);
        var candidate = baseSlug; var suffix = 2;
        while (slugs.Contains(candidate)) candidate = $"{baseSlug}-{suffix++}";
        return candidate;
    }

    private static string CalculateSeatsLabel(int? capacity, int? enrolled, ScheduleStatus? status)
    {
        if (capacity is null || enrolled is null) return "Upcoming";
        if (status == ScheduleStatus.Cancelled) return "Cancelled";
        if (status == ScheduleStatus.Completed) return "Closed";

        var left = capacity.Value - enrolled.Value;
        if (left <= 0) return "Waitlist Only";
        if (left <= 5) return $"{left} Seats Left";
        return "Enrolling";
    }
}