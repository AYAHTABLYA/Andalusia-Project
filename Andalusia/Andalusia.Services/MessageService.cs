using Andalusia.Domain.Contracts;
using Andalusia.Domain.Enums;
using Andalusia.Services.Specification;
using Andalusia.ServicesAbstraction;
using Andalusia.Shared.CommonResult;
using Andalusia.Shared.Dtos.MessageDtos;
using AndalusiaApp.Models;

namespace Andalusia.Services;

public sealed class MessageService(IUnitOfWork uow, INotificationService notifications) : IMessageService
{
    private const int MaxBodyLength = 2000;

    private static readonly Error NotAllowed = Error.Forbidden(
        "Message.NotAllowed", "You can only message people who teach you or who you teach.");

    // ------------------------------------------------------------------ contacts

    public async Task<IReadOnlyList<MessageContactDto>> GetContactsAsync(long userId, bool isInstructor, CancellationToken ct = default)
    {
        var people = await FindContactsAsync(userId, isInstructor);
        if (people.Count == 0) return [];

        var ids = people.Keys.ToList();
        var messages = (await uow.GetRepository<DirectMessage>().GetAllAsync(
            new QuerySpecification<DirectMessage>(m =>
                (m.SenderId == userId && ids.Contains(m.RecipientId)) ||
                (m.RecipientId == userId && ids.Contains(m.SenderId))))).ToList();

        return people
            .Select(p =>
            {
                var thread = messages
                    .Where(m => m.SenderId == p.Key || m.RecipientId == p.Key)
                    .OrderByDescending(m => m.SentAt)
                    .ToList();
                var last = thread.FirstOrDefault();
                var unread = thread.Count(m => m.SenderId == p.Key && m.ReadAt is null);
                return new MessageContactDto(
                    p.Key, p.Value.Name, p.Value.Subtitle, unread, last?.Body, last is null ? (DateTime?)null : AsUtc(last.SentAt));
            })
            .OrderByDescending(c => c.LastMessageAt ?? DateTime.MinValue)
            .ThenBy(c => c.FullName)
            .ToList();
    }

    // ------------------------------------------------------------------ thread

    public async Task<Result<IReadOnlyList<MessageDto>>> GetThreadAsync(
        long userId, bool isInstructor, long otherUserId, CancellationToken ct = default)
    {
        if (!await CanMessageAsync(userId, isInstructor, otherUserId))
            return Result<IReadOnlyList<MessageDto>>.Fail(NotAllowed);

        var rows = (await uow.GetRepository<DirectMessage>().GetAllAsync(
            new QuerySpecification<DirectMessage>(m =>
                    (m.SenderId == userId && m.RecipientId == otherUserId) ||
                    (m.SenderId == otherUserId && m.RecipientId == userId))
                .OrderByAsc(m => m.SentAt),
            trackChanges: true)).ToList();

        var unread = rows.Where(m => m.RecipientId == userId && m.ReadAt is null).ToList();
        if (unread.Count > 0)
        {
            var now = DateTime.UtcNow;
            foreach (var m in unread) m.ReadAt = now;
            await uow.SaveChangesAsync();
        }

        IReadOnlyList<MessageDto> dtos = rows.Select(m => ToDto(m, userId)).ToList();
        return Result<IReadOnlyList<MessageDto>>.Ok(dtos);
    }

    // ------------------------------------------------------------------ send

    public async Task<Result<MessageDto>> SendAsync(long userId, bool isInstructor, SendMessageDto dto, CancellationToken ct = default)
    {
        var body = dto?.Body?.Trim();
        if (string.IsNullOrEmpty(body))
            return Result<MessageDto>.Fail(Error.Validation("Message.Body", "Write a message first."));
        if (body.Length > MaxBodyLength)
            return Result<MessageDto>.Fail(Error.Validation("Message.Body", $"A message can be at most {MaxBodyLength} characters."));

        if (!await CanMessageAsync(userId, isInstructor, dto!.RecipientId))
            return Result<MessageDto>.Fail(NotAllowed);

        var message = new DirectMessage
        {
            SenderId = userId,
            RecipientId = dto.RecipientId,
            Body = body,
            SentAt = DateTime.UtcNow
        };
        await uow.GetRepository<DirectMessage>().AddAsync(message);
        await uow.SaveChangesAsync();

        // Bell notification for the recipient (a failure here must not lose the message).
        try
        {
            var sender = await uow.GetRepository<User>().GetByIdAsync(userId);
            var name = sender is null ? "Someone" : $"{sender.FirstName} {sender.LastName}".Trim();
            await notifications.NotifyAsync(dto.RecipientId, "New message", $"{name} sent you a message.", "Info", ct);
        }
        catch
        {
            // ignored on purpose
        }

        return Result<MessageDto>.Ok(ToDto(message, userId));
    }

    public async Task<int> GetUnreadCountAsync(long userId, CancellationToken ct = default)
        => await uow.GetRepository<DirectMessage>()
            .CountAsync(new QuerySpecification<DirectMessage>(m => m.RecipientId == userId && m.ReadAt == null));

    // ------------------------------------------------------------------ rules

    private async Task<bool> CanMessageAsync(long userId, bool isInstructor, long otherUserId)
    {
        if (otherUserId == userId) return false;
        return (await FindContactsAsync(userId, isInstructor)).ContainsKey(otherUserId);
    }

