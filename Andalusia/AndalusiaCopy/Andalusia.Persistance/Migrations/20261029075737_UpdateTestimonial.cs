using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Andalusia.Persistance.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTestimonial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Rating",
                table: "TESTIMONIALS",
                type: "int",
                nullable: false,
                defaultValue: 5);

            migrationBuilder.AddCheckConstraint(
                name: "CK_TESTIMONIALS_Rating",
                table: "TESTIMONIALS",
                sql: "[Rating] BETWEEN 1 AND 5");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_TESTIMONIALS_Rating",
                table: "TESTIMONIALS");

            migrationBuilder.DropColumn(
                name: "Rating",
                table: "TESTIMONIALS");
        }
    }
}
