namespace Andalusia.ServicesAbstraction;

/// <summary>
/// The signed-in staff member behind a request. Admins/Managers and Coordinators receive academy-wide operational scope on explicitly authorized staff endpoints;
/// Instructors remain scoped to schedules they teach.
/// </summary>
public readonly record struct StaffActor(long UserId, bool IsAdmin);
