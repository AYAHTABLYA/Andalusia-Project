using AndalusiaApp.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AndalusiaApp.Data.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.ToTable("USERS");
            builder.HasKey(x => x.UserId);
            builder.Property(x => x.FirstName).HasMaxLength(50);
            builder.Property(x => x.LastName).HasMaxLength(50);
            builder.Property(x => x.Email).HasMaxLength(255);
            builder.Property(x => x.MobileNumber).HasMaxLength(20);
            builder.Property(x => x.Country).HasMaxLength(50);
            builder.Property(x => x.PreferredLanguage).HasMaxLength(10);
            builder.HasIndex(x => x.Email).IsUnique();
        }
    }
}