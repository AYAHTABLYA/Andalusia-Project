using AndalusiaApp.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AndalusiaApp.Data.Configurations
{
    public class ContactEnquiryConfiguration : IEntityTypeConfiguration<ContactEnquiry>
    {
        public void Configure(EntityTypeBuilder<ContactEnquiry> builder)
        {
            builder.ToTable("CONTACT_ENQUIRIES", t =>
            {
                t.HasCheckConstraint("CK_ContactEnquiries_Subject", "[SubjectType] IN ('General','Course','Program','Corporate')");
                t.HasCheckConstraint("CK_ContactEnquiries_Status", "[Status] IN ('New','In_Progress','Resolved','Closed')");
            });
            builder.HasKey(x => x.EnquiryId);
            builder.Property(x => x.FullName).HasMaxLength(150);
            builder.Property(x => x.Email).HasMaxLength(255);
            builder.Property(x => x.MobileNumber).HasMaxLength(20);
            builder.Property(x => x.SubjectType).HasConversion<string>().HasMaxLength(50);
            builder.Property(x => x.Status).HasConversion<string>().HasMaxLength(50);
            builder.HasOne(x => x.User).WithMany(u => u.SubmittedEnquiries).HasForeignKey(x => x.UserId);
            builder.HasOne(x => x.HandledByUser).WithMany(u => u.HandledEnquiries).HasForeignKey(x => x.HandledBy);
        }
    }
}