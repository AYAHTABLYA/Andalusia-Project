using AndalusiaApp.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AndalusiaApp.Data.Configurations
{
    public class InstructorPayoutConfiguration : IEntityTypeConfiguration<InstructorPayout>
    {
        public void Configure(EntityTypeBuilder<InstructorPayout> builder)
        {
            builder.ToTable("INSTRUCTOR_PAYOUTS", t =>
                t.HasCheckConstraint("CK_InstructorPayouts_Status", "[Status] IN ('Pending','Paid','Cancelled')"));

            builder.HasKey(x => x.PayoutId);
            builder.Property(x => x.Amount).HasColumnType("decimal(18,2)");
            builder.Property(x => x.Currency).HasMaxLength(10);
            builder.Property(x => x.Status)
                   .HasConversion<string>()
                   .HasMaxLength(50);
            builder.Property(x => x.Notes).HasMaxLength(500);

            builder.HasOne(x => x.Instructor).WithMany(i => i.Payouts).HasForeignKey(x => x.InstructorId);
            builder.HasOne(x => x.Schedule).WithMany().HasForeignKey(x => x.ScheduleId);
            builder.HasOne(x => x.ProcessedByUser).WithMany().HasForeignKey(x => x.ProcessedBy);
        }
    }
}