using AndalusiaApp.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AndalusiaApp.Data.Configurations
{
    public class SessionConfiguration : IEntityTypeConfiguration<Session>
    {
        public void Configure(EntityTypeBuilder<Session> builder)
        {
            builder.ToTable("SESSIONS");
            builder.HasKey(x => x.SessionId);
            builder.Property(x => x.Title).HasMaxLength(200);
            builder.Property(x => x.RoomDetails).HasMaxLength(100);

            builder.HasOne(x => x.Schedule).WithMany(s => s.Sessions).HasForeignKey(x => x.ScheduleId);
        }
    }
}