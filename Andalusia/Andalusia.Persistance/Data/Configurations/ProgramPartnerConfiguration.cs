using AndalusiaApp.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AndalusiaApp.Data.Configurations
{
    public class ProgramPartnerConfiguration : IEntityTypeConfiguration<ProgramPartner>
    {
        public void Configure(EntityTypeBuilder<ProgramPartner> builder)
        {
            builder.ToTable("PROGRAM_PARTNERS");
            builder.HasKey(x => new { x.ProgramId, x.PartnerId });
            builder.Property(x => x.AccreditationDetails).HasMaxLength(500);
            builder.HasOne(x => x.Program).WithMany(p => p.ProgramPartners).HasForeignKey(x => x.ProgramId).OnDelete(DeleteBehavior.Cascade);
            builder.HasOne(x => x.Partner).WithMany(p => p.ProgramPartners).HasForeignKey(x => x.PartnerId);
        }
    }
}