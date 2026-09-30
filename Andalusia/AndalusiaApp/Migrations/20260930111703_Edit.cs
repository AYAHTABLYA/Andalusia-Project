using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AndalusiaApp.Migrations
{
    /// <inheritdoc />
    public partial class Edit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "course_id",
                table: "TESTIMONIALS",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "user_id",
                table: "TESTIMONIALS",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "handled_by",
                table: "CONTACT_ENQUIRIES",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "user_id",
                table: "CONTACT_ENQUIRIES",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "PROGRAM_PARTNERS",
                columns: table => new
                {
                    program_id = table.Column<long>(type: "bigint", nullable: false),
                    partner_id = table.Column<long>(type: "bigint", nullable: false),
                    accreditation_details = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_program_partners", x => new { x.program_id, x.partner_id });
                    table.ForeignKey(
                        name: "fk_program_partners_partners_partner_id",
                        column: x => x.partner_id,
                        principalTable: "PARTNERS",
                        principalColumn: "partner_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_program_partners_programs_program_id",
                        column: x => x.program_id,
                        principalTable: "PROGRAMS",
                        principalColumn: "program_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_testimonials_course_id",
                table: "TESTIMONIALS",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "ix_testimonials_user_id",
                table: "TESTIMONIALS",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_contact_enquiries_handled_by",
                table: "CONTACT_ENQUIRIES",
                column: "handled_by");

            migrationBuilder.CreateIndex(
                name: "ix_contact_enquiries_user_id",
                table: "CONTACT_ENQUIRIES",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_program_partners_partner_id",
                table: "PROGRAM_PARTNERS",
                column: "partner_id");

            migrationBuilder.AddForeignKey(
                name: "fk_contact_enquiries_users_handled_by",
                table: "CONTACT_ENQUIRIES",
                column: "handled_by",
                principalTable: "USERS",
                principalColumn: "user_id");

            migrationBuilder.AddForeignKey(
                name: "fk_contact_enquiries_users_user_id",
                table: "CONTACT_ENQUIRIES",
                column: "user_id",
                principalTable: "USERS",
                principalColumn: "user_id");

            migrationBuilder.AddForeignKey(
                name: "fk_testimonials_courses_course_id",
                table: "TESTIMONIALS",
                column: "course_id",
                principalTable: "COURSES",
                principalColumn: "course_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_testimonials_users_user_id",
                table: "TESTIMONIALS",
                column: "user_id",
                principalTable: "USERS",
                principalColumn: "user_id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_contact_enquiries_users_handled_by",
                table: "CONTACT_ENQUIRIES");

            migrationBuilder.DropForeignKey(
                name: "fk_contact_enquiries_users_user_id",
                table: "CONTACT_ENQUIRIES");

            migrationBuilder.DropForeignKey(
                name: "fk_testimonials_courses_course_id",
                table: "TESTIMONIALS");

            migrationBuilder.DropForeignKey(
                name: "fk_testimonials_users_user_id",
                table: "TESTIMONIALS");

            migrationBuilder.DropTable(
                name: "PROGRAM_PARTNERS");

            migrationBuilder.DropIndex(
                name: "ix_testimonials_course_id",
                table: "TESTIMONIALS");

            migrationBuilder.DropIndex(
                name: "ix_testimonials_user_id",
                table: "TESTIMONIALS");

            migrationBuilder.DropIndex(
                name: "ix_contact_enquiries_handled_by",
                table: "CONTACT_ENQUIRIES");

            migrationBuilder.DropIndex(
                name: "ix_contact_enquiries_user_id",
                table: "CONTACT_ENQUIRIES");

            migrationBuilder.DropColumn(
                name: "course_id",
                table: "TESTIMONIALS");

            migrationBuilder.DropColumn(
                name: "user_id",
                table: "TESTIMONIALS");

            migrationBuilder.DropColumn(
                name: "handled_by",
                table: "CONTACT_ENQUIRIES");

            migrationBuilder.DropColumn(
                name: "user_id",
                table: "CONTACT_ENQUIRIES");
        }
    }
}
