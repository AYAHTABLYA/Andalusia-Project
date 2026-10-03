using AndalusiaApp.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AndalusiaApp.Data.Configurations
{
    public class PartnerConfiguration : IEntityTypeConfiguration<Partner>
    {
        public void Configure(EntityTypeBuilder<Partner> builder)
        {
            builder.ToTable("PARTNERS", t =>
                t.HasCheckConstraint("CK_Partners_Type", "[Type] IN ('Accreditation','Success_Partner')"));

            builder.HasKey(x => x.PartnerId);
            builder.Property(x => x.Name).HasMaxLength(150);
            builder.Property(x => x.LogoUrl).HasMaxLength(500);
            builder.Property(x => x.Type)
                   .HasConversion<string>()
                   .HasMaxLength(50);
        }
    }
}