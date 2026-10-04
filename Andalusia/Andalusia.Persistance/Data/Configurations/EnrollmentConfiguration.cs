using AndalusiaApp.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AndalusiaApp.Data.Configurations
{
    public class EnrollmentConfiguration : IEntityTypeConfiguration<Enrollment>
    {
        public void Configure(EntityTypeBuilder<Enrollment> builder)
        {
            const string xor = "([CourseId] IS NOT NULL AND [ProgramId] IS NULL) OR ([CourseId] IS NULL AND [ProgramId] IS NOT NULL)";

            builder.ToTable("ENROLLMENTS", t =>
            {
                t.HasCheckConstraint("CK_Enrollments_CourseXorProgram", xor);
                t.HasCheckConstraint("CK_Enrollments_Status", "[Status] IN ('Enrolled','Active','Completed','Cancelled')");
            });

            builder.HasKey(x => x.EnrollmentId);
            builder.Property(x => x.Status)
                   .HasConversion<string>()
                   .HasMaxLength(50);

            builder.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId);
            builder.HasOne(x => x.Course).WithMany().HasForeignKey(x => x.CourseId);
            builder.HasOne(x => x.Program).WithMany().HasForeignKey(x => x.ProgramId);
            builder.HasOne(x => x.Schedule).WithMany().HasForeignKey(x => x.ScheduleId);
            builder.HasOne(x => x.Application).WithMany().HasForeignKey(x => x.ApplicationId);

            builder.HasIndex(x => new { x.UserId, x.ScheduleId }).IsUnique()
                   .HasDatabaseName("UX_Enrollment_Schedule").HasFilter("[ScheduleId] IS NOT NULL");
            builder.HasIndex(x => new { x.UserId, x.ProgramId }).IsUnique()
                   .HasDatabaseName("UX_Enrollment_Program").HasFilter("[ProgramId] IS NOT NULL AND [ScheduleId] IS NULL");
            builder.HasIndex(x => new { x.UserId, x.CourseId }).IsUnique()
                   .HasDatabaseName("UX_Enrollment_Course").HasFilter("[CourseId] IS NOT NULL AND [ScheduleId] IS NULL");
            builder.HasIndex(x => x.ApplicationId).IsUnique()
                   .HasDatabaseName("UX_Enrollment_Application").HasFilter("[ApplicationId] IS NOT NULL");
        }
    }
}