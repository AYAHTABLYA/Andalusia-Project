using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Andalusia.Persistance.Migrations
{
    /// <inheritdoc />
    public partial class updatedatabase2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Feedback",
                table: "ASSIGNMENT_SUBMISSIONS",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "GradedAt",
                table: "ASSIGNMENT_SUBMISSIONS",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Score",
                table: "ASSIGNMENT_SUBMISSIONS",
                type: "decimal(5,2)",
                precision: 5,
                scale: 2,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Feedback",
                table: "ASSIGNMENT_SUBMISSIONS");

            migrationBuilder.DropColumn(
                name: "GradedAt",
                table: "ASSIGNMENT_SUBMISSIONS");

            migrationBuilder.DropColumn(
                name: "Score",
                table: "ASSIGNMENT_SUBMISSIONS");
        }
    }
}
