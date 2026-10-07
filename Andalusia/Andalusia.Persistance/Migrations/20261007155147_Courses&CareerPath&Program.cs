using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Andalusia.Persistance.Migrations
{
    /// <inheritdoc />
    public partial class CoursesCareerPathProgram : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_Courses_Status",
                table: "COURSES");

            migrationBuilder.DropColumn(
                name: "FullDescription",
                table: "COURSES");

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "COURSES");

            migrationBuilder.DropColumn(
                name: "Objectives",
                table: "COURSES");

            migrationBuilder.DropColumn(
                name: "Price",
                table: "COURSES");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "COURSES");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "COURSES");

            migrationBuilder.RenameColumn(
                name: "ShortDescription",
                table: "COURSES",
                newName: "TuitionNote");

            migrationBuilder.RenameColumn(
                name: "Duration",
                table: "COURSES",
                newName: "Level");

            migrationBuilder.AddColumn<string>(
                name: "Slug",
                table: "PROGRAMS",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "COURSES",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<long>(
                name: "CategoryId",
                table: "COURSES",
                type: "bigint",
                nullable: true,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.AddColumn<string>(
                name: "Accreditation",
                table: "COURSES",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<long>(
                name: "CareerPathId",
                table: "COURSES",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "COURSES",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "DeliveryMode",
                table: "COURSES",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "COURSES",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "DurationLabel",
                table: "COURSES",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Hall",
                table: "COURSES",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsFeatured",
                table: "COURSES",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<long>(
                name: "MentorId",
                table: "COURSES",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "ProgramId",
                table: "COURSES",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Slug",
                table: "COURSES",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SyllabusPath",
                table: "COURSES",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Tuition",
                table: "COURSES",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "Slug",
                table: "CAREER_PATHS",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "CourseApplications",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CourseId = table.Column<long>(type: "bigint", nullable: false),
                    UserId = table.Column<long>(type: "bigint", nullable: true),
                    FullName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseApplications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CourseApplications_COURSES_CourseId",
                        column: x => x.CourseId,
                        principalTable: "COURSES",
                        principalColumn: "CourseId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CourseApplications_USERS_UserId",
                        column: x => x.UserId,
                        principalTable: "USERS",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CourseBullets",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CourseId = table.Column<long>(type: "bigint", nullable: false),
                    Text = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseBullets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CourseBullets_COURSES_CourseId",
                        column: x => x.CourseId,
                        principalTable: "COURSES",
                        principalColumn: "CourseId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CourseCohorts",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CourseId = table.Column<long>(type: "bigint", nullable: false),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Capacity = table.Column<int>(type: "int", nullable: false),
                    EnrolledCount = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseCohorts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CourseCohorts_COURSES_CourseId",
                        column: x => x.CourseId,
                        principalTable: "COURSES",
                        principalColumn: "CourseId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LearningOutcomes",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CourseId = table.Column<long>(type: "bigint", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Text = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LearningOutcomes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LearningOutcomes_COURSES_CourseId",
                        column: x => x.CourseId,
                        principalTable: "COURSES",
                        principalColumn: "CourseId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Mentors",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Bio = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Mentors", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_COURSES_CareerPathId",
                table: "COURSES",
                column: "CareerPathId");

            migrationBuilder.CreateIndex(
                name: "IX_COURSES_MentorId",
                table: "COURSES",
                column: "MentorId");

            migrationBuilder.CreateIndex(
                name: "IX_COURSES_ProgramId",
                table: "COURSES",
                column: "ProgramId");

            migrationBuilder.CreateIndex(
                name: "IX_COURSES_Slug",
                table: "COURSES",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CourseApplications_CourseId",
                table: "CourseApplications",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_CourseApplications_UserId",
                table: "CourseApplications",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_CourseBullets_CourseId",
                table: "CourseBullets",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_CourseCohorts_CourseId",
                table: "CourseCohorts",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_LearningOutcomes_CourseId",
                table: "LearningOutcomes",
                column: "CourseId");

            migrationBuilder.AddForeignKey(
                name: "FK_COURSES_CAREER_PATHS_CareerPathId",
                table: "COURSES",
                column: "CareerPathId",
                principalTable: "CAREER_PATHS",
                principalColumn: "CareerPathId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_COURSES_Mentors_MentorId",
                table: "COURSES",
                column: "MentorId",
                principalTable: "Mentors",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_COURSES_PROGRAMS_ProgramId",
                table: "COURSES",
                column: "ProgramId",
                principalTable: "PROGRAMS",
                principalColumn: "ProgramId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_COURSES_CAREER_PATHS_CareerPathId",
                table: "COURSES");

            migrationBuilder.DropForeignKey(
                name: "FK_COURSES_Mentors_MentorId",
                table: "COURSES");

            migrationBuilder.DropForeignKey(
                name: "FK_COURSES_PROGRAMS_ProgramId",
                table: "COURSES");

            migrationBuilder.DropTable(
                name: "CourseApplications");

            migrationBuilder.DropTable(
                name: "CourseBullets");

            migrationBuilder.DropTable(
                name: "CourseCohorts");

            migrationBuilder.DropTable(
                name: "LearningOutcomes");

            migrationBuilder.DropTable(
                name: "Mentors");

            migrationBuilder.DropIndex(
                name: "IX_COURSES_CareerPathId",
                table: "COURSES");

            migrationBuilder.DropIndex(
                name: "IX_COURSES_MentorId",
                table: "COURSES");

            migrationBuilder.DropIndex(
                name: "IX_COURSES_ProgramId",
                table: "COURSES");

            migrationBuilder.DropIndex(
                name: "IX_COURSES_Slug",
                table: "COURSES");

            migrationBuilder.DropColumn(
                name: "Slug",
                table: "PROGRAMS");

            migrationBuilder.DropColumn(
                name: "Accreditation",
                table: "COURSES");

            migrationBuilder.DropColumn(
                name: "CareerPathId",
                table: "COURSES");

            migrationBuilder.DropColumn(
                name: "Category",
                table: "COURSES");

            migrationBuilder.DropColumn(
                name: "DeliveryMode",
                table: "COURSES");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "COURSES");

            migrationBuilder.DropColumn(
                name: "DurationLabel",
                table: "COURSES");

            migrationBuilder.DropColumn(
                name: "Hall",
                table: "COURSES");

            migrationBuilder.DropColumn(
                name: "IsFeatured",
                table: "COURSES");

            migrationBuilder.DropColumn(
                name: "MentorId",
                table: "COURSES");

            migrationBuilder.DropColumn(
                name: "ProgramId",
                table: "COURSES");

            migrationBuilder.DropColumn(
                name: "Slug",
                table: "COURSES");

            migrationBuilder.DropColumn(
                name: "SyllabusPath",
                table: "COURSES");

            migrationBuilder.DropColumn(
                name: "Tuition",
                table: "COURSES");

            migrationBuilder.DropColumn(
                name: "Slug",
                table: "CAREER_PATHS");

            migrationBuilder.RenameColumn(
                name: "TuitionNote",
                table: "COURSES",
                newName: "ShortDescription");

            migrationBuilder.RenameColumn(
                name: "Level",
                table: "COURSES",
                newName: "Duration");

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "COURSES",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(250)",
                oldMaxLength: 250);

            migrationBuilder.AlterColumn<long>(
                name: "CategoryId",
                table: "COURSES",
                type: "bigint",
                nullable: false,
                defaultValue: 0L,
                oldClrType: typeof(long),
                oldType: "bigint",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FullDescription",
                table: "COURSES",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "COURSES",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Objectives",
                table: "COURSES",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "Price",
                table: "COURSES",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "COURSES",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "COURSES",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Courses_Status",
                table: "COURSES",
                sql: "[Status] IN ('Draft','Upcoming','Active','Closed')");
        }
    }
}
