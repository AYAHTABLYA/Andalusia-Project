using AndalusiaApp.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AndalusiaApp.Data.Configurations
{
    public class ScheduleConfiguration : IEntityTypeConfiguration<Schedule>
    {
        public void Configure(EntityTypeBuilder<Schedule> builder)
        {
            builder.ToTable("SCHEDULES", t =>
            {
                t.HasCheckConstraint("CK_Schedules_CourseXorProgram",
                    "([CourseId] IS NOT NULL AND [ProgramId] IS NULL) OR ([CourseId] IS NULL AND [ProgramId] IS NOT NULL)");
                t.HasCheckConstraint("CK_Schedules_Status", "[Status] IN ('Scheduled','Running','Completed','Cancelled')");
            });

            builder.HasKey(x => x.ScheduleId);
            builder.Property(x => x.BatchCode).HasMaxLength(50);
            builder.Property(x => x.VenueName).HasMaxLength(150);
            builder.Property(x => x.RoomNumber).HasMaxLength(50);
            builder.Property(x => x.Status)
                   .HasConversion<string>()
                   .HasMaxLength(50);

            builder.HasOne(x => x.Course).WithMany().HasForeignKey(x => x.CourseId);
            builder.HasOne(x => x.Program).WithMany().HasForeignKey(x => x.ProgramId);
        }
    }
}