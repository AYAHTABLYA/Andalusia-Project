using AndalusiaApp.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AndalusiaApp.Data.Configurations
{
    public class ProgramConfiguration : IEntityTypeConfiguration<Program>
    {
        public void Configure(EntityTypeBuilder<Program> builder)
        {
            builder.ToTable("PROGRAMS", t =>
                t.HasCheckConstraint("CK_Programs_Status", "[status] IN ('Draft','Active','Archived')"));

            builder.HasKey(x => x.ProgramId);
            builder.Property(x => x.Title).HasMaxLength(200);
            builder.Property(x => x.Duration).HasMaxLength(100);
            builder.Property(x => x.Price).HasColumnType("decimal(18,2)");
            builder.Property(x => x.Status)
                   .HasConversion<string>()
                   .HasMaxLength(50);

            builder.HasOne(x => x.Category).WithMany(c => c.Programs).HasForeignKey(x => x.CategoryId);
            builder.HasOne(x => x.CareerPath).WithMany(c => c.Programs).HasForeignKey(x => x.CareerPathId);
        }
    }
}