using System.Reflection;
using AndalusiaApp.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

namespace AndalusiaApp.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<EmailVerificationToken> EmailVerificationTokens => Set<EmailVerificationToken>();
        public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();
        public DbSet<Role> Roles => Set<Role>();
        public DbSet<Permission> Permissions => Set<Permission>();
        public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
        public DbSet<UserRole> UserRoles => Set<UserRole>();
        public DbSet<Instructor> Instructors => Set<Instructor>();
        public DbSet<InstructorPayout> InstructorPayouts => Set<InstructorPayout>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<CareerPath> CareerPaths => Set<CareerPath>();
        public DbSet<AndalusiaApp.Models.Program> Programs => Set<AndalusiaApp.Models.Program>();
        public DbSet<Course> Courses => Set<Course>();
        public DbSet<ProgramCourse> ProgramCourses => Set<ProgramCourse>();
        public DbSet<RelatedCourse> RelatedCourses => Set<RelatedCourse>();
        public DbSet<RelatedProgram> RelatedPrograms => Set<RelatedProgram>();
        public DbSet<Schedule> Schedules => Set<Schedule>();
        public DbSet<ScheduleInstructor> ScheduleInstructors => Set<ScheduleInstructor>();
        public DbSet<Session> Sessions => Set<Session>();
        public DbSet<Attendance> Attendances => Set<Attendance>();
        public DbSet<Application> Applications => Set<Application>();
        public DbSet<Enrollment> Enrollments => Set<Enrollment>();
        public DbSet<Payment> Payments => Set<Payment>();
        public DbSet<CourseMaterial> CourseMaterials => Set<CourseMaterial>();
        public DbSet<Assignment> Assignments => Set<Assignment>();
        public DbSet<AssignmentSubmission> AssignmentSubmissions => Set<AssignmentSubmission>();
        public DbSet<Progress> ProgressRecords => Set<Progress>();
        public DbSet<Notification> Notifications => Set<Notification>();
        public DbSet<ContactEnquiry> ContactEnquiries => Set<ContactEnquiry>();
        public DbSet<Partner> Partners => Set<Partner>();
        public DbSet<ProgramPartner> ProgramPartners => Set<ProgramPartner>();
        public DbSet<Testimonial> Testimonials => Set<Testimonial>();
        public DbSet<Faq> Faqs => Set<Faq>();
        public DbSet<ContentPage> ContentPages => Set<ContentPage>();

        protected override void OnModelCreating(ModelBuilder b)
        {
            base.OnModelCreating(b);
            b.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

            // SQL Server: منع مشاكل الـ multiple cascade paths.
            // كل الـ FKs بتبقى Restrict، إلا اللي اتحدد عليه OnDelete(...) صراحةً جوه الـ Configurations
            // (زي UserRole و RolePermission و ProgramCourse). الـ Cascade الافتراضي بتاع EF هو اللي بيتحول لـ Restrict.
            foreach (var fk in b.Model.GetEntityTypes().SelectMany(e => e.GetForeignKeys()))
            {
                var source = ((IConventionForeignKey)fk).GetDeleteBehaviorConfigurationSource();
                if (source != ConfigurationSource.Explicit)
                {
                    fk.DeleteBehavior = DeleteBehavior.Restrict;
                }
            }
        }
    }
}