using Andalusia.Domain.Contracts;
using Andalusia.Shared;
using Andalusia.Shared.Dtos.CareerPathDtos;
using AndalusiaApp.Models;
using AndalusiaApp.Specifications;

namespace AndalusiaApp.Services;

public class CareerPathService(IUnitOfWork uow) : ICareerPathService
{
    public async Task<PaginatedResult<CareerPathListItemDto>> GetAllAsync(
        CareerPathQuery query,
        CancellationToken ct = default)
    {
        var page = Math.Max(query.Page, 1);
        var pageSize = Math.Clamp(query.PageSize, 1, 50);

        var repo = uow.GetRepository<CareerPath>();
        var spec = new CareerPathWithProgramsSpecification(query);
        var countSpec = new CareerPathCountSpecification(query);

        var paths = await repo.GetAllAsync(spec, trackChanges: false);
        var totalCount = await repo.CountAsync(countSpec);

        var programIds = paths.SelectMany(cp => cp.Programs).Select(p => p.ProgramId).Distinct().ToArray();
        var programCourses = programIds.Length == 0
            ? Array.Empty<ProgramCourse>()
            : (await uow.GetRepository<ProgramCourse>().GetAllAsync(
                new ProgramCourseByProgramIdsSpecification(programIds),
                trackChanges: false)).ToArray();

        var items = paths.Select(cp => ToListItem(cp, programCourses)).ToList();

        return new PaginatedResult<CareerPathListItemDto>(page, pageSize, totalCount, items);
    }

    public async Task<string[]> GetStatusesAsync(CancellationToken ct = default)
    {
        var repo = uow.GetRepository<CareerPath>();
        var paths = await repo.GetAllAsync(trackChanges: false);

        return paths
            .Select(cp => cp.Status)
            .Where(status => !string.IsNullOrWhiteSpace(status))
            .Distinct()
            .OrderBy(status => status)
            .ToArray();
    }

    public async Task<string[]> GetDomainsAsync(CancellationToken ct = default)
    {
        var repo = uow.GetRepository<CareerPath>();
        var paths = await repo.GetAllAsync(new CareerPathDomainsSpecification(), trackChanges: false);

        return paths
            .SelectMany(cp => cp.Programs)
            .Select(p => p.Category?.Name)
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .OrderBy(x => x)
            .ToArray()!;
    }

    public async Task<(byte[] Bytes, string ContentType, string FileName)?> GetSyllabusAsync(
        string slug,
        CancellationToken ct = default)
    {
        // The current CareerPath model/database does not contain a syllabus file path yet.
        // Keep the endpoint ready for storage integration without inventing a DB field.
        await Task.CompletedTask;
        return null;
    }

    public async Task<CareerPathDetailDto?> GetBySlugAsync(
        string slug,
        CancellationToken ct = default)
    {
        var repo = uow.GetRepository<CareerPath>();
        var careerPath = await repo.GetAsync(
            new CareerPathDetailsBySlugSpecification(slug),
            trackChanges: false);

        if (careerPath is null)
            return null;

        var programIds = careerPath.Programs.Select(p => p.ProgramId).ToArray();
        var programCourseRows = programIds.Length == 0
            ? Array.Empty<ProgramCourse>()
            : (await uow.GetRepository<ProgramCourse>().GetAllAsync(
                new ProgramCourseByProgramIdsSpecification(programIds),
                trackChanges: false)).ToArray();

        var orderedPrograms = careerPath.Programs
            .OrderBy(p => p.ProgramId)
            .ToList();

        var programs = orderedPrograms.Select((p, index) =>
        {
            var courses = programCourseRows
                .Where(pc => pc.ProgramId == p.ProgramId)
                .OrderBy(pc => pc.OrderIndex)
                .Select(pc => new CareerPathCourseDto(
                    pc.CourseId,
                    pc.Course.Slug,
                    pc.Course.Title,
                    pc.Course.Description,
                    pc.Course.DurationLabel,
                    pc.OrderIndex,
                    string.IsNullOrWhiteSpace(pc.Course.Slug) ? null : $"/courses/{pc.Course.Slug}"
                ))
                .ToList();

            return new CareerPathProgramDto(
                p.ProgramId,
                p.Slug,
                p.Title,
                p.Duration,
                p.Price,
                "EGP",
                courses.Count,
                p.Overview,
                index + 1,
                courses
            );
        }).ToList();

        var domain = GetDomain(careerPath.Programs);
        var tuition = orderedPrograms.Sum(p => p.Price);
        var duration = BuildCareerDuration(orderedPrograms.Select(p => p.Duration));
        var courseCount = programCourseRows.Select(pc => pc.CourseId).Distinct().Count();

        // The current schema has RecommendedSkills rather than a dedicated Roles field.
        // Keep the API contract aligned with the UI while using the existing stored text.
        var roles = careerPath.RecommendedSkills;

        var highlights = new List<CareerPathHighlightDto>
        {
            new("Duration", duration, "primary"),
            new("Target Seniority", null, "amber"),
            new("Recognition", null, "neutral"),
            new("Facilities", null, "slate")
        };

        return new CareerPathDetailDto(
            careerPath.CareerPathId,
            careerPath.Slug,
            careerPath.Title,
            roles,
            careerPath.Overview,
            careerPath.Status,
            domain,
            duration,
            null,
            tuition,
            "EGP",
            highlights,
            ToLines(careerPath.LearningJourney).ToList(),
            programs,
            $"/api/career-paths/{careerPath.Slug}/syllabus"
        );
    }

    private static CareerPathListItemDto ToListItem(
        CareerPath careerPath,
        IReadOnlyCollection<ProgramCourse> programCourses)
    {
        var programs = careerPath.Programs.OrderBy(p => p.ProgramId).ToList();
        var courseCount = programCourses
            .Where(pc => programs.Any(p => p.ProgramId == pc.ProgramId))
            .Select(pc => pc.CourseId)
            .Distinct()
            .Count();

        return new CareerPathListItemDto(
            careerPath.CareerPathId,
            careerPath.Slug,
            careerPath.Title,
            careerPath.RecommendedSkills,
            careerPath.Overview,
            BuildCareerDuration(programs.Select(p => p.Duration)),
            null,
            programs.Count,
            courseCount,
            programs.Sum(p => p.Price),
            "EGP",
            careerPath.Status,
            GetDomain(programs),
            $"/career-paths/{careerPath.Slug}"
        );
    }

    private static string GetDomain(IEnumerable<Program> programs)
    {
        var domains = programs
            .Select(p => p.Category?.Name)
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        return domains.Count switch
        {
            0 => string.Empty,
            1 => domains[0]!,
            _ => string.Join(" / ", domains!)
        };
    }

    private static string BuildCareerDuration(IEnumerable<string> durations)
    {
        var values = durations
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        return values.Count switch
        {
            0 => string.Empty,
            1 => values[0],
            _ => string.Join(" + ", values)
        };
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
