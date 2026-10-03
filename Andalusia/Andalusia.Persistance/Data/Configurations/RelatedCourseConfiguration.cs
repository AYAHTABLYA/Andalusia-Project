using AndalusiaApp.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AndalusiaApp.Data.Configurations
{
    public class RelatedCourseConfiguration : IEntityTypeConfiguration<RelatedCourse>
    {
        public void Configure(EntityTypeBuilder<RelatedCourse> builder)
        {
            builder.ToTable("RELATED_COURSES", t =>
                t.HasCheckConstraint("CK_RelatedCourses_NotSelf", "[CourseId] <> [RelatedCourseId]"));

            builder.HasKey(x => new { x.CourseId, x.RelatedCourseId });

            builder.HasOne(x => x.Course).WithMany().HasForeignKey(x => x.CourseId);
            builder.HasOne(x => x.Related).WithMany().HasForeignKey(x => x.RelatedCourseId);
        }
    }
}