using AndalusiaApp.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AndalusiaApp.Data.Configurations
{
    public class PermissionConfiguration : IEntityTypeConfiguration<Permission>
    {
        public void Configure(EntityTypeBuilder<Permission> builder)
        {
            builder.ToTable("PERMISSIONS");
            builder.HasKey(x => x.PermissionId);
            builder.Property(x => x.Code).HasMaxLength(100);
            builder.Property(x => x.Description).HasMaxLength(255);
            builder.HasIndex(x => x.Code).IsUnique();
        }
    }
}