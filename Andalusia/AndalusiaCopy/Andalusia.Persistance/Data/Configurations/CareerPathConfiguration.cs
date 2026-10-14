using AndalusiaApp.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AndalusiaApp.Data.Configurations
{
    public class CareerPathConfiguration : IEntityTypeConfiguration<CareerPath>
    {
        public void Configure(EntityTypeBuilder<CareerPath> builder)
        {
            builder.ToTable("CAREER_PATHS");
            builder.HasKey(x => x.CareerPathId);
            builder.Property(x => x.Title).HasMaxLength(200);
            builder.Property(x => x.Status).HasMaxLength(50);
        }
    }
}