using AndalusiaApp.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AndalusiaApp.Data.Configurations
{
    public class ProgressConfiguration : IEntityTypeConfiguration<Progress>
    {
        public void Configure(EntityTypeBuilder<Progress> builder)
        {
            builder.ToTable("PROGRESS");

            builder.HasKey(x => x.ProgressId);
            builder.Property(x => x.ProgressId).ValueGeneratedOnAdd();

            builder.Property(x => x.ProgressPercentage)
                   .HasColumnType("decimal(5,2)");

            builder.HasOne(x => x.Enrollment)
                   .WithOne(en => en.Progress)
                   .HasForeignKey<Progress>(x => x.EnrollmentId)
                   .HasPrincipalKey<Enrollment>(x => x.EnrollmentId)
                   .IsRequired();

            builder.HasIndex(x => x.EnrollmentId)
                   .IsUnique();
        }
    }
}