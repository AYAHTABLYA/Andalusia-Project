using Andalusia.Domain.Contracts;
using Andalusia.Domain.Enums;
using Andalusia.Services.Specification;
using Andalusia.Shared;
using Andalusia.Shared.Dtos.ProgramDtos;
using AndalusiaApp.Models;
using AndalusiaApp.Specifications;

namespace AndalusiaApp.Services;

public class ProgramService(IUnitOfWork uow) : IProgramService
{
    public async Task<PaginatedResult<ProgramListItemDto>> GetAllAsync(
        ProgramQuery query,
        CancellationToken ct = default)
    {
        var page = Math.Max(query.Page, 1);
        var pageSize = Math.Clamp(query.PageSize, 1, 50);

        var repo = uow.GetRepository<Program>();
        var spec = new ProgramWithCategorySpecification(query);
        var countSpec = new ProgramCountSpecification(query);

        var programs = await repo.GetAllAsync(spec, trackChanges: false);
        var totalCount = await repo.CountAsync(countSpec);
        var programIds = programs.Select(p => p.ProgramId).ToArray();

        var partnerRows = programIds.Length == 0
            ? Array.Empty<ProgramPartner>()
            : (await uow.GetRepository<ProgramPartner>().GetAllAsync(
                new ProgramPartnerByProgramIdsSpecification(programIds),
                trackChanges: false)).ToArray();

        var schedules = programIds.Length == 0
            ? Array.Empty<Schedule>()
            : (await uow.GetRepository<Schedule>().GetAllAsync(
                new ProgramScheduleByProgramIdsSpecification(programIds),
                trackChanges: false)).ToArray();

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var items = programs.Select(p =>
        {
            var accreditation = string.Join(" & ", partnerRows
                .Where(x => x.ProgramId == p.ProgramId)
                .Select(x => x.AccreditationDetails)
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .Distinct(StringComparer.OrdinalIgnoreCase));

            var cohort = schedules
                .Where(x => x.ProgramId == p.ProgramId && x.StartDate >= today && x.Status != ScheduleStatus.Cancelled)
                .OrderBy(x => x.StartDate)
                .FirstOrDefault();

            return ToListItem(p, accreditation, cohort);
        }).ToList();

        return new PaginatedResult<ProgramListItemDto>(page, pageSize, totalCount, items);
    }

    public async Task<IReadOnlyList<CategoryDto>> GetCategoriesAsync(CancellationToken ct = default)
    {
        var repo = uow.GetRepository<Program>();
        var programs = await repo.GetAllAsync(new ProgramCategoriesSpecification(), trackChanges: false);

        return programs
            .Select(p => p.Category)
            .Where(c => c is not null)
            .GroupBy(c => c.CategoryId)
            .Select(g => g.First())
            .OrderBy(c => c.Name)
            .Select(c => new CategoryDto(c.CategoryId, c.Name, c.Slug, c.IsTrending))
            .ToList();
    }

