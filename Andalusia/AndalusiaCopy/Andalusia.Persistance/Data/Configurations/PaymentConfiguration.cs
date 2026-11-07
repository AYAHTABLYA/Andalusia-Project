using AndalusiaApp.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AndalusiaApp.Data.Configurations
{
    public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
    {
        public void Configure(EntityTypeBuilder<Payment> builder)
        {
            builder.ToTable("PAYMENTS", t =>
            {
                t.HasCheckConstraint("CK_Payments_Target", "[ApplicationId] IS NOT NULL OR [EnrollmentId] IS NOT NULL");
                t.HasCheckConstraint("CK_Payments_Status", "[Status] IN ('Initiated','Success','Failed','Refunded')");
            });

            builder.HasKey(x => x.PaymentId);
            builder.Property(x => x.Amount).HasColumnType("decimal(18,2)");
            builder.Property(x => x.Currency).HasMaxLength(10);
            builder.Property(x => x.GatewayName).HasMaxLength(50);
            builder.Property(x => x.TransactionRef).HasMaxLength(100);
            builder.Property(x => x.Status)
                   .HasConversion<string>()
                   .HasMaxLength(50);
            builder.HasIndex(x => x.TransactionRef).IsUnique();

            builder.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId);
            builder.HasOne(x => x.Application).WithMany().HasForeignKey(x => x.ApplicationId);
            builder.HasOne(x => x.Enrollment).WithMany().HasForeignKey(x => x.EnrollmentId);
        }
    }
}