    /// <summary>
    /// userId -> (name, "Course - batch") of everyone the caller may message.
    /// Learner: instructors of the batches the learner is enrolled in. Instructor: learners enrolled in their batches.
    /// Cancelled enrollments don't count.
    /// </summary>
    private async Task<Dictionary<long, (string Name, string Subtitle)>> FindContactsAsync(long userId, bool isInstructor)
    {
        var result = new Dictionary<long, (string Name, string Subtitle)>();

        // (otherUserId, scheduleId) pairs
        var pairs = new List<(long Other, long ScheduleId)>();

        if (isInstructor)
        {
            var mySchedules = (await StaffScope.InstructorScheduleIdsAsync(uow, userId)).ToList();
            if (mySchedules.Count == 0) return result;

            var mine = (await uow.GetRepository<Schedule>().GetAllAsync(
                new QuerySpecification<Schedule>(s => mySchedules.Contains(s.ScheduleId)))).ToList();
            var courseIds = mine.Where(s => s.CourseId.HasValue).Select(s => s.CourseId!.Value).Distinct().ToList();
            var programIds = mine.Where(s => s.ProgramId.HasValue).Select(s => s.ProgramId!.Value).Distinct().ToList();

            // Learners in one of my batches, plus learners enrolled in my course/program but not yet placed in a batch
            // (paying for an application creates the enrollment without a batch). Both sides use the same rule.
            var enrollments = await uow.GetRepository<Enrollment>().GetAllAsync(
                new QuerySpecification<Enrollment>(e =>
                    e.Status != EnrollmentStatus.Cancelled &&
                    ((e.ScheduleId != null && mySchedules.Contains(e.ScheduleId.Value)) ||
                     (e.ScheduleId == null &&
                      ((e.CourseId != null && courseIds.Contains(e.CourseId.Value)) ||
                       (e.ProgramId != null && programIds.Contains(e.ProgramId.Value)))))));

            foreach (var e in enrollments)
            {
                var scheduleId = e.ScheduleId
                    ?? mine.FirstOrDefault(s =>
                        (e.CourseId != null && s.CourseId == e.CourseId) ||
                        (e.ProgramId != null && s.ProgramId == e.ProgramId))?.ScheduleId;
                if (scheduleId is { } sid) pairs.Add((e.UserId, sid));
            }
        }
        else
        {
            var enrollments = (await uow.GetRepository<Enrollment>().GetAllAsync(
                new QuerySpecification<Enrollment>(e =>
                    e.UserId == userId && e.Status != EnrollmentStatus.Cancelled))).ToList();

            var scheduleIds = enrollments.Where(e => e.ScheduleId != null).Select(e => e.ScheduleId!.Value).ToHashSet();

            // Enrollments without a batch: use the open batches of the same course / program.
            var unplaced = enrollments.Where(e => e.ScheduleId == null).ToList();
            if (unplaced.Count > 0)
            {
                var courseIds = unplaced.Where(e => e.CourseId != null).Select(e => e.CourseId!.Value).Distinct().ToList();
                var programIds = unplaced.Where(e => e.ProgramId != null).Select(e => e.ProgramId!.Value).Distinct().ToList();
                var open = await uow.GetRepository<Schedule>().GetAllAsync(
                    new QuerySpecification<Schedule>(s =>
                        s.Status != ScheduleStatus.Cancelled &&
                        ((s.CourseId != null && courseIds.Contains(s.CourseId.Value)) ||
                         (s.ProgramId != null && programIds.Contains(s.ProgramId.Value)))));
                foreach (var s in open) scheduleIds.Add(s.ScheduleId);
            }

            if (scheduleIds.Count == 0) return result;

            var idList = scheduleIds.ToList();
            var links = await uow.GetRepository<ScheduleInstructor>().GetAllAsync(
                new QuerySpecification<ScheduleInstructor>(l => idList.Contains(l.ScheduleId)));
            pairs.AddRange(links.Select(l => (l.InstructorId, l.ScheduleId)));
        }

        if (pairs.Count == 0) return result;

        var userIds = pairs.Select(p => p.Other).Distinct().ToList();
        var users = (await uow.GetRepository<User>().GetAllAsync(
            new QuerySpecification<User>(u => userIds.Contains(u.UserId)))).ToDictionary(u => u.UserId);
        var labels = await StaffScope.LabelsAsync(uow, pairs.Select(p => p.ScheduleId).Distinct().ToList());

        foreach (var group in pairs.GroupBy(p => p.Other))
        {
            if (!users.TryGetValue(group.Key, out var u) || !u.IsActive) continue;
            var subtitle = string.Join(", ", group
                .Select(p => p.ScheduleId)
                .Distinct()
                .Where(labels.ContainsKey)
                .Select(id => $"{labels[id].Title} - {labels[id].BatchCode}")
                .Take(2));
            result[group.Key] = ($"{u.FirstName} {u.LastName}".Trim(), subtitle);
        }
        return result;
    }

    // SQL Server returns datetime2 with Kind=Unspecified, which serializes without a "Z" and makes browsers
    // read the UTC time as local time. Always mark stored timestamps as UTC.
    private static DateTime AsUtc(DateTime d) => DateTime.SpecifyKind(d, DateTimeKind.Utc);

    private static MessageDto ToDto(DirectMessage m, long viewerId)
        => new(m.DirectMessageId, m.SenderId, m.Body, AsUtc(m.SentAt), m.SenderId == viewerId,
               m.ReadAt is { } read ? AsUtc(read) : (DateTime?)null);
}
