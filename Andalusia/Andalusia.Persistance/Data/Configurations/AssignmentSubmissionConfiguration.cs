using AndalusiaApp.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AndalusiaApp.Data.Configurations
{
    public class AssignmentSubmissionConfiguration : IEntityTypeConfiguration<AssignmentSubmission>
    {
        public void Configure(EntityTypeBuilder<AssignmentSubmission> builder)
        {
            builder.ToTable("ASSIGNMENT_SUBMISSIONS", t =>
                t.HasCheckConstraint("CK_AssignmentSubmissions_Status", "[Status] IN ('Submitted','Late')"));

            builder.HasKey(x => x.SubmissionId);
            builder.Property(x => x.AttemptNumber).HasDefaultValue(1);
            builder.Property(x => x.FileUrl).HasMaxLength(500);
            builder.Property(x => x.Status)
                   .HasConversion<string>()
                   .HasMaxLength(50);

            builder.HasIndex(x => new { x.AssignmentId, x.LearnerId, x.AttemptNumber }).IsUnique();

            builder.HasOne(x => x.Assignment).WithMany().HasForeignKey(x => x.AssignmentId);
            builder.HasOne(x => x.Learner).WithMany().HasForeignKey(x => x.LearnerId);
        }
    }
}