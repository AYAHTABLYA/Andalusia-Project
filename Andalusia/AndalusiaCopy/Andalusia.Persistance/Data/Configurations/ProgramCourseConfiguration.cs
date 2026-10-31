using AndalusiaApp.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AndalusiaApp.Data.Configurations
{
    public class ProgramCourseConfiguration : IEntityTypeConfiguration<ProgramCourse>
    {
        public void Configure(EntityTypeBuilder<ProgramCourse> builder)
        {
            builder.ToTable("PROGRAM_COURSES");
            builder.HasKey(x => new { x.ProgramId, x.CourseId });

            builder.HasOne(x => x.Program).WithMany(p => p.ProgramCourses).HasForeignKey(x => x.ProgramId).OnDelete(DeleteBehavior.Cascade);
            builder.HasOne(x => x.Course).WithMany(c => c.ProgramCourses).HasForeignKey(x => x.CourseId);
        }
    }
}