using AndalusiaApp.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AndalusiaApp.Data.Configurations
{
    public class ApplicationConfiguration : IEntityTypeConfiguration<Application>
    {
        public void Configure(EntityTypeBuilder<Application> builder)
        {
            const string xor = "([CourseId] IS NOT NULL AND [ProgramId] IS NULL) OR ([CourseId] IS NULL AND [ProgramId] IS NOT NULL)";

            builder.ToTable("APPLICATIONS", t =>
            {
                t.HasCheckConstraint("CK_Applications_CourseXorProgram", xor);
                t.HasCheckConstraint("CK_Applications_Status", "[Status] IN ('Submitted','Under_Review','Approved','Rejected')");
            });

            builder.HasKey(x => x.ApplicationId);
            builder.Property(x => x.Status)
                   .HasConversion<string>()
                   .HasMaxLength(50);

            builder.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId);
            builder.HasOne(x => x.Course).WithMany().HasForeignKey(x => x.CourseId);
            builder.HasOne(x => x.Program).WithMany().HasForeignKey(x => x.ProgramId);
            builder.HasOne(x => x.Schedule).WithMany().HasForeignKey(x => x.ScheduleId);
        }
    }
}