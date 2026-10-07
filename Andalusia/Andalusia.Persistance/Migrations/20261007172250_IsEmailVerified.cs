using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Andalusia.Persistance.Migrations
{
    /// <inheritdoc />
    public partial class IsEmailVerified : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsEmailVerified",
                table: "USERS",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsEmailVerified",
                table: "USERS");
        }
    }
}
