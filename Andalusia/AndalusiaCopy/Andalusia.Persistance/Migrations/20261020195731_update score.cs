using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Andalusia.Persistance.Migrations
{
    /// <inheritdoc />
    public partial class updatescore : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "Score",
                table: "ASSIGNMENT_SUBMISSIONS",
                type: "int",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(5,2)",
                oldPrecision: 5,
                oldScale: 2,
                oldNullable: true);

            migrationBuilder.AddColumn<long>(
                name: "GradedBy",
                table: "ASSIGNMENT_SUBMISSIONS",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ASSIGNMENT_SUBMISSIONS_GradedBy",
                table: "ASSIGNMENT_SUBMISSIONS",
                column: "GradedBy");

            migrationBuilder.AddForeignKey(
                name: "FK_ASSIGNMENT_SUBMISSIONS_USERS_GradedBy",
                table: "ASSIGNMENT_SUBMISSIONS",
                column: "GradedBy",
                principalTable: "USERS",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ASSIGNMENT_SUBMISSIONS_USERS_GradedBy",
                table: "ASSIGNMENT_SUBMISSIONS");

            migrationBuilder.DropIndex(
                name: "IX_ASSIGNMENT_SUBMISSIONS_GradedBy",
                table: "ASSIGNMENT_SUBMISSIONS");

            migrationBuilder.DropColumn(
                name: "GradedBy",
                table: "ASSIGNMENT_SUBMISSIONS");

            migrationBuilder.AlterColumn<decimal>(
                name: "Score",
                table: "ASSIGNMENT_SUBMISSIONS",
                type: "decimal(5,2)",
                precision: 5,
                scale: 2,
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);
        }
    }
}
