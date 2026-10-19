namespace Andalusia.Shared.Authorization;

public static class AppClaimTypes
{
    public const string Permission = "permission";
}

/// <summary>
/// Permission codes + the default role -> permission matrix.
/// Every code is registered as an authorization policy with the same name,
/// so controllers use [Authorize(Policy = AppPermissions.AttendanceManage)].
/// </summary>
public static class AppPermissions
{
    // Catalog management
    public const string CoursesManage = "courses.manage";
    public const string ProgramsManage = "programs.manage";
    public const string CareerPathsManage = "careerpaths.manage";
    public const string ContentManage = "content.manage";

    // Admissions & money
    public const string ApplicationsReview = "applications.review";
    public const string PaymentsView = "payments.view";

    // People
    public const string UsersManage = "users.manage";
    public const string InstructorsManage = "instructors.manage";
    public const string StudentsView = "students.view";
    public const string EnrollmentsView = "enrollments.view";

    // Teaching operations (Sprint 4)
    public const string SchedulesManage = "schedules.manage";
    public const string SessionsManage = "sessions.manage";
    public const string AttendanceManage = "attendance.manage";
    public const string AssignmentsManage = "assignments.manage";
    public const string ReportsView = "reports.view";

    // Learner side (Sprint 4)
    public const string LearningAccess = "learning.access";

    public static readonly IReadOnlyList<(string Code, string Description)> Catalog =
    [
        (CoursesManage, "Create, edit and archive courses"),
        (ProgramsManage, "Create, edit and archive programs"),
        (CareerPathsManage, "Create and edit career paths"),
        (ContentManage, "Edit FAQs, testimonials and content pages"),
        (ApplicationsReview, "Review and decide on applications"),
        (PaymentsView, "View payments and payouts"),
        (UsersManage, "Manage user accounts and roles"),
        (InstructorsManage, "Manage instructor profiles and assignments"),
        (StudentsView, "View students (own students for instructors)"),
        (EnrollmentsView, "View enrollments and progress"),
        (SchedulesManage, "Create and edit course schedules/cohorts"),
        (SessionsManage, "Create and edit class sessions"),
        (AttendanceManage, "Mark and edit attendance"),
        (AssignmentsManage, "Create assignments and grade submissions"),
        (ReportsView, "View operational reports"),
        (LearningAccess, "Access own enrolled courses, materials, sessions and assignments"),
    ];

    public static IReadOnlyList<string> All { get; } = Catalog.Select(p => p.Code).ToList();

    /// <summary>Default matrix. The seeder only ever ADDS missing links, so manual changes in the DB survive.</summary>
    public static readonly IReadOnlyDictionary<string, string[]> RoleGrants =
        new Dictionary<string, string[]>
        {
            [AppRoles.Admin] = All.ToArray(),

            [AppRoles.Manager] =
            [
                CoursesManage, ProgramsManage, CareerPathsManage, ApplicationsReview, PaymentsView,
                InstructorsManage, StudentsView, EnrollmentsView, SchedulesManage, SessionsManage,
                AttendanceManage, ReportsView,
            ],

            [AppRoles.ContentManager] =
            [
                ContentManage, CoursesManage, ProgramsManage, CareerPathsManage,
            ],

            [AppRoles.Instructor] =
            [
                StudentsView, EnrollmentsView, SessionsManage, AttendanceManage, AssignmentsManage,
            ],

            [AppRoles.Learner] = [LearningAccess],
        };
}
