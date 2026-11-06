using AndalusiaApp.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AndalusiaApp.Data.Configurations
{
    public class CategoryConfiguration : IEntityTypeConfiguration<Category>
    {
        public void Configure(EntityTypeBuilder<Category> builder)
        {
            builder.ToTable("CATEGORIES");
            builder.HasKey(x => x.CategoryId);
            builder.Property(x => x.Name).HasMaxLength(100);
            builder.Property(x => x.Slug).HasMaxLength(120);
            builder.HasIndex(x => x.Slug).IsUnique();
        }
    }
}