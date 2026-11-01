using AndalusiaApp.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AndalusiaApp.Data.Configurations
{
    public class TestimonialConfiguration : IEntityTypeConfiguration<Testimonial>
    {
        public void Configure(EntityTypeBuilder<Testimonial> builder)
        {
            builder.ToTable("TESTIMONIALS", t => t.HasCheckConstraint("CK_TESTIMONIALS_Rating", "[Rating] BETWEEN 1 AND 5"));
            builder.HasKey(x => x.TestimonialId);
            builder.Property(x => x.ClientName).HasMaxLength(150);
            builder.Property(x => x.TitleOrRole).HasMaxLength(150);
            builder.Property(x => x.AvatarUrl).HasMaxLength(500);
            builder.Property(x => x.Rating).HasDefaultValue(5);
            builder.HasOne(x => x.User).WithMany(u => u.Testimonials).HasForeignKey(x => x.UserId).IsRequired(false);
            builder.HasOne(x => x.Course).WithMany(c => c.Testimonials).HasForeignKey(x => x.CourseId).IsRequired(false);
        }
    }
}