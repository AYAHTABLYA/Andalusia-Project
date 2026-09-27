using AndalusiaApp.Models;
using Microsoft.EntityFrameworkCore;


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
        public DbSet<AndalusiaApp.Models.Program> Programs
    => Set<AndalusiaApp.Models.Program>();
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
        public DbSet<Testimonial> Testimonials => Set<Testimonial>();
        public DbSet<Faq> Faqs => Set<Faq>();
        public DbSet<ContentPage> ContentPages => Set<ContentPage>();

        protected override void OnModelCreating(ModelBuilder b)
        {
            base.OnModelCreating(b);

            // SQL Server: منع مشاكل multiple cascade paths -> كل الـ FKs Restrict، والـ Cascade بنحدده يدوي تحت
            foreach (var fk in b.Model.GetEntityTypes().SelectMany(e => e.GetForeignKeys()))
                fk.DeleteBehavior = DeleteBehavior.Restrict;

            // ===== 1. Identity =====
            b.Entity<User>(e =>
            {
                e.ToTable("USERS");
                e.HasKey(x => x.UserId);
                e.Property(x => x.FirstName).HasMaxLength(50);
                e.Property(x => x.LastName).HasMaxLength(50);
                e.Property(x => x.Email).HasMaxLength(255);
                e.Property(x => x.MobileNumber).HasMaxLength(20);
                e.Property(x => x.Country).HasMaxLength(50);
                e.Property(x => x.PreferredLanguage).HasMaxLength(10);
                e.HasIndex(x => x.Email).IsUnique();
            });

            b.Entity<EmailVerificationToken>(e =>
            {
                e.ToTable("EMAIL_VERIFICATION_TOKENS");
                e.HasKey(x => x.VerificationId);
                e.Property(x => x.Token).HasMaxLength(255);
                e.HasIndex(x => x.Token).IsUnique();
                e.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
            });

            b.Entity<PasswordResetToken>(e =>
            {
                e.ToTable("PASSWORD_RESET_TOKENS");
                e.HasKey(x => x.ResetId);
                e.Property(x => x.Token).HasMaxLength(255);
                e.HasIndex(x => x.Token).IsUnique();
                e.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
            });

            b.Entity<Role>(e =>
            {
                e.ToTable("ROLES");
                e.HasKey(x => x.RoleId);
                e.Property(x => x.Name).HasMaxLength(50);
                e.HasIndex(x => x.Name).IsUnique();
                e.HasData(
                    new Role { RoleId = 1, Name = "Learner" },
                    new Role { RoleId = 2, Name = "Instructor" },
                    new Role { RoleId = 3, Name = "Manager" },
                    new Role { RoleId = 4, Name = "Admin" },
                    new Role { RoleId = 5, Name = "Content_Manager" });
            });

            b.Entity<Permission>(e =>
            {
                e.ToTable("PERMISSIONS");
                e.HasKey(x => x.PermissionId);
                e.Property(x => x.Code).HasMaxLength(100);
                e.Property(x => x.Description).HasMaxLength(255);
                e.HasIndex(x => x.Code).IsUnique();
            });

            b.Entity<RolePermission>(e =>
            {
                e.ToTable("ROLE_PERMISSIONS");
                e.HasKey(x => new { x.RoleId, x.PermissionId });
                e.HasOne(x => x.Role).WithMany(r => r.RolePermissions).HasForeignKey(x => x.RoleId).OnDelete(DeleteBehavior.Cascade);
                e.HasOne(x => x.Permission).WithMany(p => p.RolePermissions).HasForeignKey(x => x.PermissionId).OnDelete(DeleteBehavior.Cascade);
            });

            b.Entity<UserRole>(e =>
            {
                e.ToTable("USER_ROLES");
                e.HasKey(x => new { x.UserId, x.RoleId });
                e.HasOne(x => x.User).WithMany(u => u.UserRoles).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
                e.HasOne(x => x.Role).WithMany(r => r.UserRoles).HasForeignKey(x => x.RoleId).OnDelete(DeleteBehavior.Cascade);
            });

            // ===== 2. Instructors =====
            b.Entity<Instructor>(e =>
            {
                e.ToTable("INSTRUCTORS");
                e.HasKey(x => x.InstructorId);
                e.Property(x => x.InstructorId).ValueGeneratedNever();
                e.Property(x => x.JobTitle).HasMaxLength(100);
                e.Property(x => x.AvatarUrl).HasMaxLength(500);
                e.HasOne(x => x.User).WithOne(u => u.Instructor).HasForeignKey<Instructor>(x => x.InstructorId);
            });

            b.Entity<InstructorPayout>(e =>
            {
                e.ToTable("INSTRUCTOR_PAYOUTS", t =>
                    t.HasCheckConstraint("CK_InstructorPayouts_Status", "[status] IN ('Pending','Paid','Cancelled')"));
                e.HasKey(x => x.PayoutId);
                e.Property(x => x.Amount).HasColumnType("decimal(18,2)");
                e.Property(x => x.Currency).HasMaxLength(10);
                e.Property(x => x.Status).HasMaxLength(50);
                e.Property(x => x.Notes).HasMaxLength(500);
                e.HasOne(x => x.Instructor).WithMany(i => i.Payouts).HasForeignKey(x => x.InstructorId);
                e.HasOne(x => x.Schedule).WithMany().HasForeignKey(x => x.ScheduleId);
                e.HasOne(x => x.ProcessedByUser).WithMany().HasForeignKey(x => x.ProcessedBy);
            });

            // ===== 3. Catalog =====
            b.Entity<Category>(e =>
            {
                e.ToTable("CATEGORIES");
                e.HasKey(x => x.CategoryId);
                e.Property(x => x.Name).HasMaxLength(100);
                e.Property(x => x.Slug).HasMaxLength(120);
                e.HasIndex(x => x.Slug).IsUnique();
            });

            b.Entity<CareerPath>(e =>
            {
                e.ToTable("CAREER_PATHS");
                e.HasKey(x => x.CareerPathId);
                e.Property(x => x.Title).HasMaxLength(200);
                e.Property(x => x.Status).HasMaxLength(50);
            });

            b.Entity<AndalusiaApp.Models.Program>(e =>
            {
                e.ToTable("PROGRAMS", t =>
                    t.HasCheckConstraint("CK_Programs_Status", "[status] IN ('Draft','Active','Archived')"));
                e.HasKey(x => x.ProgramId);
                e.Property(x => x.Title).HasMaxLength(200);
                e.Property(x => x.Duration).HasMaxLength(100);
                e.Property(x => x.Price).HasColumnType("decimal(18,2)");
                e.Property(x => x.Status).HasMaxLength(50);
                e.HasOne(x => x.Category).WithMany(c => c.Programs).HasForeignKey(x => x.CategoryId);
                e.HasOne(x => x.CareerPath).WithMany(c => c.Programs).HasForeignKey(x => x.CareerPathId);
            });

            b.Entity<Course>(e =>
            {
                e.ToTable("COURSES", t =>
                    t.HasCheckConstraint("CK_Courses_Status", "[status] IN ('Draft','Upcoming','Active','Closed')"));
                e.HasKey(x => x.CourseId);
                e.Property(x => x.Title).HasMaxLength(200);
                e.Property(x => x.ShortDescription).HasMaxLength(500);
                e.Property(x => x.Duration).HasMaxLength(100);
                e.Property(x => x.Price).HasColumnType("decimal(18,2)");
                e.Property(x => x.Type).HasMaxLength(50);
                e.Property(x => x.Status).HasMaxLength(50);
                e.Property(x => x.ImageUrl).HasMaxLength(500);
                e.HasOne(x => x.Category).WithMany(c => c.Courses).HasForeignKey(x => x.CategoryId);
            });

            b.Entity<ProgramCourse>(e =>
            {
                e.ToTable("PROGRAM_COURSES");
                e.HasKey(x => new { x.ProgramId, x.CourseId });
                e.HasOne(x => x.Program).WithMany(p => p.ProgramCourses).HasForeignKey(x => x.ProgramId).OnDelete(DeleteBehavior.Cascade);
                e.HasOne(x => x.Course).WithMany(c => c.ProgramCourses).HasForeignKey(x => x.CourseId);
            });

            b.Entity<RelatedCourse>(e =>
            {
                e.ToTable("RELATED_COURSES", t =>
                    t.HasCheckConstraint("CK_RelatedCourses_NotSelf", "[course_id] <> [related_course_id]"));
                e.HasKey(x => new { x.CourseId, x.RelatedCourseId });
                e.HasOne(x => x.Course).WithMany().HasForeignKey(x => x.CourseId);
                e.HasOne(x => x.Related).WithMany().HasForeignKey(x => x.RelatedCourseId);
            });

            b.Entity<RelatedProgram>(e =>
            {
                e.ToTable("RELATED_PROGRAMS", t =>
                    t.HasCheckConstraint("CK_RelatedPrograms_NotSelf", "[program_id] <> [related_program_id]"));
                e.HasKey(x => new { x.ProgramId, x.RelatedProgramId });
                e.HasOne(x => x.Program).WithMany().HasForeignKey(x => x.ProgramId);
                e.HasOne(x => x.Related).WithMany().HasForeignKey(x => x.RelatedProgramId);
            });

            // ===== 4. Offline Ops =====
            b.Entity<Schedule>(e =>
            {
                e.ToTable("SCHEDULES", t =>
                {
                    t.HasCheckConstraint("CK_Schedules_CourseXorProgram",
                        "([course_id] IS NOT NULL AND [program_id] IS NULL) OR ([course_id] IS NULL AND [program_id] IS NOT NULL)");
                    t.HasCheckConstraint("CK_Schedules_Status", "[status] IN ('Scheduled','Running','Completed','Cancelled')");
                });
                e.HasKey(x => x.ScheduleId);
                e.Property(x => x.BatchCode).HasMaxLength(50);
                e.Property(x => x.VenueName).HasMaxLength(150);
                e.Property(x => x.RoomNumber).HasMaxLength(50);
                e.Property(x => x.Status).HasMaxLength(50);
                e.HasOne(x => x.Course).WithMany().HasForeignKey(x => x.CourseId);
                e.HasOne(x => x.Program).WithMany().HasForeignKey(x => x.ProgramId);
            });

            b.Entity<ScheduleInstructor>(e =>
            {
                e.ToTable("SCHEDULE_INSTRUCTORS");
                e.HasKey(x => new { x.ScheduleId, x.InstructorId });
                e.HasOne(x => x.Schedule).WithMany(s => s.ScheduleInstructors).HasForeignKey(x => x.ScheduleId).OnDelete(DeleteBehavior.Cascade);
                e.HasOne(x => x.Instructor).WithMany(i => i.ScheduleInstructors).HasForeignKey(x => x.InstructorId);
            });

            b.Entity<Session>(e =>
            {
                e.ToTable("SESSIONS");
                e.HasKey(x => x.SessionId);
                e.Property(x => x.Title).HasMaxLength(200);
                e.Property(x => x.RoomDetails).HasMaxLength(100);
                e.HasOne(x => x.Schedule).WithMany(s => s.Sessions).HasForeignKey(x => x.ScheduleId);
            });

            b.Entity<Attendance>(e =>
            {
                e.ToTable("ATTENDANCE", t =>
                    t.HasCheckConstraint("CK_Attendance_Status", "[status] IN ('Present','Absent','Late','Excused')"));
                e.HasKey(x => x.AttendanceId);
                e.Property(x => x.Status).HasMaxLength(50);
                e.HasIndex(x => new { x.SessionId, x.LearnerId }).IsUnique();
                e.HasOne(x => x.Session).WithMany().HasForeignKey(x => x.SessionId);
                e.HasOne(x => x.Learner).WithMany().HasForeignKey(x => x.LearnerId);
            });

            // ===== 5. Enrollment Flow =====
            const string xor = "([course_id] IS NOT NULL AND [program_id] IS NULL) OR ([course_id] IS NULL AND [program_id] IS NOT NULL)";

            b.Entity<Application>(e =>
            {
                e.ToTable("APPLICATIONS", t =>
                {
                    t.HasCheckConstraint("CK_Applications_CourseXorProgram", xor);
                    t.HasCheckConstraint("CK_Applications_Status", "[status] IN ('Submitted','Under_Review','Approved','Rejected')");
                });
                e.HasKey(x => x.ApplicationId);
                e.Property(x => x.Status).HasMaxLength(50);
                e.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId);
                e.HasOne(x => x.Course).WithMany().HasForeignKey(x => x.CourseId);
                e.HasOne(x => x.Program).WithMany().HasForeignKey(x => x.ProgramId);
                e.HasOne(x => x.Schedule).WithMany().HasForeignKey(x => x.ScheduleId);
            });

            b.Entity<Enrollment>(e =>
            {
                e.ToTable("ENROLLMENTS", t =>
                {
                    t.HasCheckConstraint("CK_Enrollments_CourseXorProgram", xor);
                    t.HasCheckConstraint("CK_Enrollments_Status", "[status] IN ('Enrolled','Active','Completed','Cancelled')");
                });
                e.HasKey(x => x.EnrollmentId);
                e.Property(x => x.Status).HasMaxLength(50);
                e.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId);
                e.HasOne(x => x.Course).WithMany().HasForeignKey(x => x.CourseId);
                e.HasOne(x => x.Program).WithMany().HasForeignKey(x => x.ProgramId);
                e.HasOne(x => x.Schedule).WithMany().HasForeignKey(x => x.ScheduleId);
                e.HasOne(x => x.Application).WithMany().HasForeignKey(x => x.ApplicationId);

                e.HasIndex(x => new { x.UserId, x.ScheduleId }).IsUnique()
                    .HasDatabaseName("UX_Enrollment_Schedule").HasFilter("[schedule_id] IS NOT NULL");
                e.HasIndex(x => new { x.UserId, x.ProgramId }).IsUnique()
                    .HasDatabaseName("UX_Enrollment_Program").HasFilter("[program_id] IS NOT NULL AND [schedule_id] IS NULL");
                e.HasIndex(x => new { x.UserId, x.CourseId }).IsUnique()
                    .HasDatabaseName("UX_Enrollment_Course").HasFilter("[course_id] IS NOT NULL AND [schedule_id] IS NULL");
                // الـ diagram بيقول Application 1 : 0..1 Enrollment
                e.HasIndex(x => x.ApplicationId).IsUnique()
                    .HasDatabaseName("UX_Enrollment_Application").HasFilter("[application_id] IS NOT NULL");
            });

            b.Entity<Payment>(e =>
            {
                e.ToTable("PAYMENTS", t =>
                {
                    t.HasCheckConstraint("CK_Payments_Target", "[application_id] IS NOT NULL OR [enrollment_id] IS NOT NULL");
                    t.HasCheckConstraint("CK_Payments_Status", "[status] IN ('Initiated','Success','Failed','Refunded')");
                });
                e.HasKey(x => x.PaymentId);
                e.Property(x => x.Amount).HasColumnType("decimal(18,2)");
                e.Property(x => x.Currency).HasMaxLength(10);
                e.Property(x => x.GatewayName).HasMaxLength(50);
                e.Property(x => x.TransactionRef).HasMaxLength(100);
                e.Property(x => x.Status).HasMaxLength(50);
                e.HasIndex(x => x.TransactionRef).IsUnique();
                e.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId);
                e.HasOne(x => x.Application).WithMany().HasForeignKey(x => x.ApplicationId);
                e.HasOne(x => x.Enrollment).WithMany().HasForeignKey(x => x.EnrollmentId);
            });

            // ===== 6. LMS =====
            b.Entity<CourseMaterial>(e =>
            {
                e.ToTable("COURSE_MATERIALS", t =>
                    t.HasCheckConstraint("CK_CourseMaterials_Type", "[resource_type] IN ('Slide','Document','Reference_Link')"));
                e.HasKey(x => x.MaterialId);
                e.Property(x => x.Title).HasMaxLength(200);
                e.Property(x => x.FileUrl).HasMaxLength(500);
                e.Property(x => x.ResourceType).HasMaxLength(50);
                e.HasOne(x => x.Course).WithMany().HasForeignKey(x => x.CourseId);
                e.HasOne(x => x.Schedule).WithMany().HasForeignKey(x => x.ScheduleId);
            });

            b.Entity<Assignment>(e =>
            {
                e.ToTable("ASSIGNMENTS");
                e.HasKey(x => x.AssignmentId);
                e.Property(x => x.Title).HasMaxLength(200);
                e.HasOne(x => x.Schedule).WithMany().HasForeignKey(x => x.ScheduleId);
            });

            b.Entity<AssignmentSubmission>(e =>
            {
                e.ToTable("ASSIGNMENT_SUBMISSIONS", t =>
                    t.HasCheckConstraint("CK_AssignmentSubmissions_Status", "[status] IN ('Submitted','Late')"));
                e.HasKey(x => x.SubmissionId);
                e.Property(x => x.AttemptNumber).HasDefaultValue(1);
                e.Property(x => x.FileUrl).HasMaxLength(500);
                e.Property(x => x.Status).HasMaxLength(50);
                e.HasIndex(x => new { x.AssignmentId, x.LearnerId, x.AttemptNumber }).IsUnique();
                e.HasOne(x => x.Assignment).WithMany().HasForeignKey(x => x.AssignmentId);
                e.HasOne(x => x.Learner).WithMany().HasForeignKey(x => x.LearnerId);
            });

            b.Entity<Progress>(e =>
            {
                e.ToTable("PROGRESS");
                e.HasKey(x => x.ProgressId);
                e.Property(x => x.ProgressPercentage).HasColumnType("decimal(5,2)");
                e.HasIndex(x => x.EnrollmentId).IsUnique();
                e.HasOne(x => x.Enrollment).WithOne(en => en.Progress).HasForeignKey<Progress>(x => x.EnrollmentId);
            });

            // ===== 7. CMS =====
            b.Entity<Notification>(e =>
            {
                e.ToTable("NOTIFICATIONS");
                e.HasKey(x => x.NotificationId);
                e.Property(x => x.Title).HasMaxLength(200);
                e.Property(x => x.Type).HasMaxLength(50);
                e.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
            });

            b.Entity<ContactEnquiry>(e =>
            {
                e.ToTable("CONTACT_ENQUIRIES", t =>
                {
                    t.HasCheckConstraint("CK_ContactEnquiries_Subject", "[subject_type] IN ('General','Course','Program','Corporate')");
                    t.HasCheckConstraint("CK_ContactEnquiries_Status", "[status] IN ('New','In_Progress','Resolved','Closed')");
                });
                e.HasKey(x => x.EnquiryId);
                e.Property(x => x.FullName).HasMaxLength(150);
                e.Property(x => x.Email).HasMaxLength(255);
                e.Property(x => x.MobileNumber).HasMaxLength(20);
                e.Property(x => x.SubjectType).HasMaxLength(50);
                e.Property(x => x.Status).HasMaxLength(50);
            });

            b.Entity<Partner>(e =>
            {
                e.ToTable("PARTNERS", t =>
                    t.HasCheckConstraint("CK_Partners_Type", "[type] IN ('Accreditation','Success_Partner')"));
                e.HasKey(x => x.PartnerId);
                e.Property(x => x.Name).HasMaxLength(150);
                e.Property(x => x.LogoUrl).HasMaxLength(500);
                e.Property(x => x.Type).HasMaxLength(50);
            });

            b.Entity<Testimonial>(e =>
            {
                e.ToTable("TESTIMONIALS");
                e.HasKey(x => x.TestimonialId);
                e.Property(x => x.ClientName).HasMaxLength(150);
                e.Property(x => x.TitleOrRole).HasMaxLength(150);
                e.Property(x => x.AvatarUrl).HasMaxLength(500);
            });

            b.Entity<Faq>(e =>
            {
                e.ToTable("FAQS");
                e.HasKey(x => x.FaqId);
                e.Property(x => x.Question).HasMaxLength(500);
                e.HasOne(x => x.Category).WithMany(c => c.Faqs).HasForeignKey(x => x.CategoryId);
                e.HasIndex(x => new { x.CategoryId, x.OrderIndex }).IsUnique()
                    .HasDatabaseName("UX_Faq_Category_Order").HasFilter("[category_id] IS NOT NULL");
                e.HasIndex(x => x.OrderIndex).IsUnique()
                    .HasDatabaseName("UX_Faq_General_Order").HasFilter("[category_id] IS NULL");
            });

            b.Entity<ContentPage>(e =>
            {
                e.ToTable("CONTENT_PAGES");
                e.HasKey(x => x.PageId);
                e.Property(x => x.PageKey).HasMaxLength(50);
                e.Property(x => x.SectionKey).HasMaxLength(50);
                e.HasIndex(x => new { x.PageKey, x.SectionKey }).IsUnique();
                e.HasOne(x => x.UpdatedByUser).WithMany().HasForeignKey(x => x.UpdatedBy);
            });
        }
    }




}

