using AndalusiaApp.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AndalusiaApp.Data.Configurations
{
    public class FaqConfiguration : IEntityTypeConfiguration<Faq>
    {
        public void Configure(EntityTypeBuilder<Faq> builder)
        {
            builder.ToTable("FAQS");
            builder.HasKey(x => x.FaqId);
            builder.Property(x => x.Question).HasMaxLength(500);

            builder.HasOne(x => x.Category).WithMany(c => c.Faqs).HasForeignKey(x => x.CategoryId);
            builder.HasIndex(x => new { x.CategoryId, x.OrderIndex }).IsUnique()
                   .HasDatabaseName("UX_Faq_Category_Order").HasFilter("[CategoryId] IS NOT NULL");
            builder.HasIndex(x => x.OrderIndex).IsUnique()
                   .HasDatabaseName("UX_Faq_General_Order").HasFilter("[CategoryId] IS NULL");
        }
    }
}