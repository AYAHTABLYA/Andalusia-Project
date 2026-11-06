using AndalusiaApp.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AndalusiaApp.Data.Configurations
{
    public class DirectMessageConfiguration : IEntityTypeConfiguration<DirectMessage>
    {
        public void Configure(EntityTypeBuilder<DirectMessage> builder)
        {
            builder.ToTable("DIRECT_MESSAGES");
            builder.HasKey(x => x.DirectMessageId);
            builder.Property(x => x.Body).HasMaxLength(2000).IsRequired();

            builder.HasOne(x => x.Sender).WithMany().HasForeignKey(x => x.SenderId).OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(x => x.Recipient).WithMany().HasForeignKey(x => x.RecipientId).OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(x => new { x.RecipientId, x.ReadAt }).HasDatabaseName("IX_DirectMessages_Recipient_Read");
            builder.HasIndex(x => new { x.SenderId, x.RecipientId, x.SentAt }).HasDatabaseName("IX_DirectMessages_Thread");
        }
    }
}
