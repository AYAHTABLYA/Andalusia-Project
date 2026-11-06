using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Andalusia.Persistance.Migrations
{
    /// <inheritdoc />
    public partial class AddCoordinator : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ENROLLMENT_AUDITS",
                columns: table => new
                {
                    EnrollmentAuditId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EnrollmentId = table.Column<long>(type: "bigint", nullable: false),
                    ActorUserId = table.Column<long>(type: "bigint", nullable: false),
                    Action = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    PreviousStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    NewStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    PerformedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ENROLLMENT_AUDITS", x => x.EnrollmentAuditId);
                    table.ForeignKey(
                        name: "FK_ENROLLMENT_AUDITS_ENROLLMENTS_EnrollmentId",
                        column: x => x.EnrollmentId,
                        principalTable: "ENROLLMENTS",
                        principalColumn: "EnrollmentId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ENROLLMENT_AUDITS_USERS_ActorUserId",
                        column: x => x.ActorUserId,
                        principalTable: "USERS",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ENROLLMENT_AUDITS_ActorUserId",
                table: "ENROLLMENT_AUDITS",
                column: "ActorUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ENROLLMENT_AUDITS_EnrollmentId_PerformedAtUtc",
                table: "ENROLLMENT_AUDITS",
                columns: new[] { "EnrollmentId", "PerformedAtUtc" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ENROLLMENT_AUDITS");
        }
    }
}
