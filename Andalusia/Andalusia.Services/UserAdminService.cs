using Andalusia.Domain.Contracts;
using Andalusia.ServicesAbstraction;
using Andalusia.Services.Specification;
using Andalusia.Shared;
using Andalusia.Shared.Authorization;
using Andalusia.Shared.Dtos.AdminDtos;
using AndalusiaApp.Models;

namespace Andalusia.Services;

public class UserAdminService(IUnitOfWork uow) : IUserAdminService
{
    public async Task<PaginatedResult<AdminUserDto>> GetUsersAsync(
        string? search, string? role, int page, int pageSize, CancellationToken ct = default)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var userRepo = uow.GetRepository<User>();
        var total = await userRepo.CountAsync(new UsersAdminSpecification(search, role));
        var users = (await userRepo.GetAllAsync(
            new UsersAdminSpecification(search, role, (page - 1) * pageSize, pageSize, paginate: true))).ToList();

        var roleByUser = await GetRoleNamesAsync(users.Select(u => u.UserId).ToList());

        var rows = users.Select(u => ToDto(u, roleByUser.GetValueOrDefault(u.UserId, AppRoles.Learner)));
        return new PaginatedResult<AdminUserDto>(page, pageSize, total, rows.ToList());
    }

    public async Task<AdminUserDto> CreateStaffUserAsync(CreateStaffUserDto dto, CancellationToken ct = default)
    {
        var roleName = dto.Role.Trim();
        if (!AppRoles.IsValid(roleName))
            throw new ArgumentException($"Unknown role '{dto.Role}'.");

        var email = dto.Email.Trim().ToLowerInvariant();
        var userRepo = uow.GetRepository<User>();

        if (await userRepo.GetAsync(new UserByEmailSpecification(email)) is not null)
            throw new InvalidOperationException("Email is already registered.");

        var role = await FindRoleAsync(roleName)
            ?? throw new InvalidOperationException($"Role '{roleName}' is not configured.");

        var user = new User
        {
            FirstName = dto.FirstName.Trim(),
            LastName = dto.LastName.Trim(),
            Email = email,
            MobileNumber = dto.MobileNumber.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.TemporaryPassword),
            IsActive = true,
            IsEmailVerified = true,           // created by an admin, no OTP step
            TermsAcceptedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };
        user.UserRoles.Add(new UserRole { RoleId = role.RoleId });

        if (roleName == AppRoles.Instructor)
            user.Instructor = new Instructor();

        await userRepo.AddAsync(user);
        await uow.SaveChangesAsync();

        return ToDto(user, roleName);
    }

    public async Task<AdminUserDto?> ChangeRoleAsync(
        long actingUserId, long targetUserId, string roleName, CancellationToken ct = default)
    {
        roleName = roleName.Trim();
        if (!AppRoles.IsValid(roleName))
            throw new ArgumentException($"Unknown role '{roleName}'.");

        if (actingUserId == targetUserId)
            throw new InvalidOperationException("You cannot change your own role.");

        var user = await uow.GetRepository<User>().GetByIdAsync(targetUserId);
        if (user is null) return null;

        var role = await FindRoleAsync(roleName)
            ?? throw new InvalidOperationException($"Role '{roleName}' is not configured.");

        var userRoleRepo = uow.GetRepository<UserRole>();
        var current = (await userRoleRepo.GetAllAsync(
            new UserRolesByUsersSpecification([targetUserId]), trackChanges: true)).ToList();

        if (!current.Any(ur => ur.RoleId == role.RoleId))
        {
            foreach (var old in current) userRoleRepo.Remove(old);
            await userRoleRepo.AddAsync(new UserRole { UserId = targetUserId, RoleId = role.RoleId });
        }

        // Instructor rows are never deleted (schedules/payouts point to them); only created on demand.
        if (roleName == AppRoles.Instructor &&
            await uow.GetRepository<Instructor>().GetByIdAsync(targetUserId) is null)
        {
            await uow.GetRepository<Instructor>().AddAsync(new Instructor { InstructorId = targetUserId });
        }

        await uow.SaveChangesAsync();
        return ToDto(user, roleName);
    }

    public async Task<AdminUserDto?> SetStatusAsync(
        long actingUserId, long targetUserId, bool isActive, CancellationToken ct = default)
    {
        if (actingUserId == targetUserId && !isActive)
            throw new InvalidOperationException("You cannot deactivate your own account.");

        var user = await uow.GetRepository<User>().GetByIdAsync(targetUserId);
        if (user is null) return null;

        user.IsActive = isActive;
        await uow.SaveChangesAsync();

        var roles = await GetRoleNamesAsync([targetUserId]);
        return ToDto(user, roles.GetValueOrDefault(targetUserId, AppRoles.Learner));
    }

    public async Task<IReadOnlyList<RoleDto>> GetRolesAsync(CancellationToken ct = default)
    {
        var roles = (await uow.GetRepository<Role>().GetAllAsync()).OrderBy(r => r.RoleId).ToList();
        var links = (await uow.GetRepository<RolePermission>().GetAllAsync(new AllRolePermissionsSpecification())).ToList();
        var userRoles = (await uow.GetRepository<UserRole>().GetAllAsync()).ToList();

        return roles
            .Select(r => new RoleDto(
                r.RoleId,
                r.Name,
                links.Where(l => l.RoleId == r.RoleId).Select(l => l.Permission.Code).OrderBy(c => c).ToList(),
                userRoles.Count(ur => ur.RoleId == r.RoleId)))
            .ToList();
    }

    private async Task<Role?> FindRoleAsync(string name) =>
        (await uow.GetRepository<Role>().GetAllAsync()).FirstOrDefault(r => r.Name == name);

    private async Task<Dictionary<long, string>> GetRoleNamesAsync(IReadOnlyCollection<long> userIds)
    {
        var links = await uow.GetRepository<UserRole>().GetAllAsync(new UserRolesByUsersSpecification(userIds));
        return links
            .GroupBy(ur => ur.UserId)
            .ToDictionary(g => g.Key, g => g.First().Role.Name);
    }

    private static AdminUserDto ToDto(User u, string role) => new(
        u.UserId,
        $"{u.FirstName} {u.LastName}".Trim(),
        u.Email,
        u.MobileNumber,
        role,
        u.IsActive,
        u.IsEmailVerified,
        u.CreatedAt);
}
