using AndalusiaApp.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AndalusiaApp.Data.Configurations
{
    public class InstructorConfiguration : IEntityTypeConfiguration<Instructor>
    {
        public void Configure(EntityTypeBuilder<Instructor> builder)
        {
            builder.ToTable("INSTRUCTORS");
            builder.HasKey(x => x.InstructorId);
            builder.Property(x => x.InstructorId).ValueGeneratedNever();
            builder.Property(x => x.JobTitle).HasMaxLength(100);
            builder.Property(x => x.AvatarUrl).HasMaxLength(500);

            builder.HasOne(x => x.User).WithOne(u => u.Instructor).HasForeignKey<Instructor>(x => x.InstructorId);
        }
    }
}