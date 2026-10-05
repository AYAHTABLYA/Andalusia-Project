using Andalusia.Domain.Contracts;
using Andalusia.Domain.Enums;
using Andalusia.Domain.Models;
using Andalusia.Shared;
using Andalusia.Shared.Dtos.CourseDtos;
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

        var repo = uow.GetRepository<Course>(); //[cite: 4]
        var spec = new CourseWithMentorAndCohortsSpecification(query);
        var countSpec = new CourseCountSpecification(query);

        var courses = await repo.GetAllAsync(spec, trackChanges: false); //[cite: 2]
        var totalCount = await repo.CountAsync(countSpec); //[cite: 2]

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
        var repo = uow.GetRepository<Course>(); //[cite: 4]
        var courses = await repo.GetAllAsync(trackChanges: false); //[cite: 2]

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
        var repo = uow.GetRepository<Course>(); //[cite: 4]
        var spec = new FeaturedCoursesSpecification(take);

        var courses = await repo.GetAllAsync(spec, trackChanges: false); //[cite: 2]

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
        var courseRepo = uow.GetRepository<Course>(); //[cite: 4]
        var spec = new CourseDetailsBySlugSpecification(slug);
        var course = await courseRepo.GetAsync(spec, trackChanges: false); //[cite: 2]

        if (course is null) return null;

        var userRepo = uow.GetRepository<User>(); //[cite: 4]
        var fullName = dto.FullName ?? string.Empty;
        var email = dto.Email ?? string.Empty;
        var phone = dto.Phone ?? string.Empty;

        if (userId.HasValue)
        {
            var user = await userRepo.GetByIdAsync(userId.Value); //[cite: 2]
            if (user != null)
            {
                fullName = string.IsNullOrWhiteSpace(fullName) ? $"{user.FirstName} {user.LastName}" : fullName;
                email = string.IsNullOrWhiteSpace(email) ? user.Email : email;
                phone = string.IsNullOrWhiteSpace(phone) ? user.MobileNumber : phone;
            }
        }

        var app = new CourseApplication
        {
            CourseId = course.CourseId,
            UserId = userId,
            FullName = fullName,
            Email = email,
            Phone = phone,
            Message = dto.Message ?? string.Empty,
            Status = ApplicationStatus.Submitted,
            CreatedAt = DateTime.UtcNow
        };

        var appRepo = uow.GetRepository<CourseApplication>(); //[cite: 4]
        await appRepo.AddAsync(app); //[cite: 2]
        await uow.SaveChangesAsync(); //[cite: 4]

        return app.Id;
    }

    public async Task<(byte[] Bytes, string ContentType, string FileName)?> GetSyllabusAsync(string slug, CancellationToken ct = default)
    {
        var repo = uow.GetRepository<Course>(); //[cite: 4]
        var spec = new CourseDetailsBySlugSpecification(slug);
        var course = await repo.GetAsync(spec, trackChanges: false); //[cite: 2]

        if (course is null || string.IsNullOrWhiteSpace(course.SyllabusPath) || !File.Exists(course.SyllabusPath))
            return null;

        var bytes = await File.ReadAllBytesAsync(course.SyllabusPath, ct);
        return (bytes, "application/pdf", $"{slug}-syllabus.pdf");
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