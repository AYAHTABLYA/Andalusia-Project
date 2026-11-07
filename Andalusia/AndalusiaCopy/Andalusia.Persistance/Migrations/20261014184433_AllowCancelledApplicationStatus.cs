using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Andalusia.Persistance.Migrations
{
    /// <inheritdoc />
    public partial class AllowCancelledApplicationStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_Applications_Status",
                table: "APPLICATIONS");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Applications_Status",
                table: "APPLICATIONS",
                sql: "[Status] IN ('Submitted','Under_Review','Approved','Rejected','Cancelled')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_Applications_Status",
                table: "APPLICATIONS");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Applications_Status",
                table: "APPLICATIONS",
                sql: "[Status] IN ('Submitted','Under_Review','Approved','Rejected')");
        }
    }
}
