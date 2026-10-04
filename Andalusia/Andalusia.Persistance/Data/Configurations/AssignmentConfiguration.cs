using AndalusiaApp.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AndalusiaApp.Data.Configurations
{
    public class AssignmentConfiguration : IEntityTypeConfiguration<Assignment>
    {
        public void Configure(EntityTypeBuilder<Assignment> builder)
        {
            builder.ToTable("ASSIGNMENTS");
            builder.HasKey(x => x.AssignmentId);
            builder.Property(x => x.Title).HasMaxLength(200);

            builder.HasOne(x => x.Schedule).WithMany().HasForeignKey(x => x.ScheduleId);
        }
    }
}