using AndalusiaApp.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AndalusiaApp.Data.Configurations
{
    public class RoleConfiguration : IEntityTypeConfiguration<Role>
    {
        public void Configure(EntityTypeBuilder<Role> builder)
        {
            builder.ToTable("ROLES");
            builder.HasKey(x => x.RoleId);
            builder.Property(x => x.Name).HasMaxLength(50);
            builder.HasIndex(x => x.Name).IsUnique();

            builder.HasData(
                new Role { RoleId = 1, Name = "Learner" },
                new Role { RoleId = 2, Name = "Instructor" },
                new Role { RoleId = 3, Name = "Manager" },
                new Role { RoleId = 4, Name = "Admin" },
                new Role { RoleId = 5, Name = "Content_Manager" });
        }
    }
}