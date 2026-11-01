using Andalusia.Domain.Contracts;
using Andalusia.Domain.Enums;
using Andalusia.Services.Specification;
using Andalusia.ServicesAbstraction;
using Andalusia.Shared;
using Andalusia.Shared.Authorization;
using Andalusia.Shared.CommonResult;
using Andalusia.Shared.Dtos.AdminDtos;
using AndalusiaApp.Models;

namespace Andalusia.Services;

public sealed class InstructorAdminService(IUnitOfWork uow) : IInstructorAdminService
{
    public async Task<PaginatedResult<AdminInstructorDto>> GetInstructorsAsync(
        string? search, bool? isActive, int page, int pageSize, CancellationToken ct = default)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var s = search?.Trim().ToLowerInvariant() ?? "";
        var hasSearch = s.Length > 0;
        var hasActive = isActive.HasValue;
        var activeV = isActive.GetValueOrDefault();

        System.Linq.Expressions.Expression<Func<Instructor, bool>> criteria = i =>
            (!hasSearch || i.User.Email.Contains(s) || i.User.FirstName.Contains(s) || i.User.LastName.Contains(s)
                || i.JobTitle.Contains(s)) &&
            (!hasActive || i.User.IsActive == activeV);

        var repo = uow.GetRepository<Instructor>();
        var total = await repo.CountAsync(new QuerySpecification<Instructor>(criteria));
        var rows = (await repo.GetAllAsync(new QuerySpecification<Instructor>(criteria)
            .Include(i => i.User)
            .OrderByDesc(i => i.InstructorId)
            .Page((page - 1) * pageSize, pageSize))).ToList();

        var counts = await ScheduleCountsAsync(rows.Select(r => r.InstructorId).ToList());
        var dtos = rows.Select(i => new AdminInstructorDto(
            i.InstructorId, StaffScope.FullName(i.User), i.User.Email, i.User.MobileNumber, i.JobTitle, i.AvatarUrl,
            i.User.IsActive, counts.GetValueOrDefault(i.InstructorId), i.User.CreatedAt)).ToList();

        return new PaginatedResult<AdminInstructorDto>(page, pageSize, total, dtos);
    }

    public async Task<Result<AdminInstructorDetailDto>> GetInstructorAsync(long id, CancellationToken ct = default)
    {
        var instructor = await LoadAsync(id, track: false);
        if (instructor is null) return Result<AdminInstructorDetailDto>.Fail(NotFound);
        return Result<AdminInstructorDetailDto>.Ok(await ToDetailAsync(instructor));
    }

    public async Task<Result<AdminInstructorDetailDto>> CreateInstructorAsync(CreateInstructorDto dto, CancellationToken ct = default)
    {
        var email = dto.Email.Trim().ToLowerInvariant();
        var userRepo = uow.GetRepository<User>();
        if (await userRepo.GetAsync(new UserByEmailSpecification(email)) is not null)
            return Result<AdminInstructorDetailDto>.Fail(Error.Conflict("Instructor.EmailTaken", "Email is already registered."));

        var role = (await uow.GetRepository<Role>().GetAllAsync()).FirstOrDefault(r => r.Name == AppRoles.Instructor);
        if (role is null)
            return Result<AdminInstructorDetailDto>.Fail(Error.Failure("Instructor.RoleMissing", "The Instructor role is not configured."));

        var user = new User
        {
            FirstName = dto.FirstName.Trim(),
            LastName = dto.LastName.Trim(),
            Email = email,
            MobileNumber = dto.MobileNumber.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.TemporaryPassword),
            IsActive = true,
            IsEmailVerified = true,           // created by an admin, no OTP step (same as POST /api/admin/users)
            TermsAcceptedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            Instructor = new Instructor
            {
                JobTitle = dto.JobTitle?.Trim() ?? "",
                Bio = dto.Bio?.Trim() ?? "",
                AvatarUrl = dto.AvatarUrl?.Trim() ?? ""
            }
        };
        user.UserRoles.Add(new UserRole { RoleId = role.RoleId });

        await userRepo.AddAsync(user);
        await uow.SaveChangesAsync();

        var created = await LoadAsync(user.UserId, track: false);
        return Result<AdminInstructorDetailDto>.Ok(await ToDetailAsync(created!));
    }

    public async Task<Result<AdminInstructorDetailDto>> UpdateInstructorAsync(long id, UpdateInstructorDto dto, CancellationToken ct = default)
    {
        var instructor = await LoadAsync(id, track: true);
        if (instructor is null) return Result<AdminInstructorDetailDto>.Fail(NotFound);

        instructor.User.FirstName = dto.FirstName.Trim();
        instructor.User.LastName = dto.LastName.Trim();
        instructor.User.MobileNumber = dto.MobileNumber.Trim();
        instructor.JobTitle = dto.JobTitle?.Trim() ?? "";
        instructor.Bio = dto.Bio?.Trim() ?? "";
        instructor.AvatarUrl = dto.AvatarUrl?.Trim() ?? "";

        await uow.SaveChangesAsync();
        return Result<AdminInstructorDetailDto>.Ok(await ToDetailAsync(instructor));
    }

    public async Task<Result<AdminInstructorDetailDto>> SetStatusAsync(long actingUserId, long id, bool isActive, CancellationToken ct = default)
    {
        if (actingUserId == id && !isActive)
            return Result<AdminInstructorDetailDto>.Fail(Error.Conflict("Instructor.Self", "You cannot deactivate your own account."));

        var instructor = await LoadAsync(id, track: true);
        if (instructor is null) return Result<AdminInstructorDetailDto>.Fail(NotFound);

        instructor.User.IsActive = isActive;
        await uow.SaveChangesAsync();
        return Result<AdminInstructorDetailDto>.Ok(await ToDetailAsync(instructor));
    }

    // ------------------------------------------------------------------ helpers

    private async Task<Instructor?> LoadAsync(long id, bool track) =>
        await uow.GetRepository<Instructor>().GetAsync(
            new QuerySpecification<Instructor>(i => i.InstructorId == id).Include(i => i.User), trackChanges: track);

    private async Task<Dictionary<long, int>> ScheduleCountsAsync(IReadOnlyCollection<long> instructorIds)
    {
        if (instructorIds.Count == 0) return new Dictionary<long, int>();
        var links = await uow.GetRepository<ScheduleInstructor>().GetAllAsync(
            new QuerySpecification<ScheduleInstructor>(l => instructorIds.Contains(l.InstructorId)));
        return links.GroupBy(l => l.InstructorId).ToDictionary(g => g.Key, g => g.Count());
    }

    private async Task<AdminInstructorDetailDto> ToDetailAsync(Instructor i)
    {
        var schedules = await uow.GetRepository<ScheduleInstructor>()
            .CountAsync(new QuerySpecification<ScheduleInstructor>(l => l.InstructorId == i.InstructorId));
        var pending = await uow.GetRepository<InstructorPayout>().CountAsync(
            new QuerySpecification<InstructorPayout>(p => p.InstructorId == i.InstructorId && p.Status == InstructorPayoutStatus.Pending));

        return new AdminInstructorDetailDto(
            i.InstructorId, i.User.FirstName, i.User.LastName, StaffScope.FullName(i.User), i.User.Email,
            i.User.MobileNumber, i.JobTitle, i.Bio, i.AvatarUrl, i.User.IsActive, schedules, pending, i.User.CreatedAt);
    }

    private static Error NotFound => Error.NotFound("Instructor.NotFound", "Instructor not found.");
}
