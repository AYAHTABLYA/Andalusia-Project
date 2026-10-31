using AndalusiaApp.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AndalusiaApp.Data.Configurations
{
    public class ScheduleInstructorConfiguration : IEntityTypeConfiguration<ScheduleInstructor>
    {
        public void Configure(EntityTypeBuilder<ScheduleInstructor> builder)
        {
            builder.ToTable("SCHEDULE_INSTRUCTORS");
            builder.HasKey(x => new { x.ScheduleId, x.InstructorId });

            builder.HasOne(x => x.Schedule).WithMany(s => s.ScheduleInstructors).HasForeignKey(x => x.ScheduleId).OnDelete(DeleteBehavior.Cascade);
            builder.HasOne(x => x.Instructor).WithMany(i => i.ScheduleInstructors).HasForeignKey(x => x.InstructorId);
        }
    }
}