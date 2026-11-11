using AndalusiaApp.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AndalusiaApp.Data.Configurations
{
    public class RelatedProgramConfiguration : IEntityTypeConfiguration<RelatedProgram>
    {
        public void Configure(EntityTypeBuilder<RelatedProgram> builder)
        {
            builder.ToTable("RELATED_PROGRAMS", t =>
                t.HasCheckConstraint("CK_RelatedPrograms_NotSelf", "[ProgramId] <> [RelatedProgramId]"));

            builder.HasKey(x => new { x.ProgramId, x.RelatedProgramId });

            builder.HasOne(x => x.Program).WithMany().HasForeignKey(x => x.ProgramId);
            builder.HasOne(x => x.Related).WithMany().HasForeignKey(x => x.RelatedProgramId);
        }
    }
}