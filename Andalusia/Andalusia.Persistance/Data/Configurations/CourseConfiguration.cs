using AndalusiaApp.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class CourseConfiguration : IEntityTypeConfiguration<Course>
{
    public void Configure(EntityTypeBuilder<Course> builder)
    {
        builder.ToTable("COURSES");
        builder.HasKey(c => c.CourseId);

        builder.Property(c => c.Slug).HasMaxLength(150).IsRequired();
        builder.HasIndex(c => c.Slug).IsUnique();

        builder.Property(c => c.Title).HasMaxLength(250).IsRequired();
        builder.Property(c => c.Description).HasMaxLength(2000);
        builder.Property(c => c.Category).HasMaxLength(100);
        builder.Property(c => c.DeliveryMode).HasMaxLength(100);
        builder.Property(c => c.Hall).HasMaxLength(150);
        builder.Property(c => c.DurationLabel).HasMaxLength(100);
        builder.Property(c => c.Level).HasMaxLength(100);
        builder.Property(c => c.Accreditation).HasMaxLength(150);
        builder.Property(c => c.Tuition).HasPrecision(18, 2);
        builder.Property(c => c.TuitionNote).HasMaxLength(500);

        builder.HasOne(c => c.Mentor)
               .WithMany(m => m.Courses)
               .HasForeignKey(c => c.MentorId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.Program)
               .WithMany()
               .HasForeignKey(c => c.ProgramId)
               .IsRequired(false)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.CareerPath)
               .WithMany()
               .HasForeignKey(c => c.CareerPathId)
               .IsRequired(false)
               .OnDelete(DeleteBehavior.Restrict);
    }
}