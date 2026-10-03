using AndalusiaApp.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AndalusiaApp.Data.Configurations
{
    public class CourseConfiguration : IEntityTypeConfiguration<Course>
    {
        public void Configure(EntityTypeBuilder<Course> builder)
        {
            builder.ToTable("COURSES", t =>
                t.HasCheckConstraint("CK_Courses_Status", "[Status] IN ('Draft','Upcoming','Active','Closed')"));

            builder.HasKey(x => x.CourseId);
            builder.Property(x => x.Title).HasMaxLength(200);
            builder.Property(x => x.ShortDescription).HasMaxLength(500);
            builder.Property(x => x.Duration).HasMaxLength(100);
            builder.Property(x => x.Price).HasColumnType("decimal(18,2)");
            builder.Property(x => x.Type).HasMaxLength(50);
            builder.Property(x => x.Status)
                   .HasConversion<string>()
                   .HasMaxLength(50);
            builder.Property(x => x.ImageUrl).HasMaxLength(500);

            builder.HasOne(x => x.Category).WithMany(c => c.Courses).HasForeignKey(x => x.CategoryId);
        }
    }
}