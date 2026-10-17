using AndalusiaApp.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AndalusiaApp.Data.Configurations
{
    public class CourseMaterialConfiguration : IEntityTypeConfiguration<CourseMaterial>
    {
        public void Configure(EntityTypeBuilder<CourseMaterial> builder)
        {
            builder.ToTable("COURSE_MATERIALS", t =>
                t.HasCheckConstraint("CK_CourseMaterials_Type", "[ResourceType] IN ('Slide','Document','Reference_Link')"));

            builder.HasKey(x => x.MaterialId);
            builder.Property(x => x.Title).HasMaxLength(200);
            builder.Property(x => x.FileUrl).HasMaxLength(500);
            builder.Property(x => x.ResourceType)
                   .HasConversion<string>()
                   .HasMaxLength(50);

            builder.HasOne(x => x.Course).WithMany().HasForeignKey(x => x.CourseId);
            builder.HasOne(x => x.Schedule).WithMany().HasForeignKey(x => x.ScheduleId);
        }
    }
}