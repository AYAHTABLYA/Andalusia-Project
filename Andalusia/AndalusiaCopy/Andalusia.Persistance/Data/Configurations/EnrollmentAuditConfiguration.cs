using Andalusia.Domain.Models;
using AndalusiaApp.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AndalusiaApp.Data.Configurations;

public sealed class EnrollmentAuditConfiguration : IEntityTypeConfiguration<EnrollmentAudit>
{
    public void Configure(EntityTypeBuilder<EnrollmentAudit> builder)
    {
        builder.ToTable("ENROLLMENT_AUDITS");
        builder.HasKey(x => x.EnrollmentAuditId);
        builder.Property(x => x.Action).HasMaxLength(40).IsRequired();
        builder.Property(x => x.PreviousStatus).HasMaxLength(50).IsRequired();
        builder.Property(x => x.NewStatus).HasMaxLength(50).IsRequired();
        builder.Property(x => x.Reason).HasMaxLength(500).IsRequired();
        builder.Property(x => x.PerformedAtUtc).IsRequired();
        builder.HasIndex(x => new { x.EnrollmentId, x.PerformedAtUtc });
        builder.HasOne<Enrollment>().WithMany().HasForeignKey(x => x.EnrollmentId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<User>().WithMany().HasForeignKey(x => x.ActorUserId).OnDelete(DeleteBehavior.Restrict);
    }
}
