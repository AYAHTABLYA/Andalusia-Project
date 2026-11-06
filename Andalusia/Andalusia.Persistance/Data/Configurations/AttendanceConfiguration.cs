using AndalusiaApp.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AndalusiaApp.Data.Configurations
{
    public class AttendanceConfiguration : IEntityTypeConfiguration<Attendance>
    {
        public void Configure(EntityTypeBuilder<Attendance> builder)
        {
            builder.ToTable("ATTENDANCE", t =>
                t.HasCheckConstraint("CK_Attendance_Status", "[Status] IN ('Present','Absent','Late','Excused')"));

            builder.HasKey(x => x.AttendanceId);
            builder.Property(x => x.Status)
                   .HasConversion<string>()
                   .HasMaxLength(50);

            builder.HasIndex(x => new { x.SessionId, x.LearnerId }).IsUnique();

            builder.HasOne(x => x.Session).WithMany().HasForeignKey(x => x.SessionId);
            builder.HasOne(x => x.Learner).WithMany().HasForeignKey(x => x.LearnerId);
        }
    }
}