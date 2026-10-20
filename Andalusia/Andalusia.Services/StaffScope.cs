using Andalusia.Domain.Contracts;
using Andalusia.Services.Specification;
using Andalusia.ServicesAbstraction;
using AndalusiaApp.Models;

namespace Andalusia.Services;

internal sealed record ScheduleLabel(string Title, string BatchCode);

/// <summary>Instructor-ownership checks and lookups shared by the staff/admin services.</summary>
internal static class StaffScope
{
    /// <summary>Schedules an instructor teaches (ScheduleInstructor links).</summary>
    public static async Task<HashSet<long>> InstructorScheduleIdsAsync(IUnitOfWork uow, long instructorId)
    {
        var links = await uow.GetRepository<ScheduleInstructor>()
            .GetAllAsync(new QuerySpecification<ScheduleInstructor>(l => l.InstructorId == instructorId));
        return links.Select(l => l.ScheduleId).ToHashSet();
    }

    /// <summary>Admins/Managers can access every schedule; instructors only the ones they teach.</summary>
    public static async Task<bool> CanAccessScheduleAsync(IUnitOfWork uow, StaffActor actor, long scheduleId)
    {
        if (actor.IsAdmin) return true;
        var count = await uow.GetRepository<ScheduleInstructor>().CountAsync(
            new QuerySpecification<ScheduleInstructor>(l => l.ScheduleId == scheduleId && l.InstructorId == actor.UserId));
        return count > 0;
    }

    /// <summary>"Course title / program title" + batch code for each schedule id.</summary>
    public static async Task<Dictionary<long, ScheduleLabel>> LabelsAsync(IUnitOfWork uow, IReadOnlyCollection<long> scheduleIds)
    {
        var result = new Dictionary<long, ScheduleLabel>();
        if (scheduleIds.Count == 0) return result;

        var schedules = (await uow.GetRepository<Schedule>()
            .GetAllAsync(new QuerySpecification<Schedule>(s => scheduleIds.Contains(s.ScheduleId)))).ToList();

        var titles = await TargetTitlesAsync(uow, schedules);
        foreach (var s in schedules)
            result[s.ScheduleId] = new ScheduleLabel(TitleOf(s, titles.Courses, titles.Programs), s.BatchCode);

        return result;
    }

    public static async Task<(Dictionary<long, string> Courses, Dictionary<long, string> Programs)> TargetTitlesAsync(
        IUnitOfWork uow, IReadOnlyCollection<Schedule> schedules)
    {
        var courseIds = schedules.Where(s => s.CourseId.HasValue).Select(s => s.CourseId!.Value).Distinct().ToList();
        var programIds = schedules.Where(s => s.ProgramId.HasValue).Select(s => s.ProgramId!.Value).Distinct().ToList();

        var courses = courseIds.Count == 0
            ? new Dictionary<long, string>()
            : (await uow.GetRepository<Course>().GetAllAsync(new QuerySpecification<Course>(c => courseIds.Contains(c.CourseId))))
                .ToDictionary(c => c.CourseId, c => c.Title);

        var programs = programIds.Count == 0
            ? new Dictionary<long, string>()
            : (await uow.GetRepository<AndalusiaApp.Models.Program>().GetAllAsync(
                    new QuerySpecification<AndalusiaApp.Models.Program>(p => programIds.Contains(p.ProgramId))))
                .ToDictionary(p => p.ProgramId, p => p.Title);

        return (courses, programs);
    }

    public static string TitleOf(Schedule s, IReadOnlyDictionary<long, string> courses, IReadOnlyDictionary<long, string> programs) =>
        s.CourseId.HasValue && courses.TryGetValue(s.CourseId.Value, out var c) ? c
        : s.ProgramId.HasValue && programs.TryGetValue(s.ProgramId.Value, out var p) ? p
        : "—";

    public static async Task<Dictionary<long, AndalusiaApp.Models.User>> UsersAsync(IUnitOfWork uow, IReadOnlyCollection<long> ids)
    {
        if (ids.Count == 0) return new Dictionary<long, AndalusiaApp.Models.User>();
        return (await uow.GetRepository<AndalusiaApp.Models.User>()
                .GetAllAsync(new QuerySpecification<AndalusiaApp.Models.User>(u => ids.Contains(u.UserId))))
            .ToDictionary(u => u.UserId);
    }

    public static string FullName(AndalusiaApp.Models.User u) => $"{u.FirstName} {u.LastName}".Trim();
}
