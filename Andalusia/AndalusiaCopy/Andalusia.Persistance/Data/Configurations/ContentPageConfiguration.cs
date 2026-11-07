using AndalusiaApp.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AndalusiaApp.Data.Configurations
{
    public class ContentPageConfiguration : IEntityTypeConfiguration<ContentPage>
    {
        public void Configure(EntityTypeBuilder<ContentPage> builder)
        {
            builder.ToTable("CONTENT_PAGES");
            builder.HasKey(x => x.PageId);
            builder.Property(x => x.PageKey).HasMaxLength(50);
            builder.Property(x => x.SectionKey).HasMaxLength(50);
            builder.HasIndex(x => new { x.PageKey, x.SectionKey }).IsUnique();

            builder.HasOne(x => x.UpdatedByUser).WithMany().HasForeignKey(x => x.UpdatedBy);
        }
    }
}