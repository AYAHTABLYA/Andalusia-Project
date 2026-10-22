namespace Andalusia.ServicesAbstraction;

/// <summary>
/// The signed-in staff member behind a request. Admins/Managers see everything;
/// everyone else (Instructors) is scoped to the schedules they teach.
/// </summary>
public readonly record struct StaffActor(long UserId, bool IsAdmin);
