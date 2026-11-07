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
        var d = await GetBySlugAsync(slug, ct);
        if (d is null) return null;

        var lines = new List<string> { $"Status: {d.Status}", $"Duration: {d.Duration}" };
        if (d.Tuition > 0) lines.Add($"Tuition: {d.Currency} {d.Tuition:N0}");
        if (!string.IsNullOrWhiteSpace(d.Roles)) lines.Add($"Target Roles / Skills: {d.Roles}");
        lines.Add("");
        lines.Add("# Overview");
        lines.Add(d.Summary);
        lines.Add("");
        lines.Add("# Roadmap");
        foreach (var p in d.Programs.OrderBy(x => x.OrderIndex))
        {
            lines.Add($"Program: {p.Title} ({p.Duration})");
            if (!string.IsNullOrWhiteSpace(p.Description)) lines.Add(p.Description);
            foreach (var c in p.Courses) lines.Add($"   - {c.Title} {(string.IsNullOrWhiteSpace(c.Duration) ? "" : $"[{c.Duration}]")}");
            lines.Add("");
        }
        if (d.Guarantees.Count > 0)
        {
            lines.Add("# Guarantees");
            foreach (var g in d.Guarantees) lines.Add($"   - {g}");
        }
        return (SimplePdf.Build($"{d.Title} - Career Path Syllabus", lines), "application/pdf", $"{slug}-syllabus.pdf");
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

        var pathCourseIds = programCourseRows.Select(pc => pc.CourseId).ToHashSet();
        var relatedCourses = await GetRelatedCoursesAsync(careerPath.CareerPathId, pathCourseIds);

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
            ToSkills(careerPath.RecommendedSkills).ToList(),
            relatedCourses,
            $"/api/career-paths/{careerPath.Slug}/syllabus"
        );
    }

    // Courses related (RELATED_COURSES) to any course in the path, plus courses linked directly to the
    // path, minus the ones the path's programs already include.
    private async Task<IReadOnlyList<CareerPathCourseDto>> GetRelatedCoursesAsync(
        long careerPathId,
        HashSet<long> pathCourseIds)
    {
        var candidates = new Dictionary<long, Course>();

        if (pathCourseIds.Count > 0)
        {
            var rows = await uow.GetRepository<RelatedCourse>().GetAllAsync(
                new RelatedCoursesByCourseIdsSpecification(pathCourseIds.ToArray()),
                trackChanges: false);

            foreach (var row in rows)
                candidates.TryAdd(row.RelatedCourseId, row.Related);
        }

        var linked = await uow.GetRepository<Course>().GetAllAsync(
            new CoursesByCareerPathSpecification(careerPathId),
            trackChanges: false);

        foreach (var course in linked)
            candidates.TryAdd(course.CourseId, course);

        return candidates.Values
            .Where(c => !pathCourseIds.Contains(c.CourseId))
            .OrderBy(c => c.Title)
            .Take(6)
            .Select((c, index) => new CareerPathCourseDto(
                c.CourseId,
                c.Slug,
                c.Title,
                c.Description,
                c.DurationLabel,
                index + 1,
                string.IsNullOrWhiteSpace(c.Slug) ? null : $"/courses/{c.Slug}"))
            .ToList();
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

    // RecommendedSkills is stored as free text: comma / semicolon / bullet / newline separated.
    private static IEnumerable<string> ToSkills(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return [];

        return value
            .Split([',', ';', '\r', '\n', '•'], StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Distinct(StringComparer.OrdinalIgnoreCase);
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