    public async Task<ProgramDetailDto?> GetBySlugAsync(string slug, CancellationToken ct = default)
    {
        var programRepo = uow.GetRepository<Program>();
        var program = await programRepo.GetAsync(
            new ProgramDetailsBySlugSpecification(slug),
            trackChanges: false);

        if (program is null)
            return null;

        var programCourseRepo = uow.GetRepository<ProgramCourse>();
        var partnerRepo = uow.GetRepository<ProgramPartner>();
        var relatedRepo = uow.GetRepository<RelatedProgram>();
        var scheduleRepo = uow.GetRepository<Schedule>();

        var programCourses = await programCourseRepo.GetAllAsync(
            new ProgramCourseByProgramSpecification(program.ProgramId),
            trackChanges: false);

        var programPartners = await partnerRepo.GetAllAsync(
            new ProgramPartnerByProgramSpecification(program.ProgramId),
            trackChanges: false);

        var relatedPrograms = await relatedRepo.GetAllAsync(
            new RelatedProgramsByProgramSpecification(program.ProgramId),
            trackChanges: false);

        var schedules = await scheduleRepo.GetAllAsync(
            new ProgramScheduleByProgramIdsSpecification([program.ProgramId]),
            trackChanges: false);

        var accreditation = string.Join(" & ", programPartners
            .Select(pp => pp.AccreditationDetails)
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Distinct(StringComparer.OrdinalIgnoreCase));

        var nextCohort = schedules
            .Where(s => s.StartDate >= DateOnly.FromDateTime(DateTime.UtcNow) && s.Status != ScheduleStatus.Cancelled)
            .OrderBy(s => s.StartDate)
            .FirstOrDefault();

        var campus = nextCohort is null
            ? null
            : string.Join(" - ", new[] { nextCohort.VenueName, nextCohort.RoomNumber }
                .Where(x => !string.IsNullOrWhiteSpace(x)));

        var courses = programCourses.Select(pc => new ProgramCourseDto(
            pc.CourseId,
            pc.Course.Slug,
            pc.Course.Title,
            pc.Course.Description,
            pc.Course.DurationLabel,
            pc.OrderIndex,
            string.IsNullOrWhiteSpace(pc.Course.Slug) ? null : $"/courses/{pc.Course.Slug}"
        )).ToList();

        var partners = programPartners.Select(pp => new ProgramPartnerDto(
            pp.PartnerId,
            pp.Partner.Name,
            pp.Partner.LogoUrl,
            pp.AccreditationDetails
        )).ToList();

        var benefits = ToLines(program.Requirements)
            .Concat(ToLines(program.Structure))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Select(x => new ProgramBenefitDto(x))
            .ToList();

        var relatedIds = relatedPrograms.Select(rp => rp.RelatedProgramId).Distinct().ToArray();
        var relatedCourseCounts = relatedIds.Length == 0
            ? new Dictionary<long, int>()
            : (await programCourseRepo.GetAllAsync(
                new ProgramCourseByProgramIdsSpecification(relatedIds),
                trackChanges: false))
                .GroupBy(pc => pc.ProgramId)
                .ToDictionary(g => g.Key, g => g.Count());

        var related = relatedPrograms.Select(rp =>
        {
            return ToListItem(
                rp.Related,
                string.Empty,
                null,
                relatedCourseCounts.GetValueOrDefault(rp.RelatedProgramId));
        }).ToList();

        return new ProgramDetailDto(
            program.ProgramId,
            program.Slug,
            program.Title,
            program.Overview,
            program.Requirements,
            program.Structure,
            program.Status.ToString(),
            program.Price,
            "EGP",
            null,
            new ProgramStatsDto(
                program.Duration,
                null,
                accreditation,
                campus),
            new CategoryDto(
                program.Category.CategoryId,
                program.Category.Name,
                program.Category.Slug,
                program.Category.IsTrending),
            program.CareerPath is null
                ? null
                : new CareerPathLinkDto(
                    program.CareerPath.CareerPathId,
                    program.CareerPath.Slug,
                    program.CareerPath.Title),
            courses,
            partners,
            benefits,
            related,
            false,
            $"/api/programs/{program.Slug}/syllabus"
        );
    }

    public async Task<long?> ApplyAsync(
        string slug,
        long userId,
        ApplyToProgramRequest? request,
        CancellationToken ct = default)
    {
        var programRepo = uow.GetRepository<Program>();
        var program = await programRepo.GetAsync(
            new ProgramDetailsBySlugSpecification(slug),
            trackChanges: false);

        if (program is null || program.Status != ProgramStatus.Active)
            return null;

        if (request?.ScheduleId is long scheduleId)
        {
            var scheduleRepo = uow.GetRepository<Schedule>();
            var schedule = await scheduleRepo.GetByIdAsync(scheduleId);
            if (schedule is null || schedule.ProgramId != program.ProgramId)
                return null;
        }

        var app = new Application
        {
            UserId = userId,
            ProgramId = program.ProgramId,
            ScheduleId = request?.ScheduleId,
            Status = ApplicationStatus.Submitted,
            SubmissionDate = DateTime.UtcNow
        };

        var appRepo = uow.GetRepository<Application>();
        await appRepo.AddAsync(app);
        await uow.SaveChangesAsync();

        return app.ApplicationId;
    }

    public async Task<(byte[] Bytes, string ContentType, string FileName)?> GetSyllabusAsync(
        string slug,
        CancellationToken ct = default)
    {
        // The current Program model/database does not contain a syllabus file path yet.
        // The endpoint is kept so the frontend contract is ready when storage is added.
        await Task.CompletedTask;
        return null;
    }

    private static ProgramListItemDto ToListItem(
        Program program,
        string accreditation,
        Schedule? cohort,
        int? courseCountOverride = null)
    {
        var status = program.Status switch
        {
            ProgramStatus.Active when cohort is not null => "Enrolling",
            ProgramStatus.Active => "Upcoming",
            _ => program.Status.ToString()
        };

        return new ProgramListItemDto(
            program.ProgramId,
            program.Slug,
            program.Title,
            program.Category?.Name ?? string.Empty,
            program.Duration,
            courseCountOverride ?? program.ProgramCourses.Count,
            program.Price,
            "EGP",
            accreditation,
            cohort?.StartDate.ToString("MMM dd, yyyy"),
            status,
            $"/programs/{program.Slug}"
        );
    }

    private static IEnumerable<string> ToLines(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return [];

        return value
            .Split(['\r', '\n', '•', ';'], StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(x => !string.IsNullOrWhiteSpace(x));
    }
}
