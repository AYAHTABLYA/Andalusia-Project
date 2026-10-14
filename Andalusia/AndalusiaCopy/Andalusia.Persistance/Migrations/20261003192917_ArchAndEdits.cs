using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Andalusia.Persistance.Migrations
{
    /// <inheritdoc />
    public partial class ArchAndEdits : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CAREER_PATHS",
                columns: table => new
                {
                    CareerPathId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Overview = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RecommendedSkills = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LearningJourney = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CAREER_PATHS", x => x.CareerPathId);
                });

            migrationBuilder.CreateTable(
                name: "CATEGORIES",
                columns: table => new
                {
                    CategoryId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Slug = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    IsTrending = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CATEGORIES", x => x.CategoryId);
                });

            migrationBuilder.CreateTable(
                name: "PARTNERS",
                columns: table => new
                {
                    PartnerId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    LogoUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PARTNERS", x => x.PartnerId);
                    table.CheckConstraint("CK_Partners_Type", "[Type] IN ('Accreditation','Success_Partner')");
                });

            migrationBuilder.CreateTable(
                name: "PERMISSIONS",
                columns: table => new
                {
                    PermissionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PERMISSIONS", x => x.PermissionId);
                });

            migrationBuilder.CreateTable(
                name: "ROLES",
                columns: table => new
                {
                    RoleId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ROLES", x => x.RoleId);
                });

            migrationBuilder.CreateTable(
                name: "USERS",
                columns: table => new
                {
                    UserId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FirstName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    MobileNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Country = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PreferredLanguage = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TermsAcceptedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_USERS", x => x.UserId);
                });

            migrationBuilder.CreateTable(
                name: "COURSES",
                columns: table => new
                {
                    CourseId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CategoryId = table.Column<long>(type: "bigint", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ShortDescription = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    FullDescription = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Objectives = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Duration = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_COURSES", x => x.CourseId);
                    table.CheckConstraint("CK_Courses_Status", "[Status] IN ('Draft','Upcoming','Active','Closed')");
                    table.ForeignKey(
                        name: "FK_COURSES_CATEGORIES_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "CATEGORIES",
                        principalColumn: "CategoryId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "FAQS",
                columns: table => new
                {
                    FaqId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CategoryId = table.Column<long>(type: "bigint", nullable: true),
                    Question = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Answer = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OrderIndex = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FAQS", x => x.FaqId);
                    table.ForeignKey(
                        name: "FK_FAQS_CATEGORIES_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "CATEGORIES",
                        principalColumn: "CategoryId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PROGRAMS",
                columns: table => new
                {
                    ProgramId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CategoryId = table.Column<long>(type: "bigint", nullable: false),
                    CareerPathId = table.Column<long>(type: "bigint", nullable: true),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Overview = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Requirements = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Structure = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Duration = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PROGRAMS", x => x.ProgramId);
                    table.CheckConstraint("CK_Programs_Status", "[status] IN ('Draft','Active','Archived')");
                    table.ForeignKey(
                        name: "FK_PROGRAMS_CAREER_PATHS_CareerPathId",
                        column: x => x.CareerPathId,
                        principalTable: "CAREER_PATHS",
                        principalColumn: "CareerPathId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PROGRAMS_CATEGORIES_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "CATEGORIES",
                        principalColumn: "CategoryId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ROLE_PERMISSIONS",
                columns: table => new
                {
                    RoleId = table.Column<int>(type: "int", nullable: false),
                    PermissionId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ROLE_PERMISSIONS", x => new { x.RoleId, x.PermissionId });
                    table.ForeignKey(
                        name: "FK_ROLE_PERMISSIONS_PERMISSIONS_PermissionId",
                        column: x => x.PermissionId,
                        principalTable: "PERMISSIONS",
                        principalColumn: "PermissionId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ROLE_PERMISSIONS_ROLES_RoleId",
                        column: x => x.RoleId,
                        principalTable: "ROLES",
                        principalColumn: "RoleId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CONTACT_ENQUIRIES",
                columns: table => new
                {
                    EnquiryId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<long>(type: "bigint", nullable: true),
                    HandledBy = table.Column<long>(type: "bigint", nullable: true),
                    FullName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    MobileNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    SubjectType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CONTACT_ENQUIRIES", x => x.EnquiryId);
                    table.CheckConstraint("CK_ContactEnquiries_Status", "[Status] IN ('New','In_Progress','Resolved','Closed')");
                    table.CheckConstraint("CK_ContactEnquiries_Subject", "[SubjectType] IN ('General','Course','Program','Corporate')");
                    table.ForeignKey(
                        name: "FK_CONTACT_ENQUIRIES_USERS_HandledBy",
                        column: x => x.HandledBy,
                        principalTable: "USERS",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CONTACT_ENQUIRIES_USERS_UserId",
                        column: x => x.UserId,
                        principalTable: "USERS",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CONTENT_PAGES",
                columns: table => new
                {
                    PageId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PageKey = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    SectionKey = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ContentPayload = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedBy = table.Column<long>(type: "bigint", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CONTENT_PAGES", x => x.PageId);
                    table.ForeignKey(
                        name: "FK_CONTENT_PAGES_USERS_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "USERS",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EMAIL_VERIFICATION_TOKENS",
                columns: table => new
                {
                    VerificationId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<long>(type: "bigint", nullable: false),
                    Token = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    VerifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EMAIL_VERIFICATION_TOKENS", x => x.VerificationId);
                    table.ForeignKey(
                        name: "FK_EMAIL_VERIFICATION_TOKENS_USERS_UserId",
                        column: x => x.UserId,
                        principalTable: "USERS",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "INSTRUCTORS",
                columns: table => new
                {
                    InstructorId = table.Column<long>(type: "bigint", nullable: false),
                    Bio = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    JobTitle = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    AvatarUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_INSTRUCTORS", x => x.InstructorId);
                    table.ForeignKey(
                        name: "FK_INSTRUCTORS_USERS_InstructorId",
                        column: x => x.InstructorId,
                        principalTable: "USERS",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "NOTIFICATIONS",
                columns: table => new
                {
                    NotificationId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<long>(type: "bigint", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NOTIFICATIONS", x => x.NotificationId);
                    table.ForeignKey(
                        name: "FK_NOTIFICATIONS_USERS_UserId",
                        column: x => x.UserId,
                        principalTable: "USERS",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PASSWORD_RESET_TOKENS",
                columns: table => new
                {
                    ResetId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<long>(type: "bigint", nullable: false),
                    Token = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UsedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PASSWORD_RESET_TOKENS", x => x.ResetId);
                    table.ForeignKey(
                        name: "FK_PASSWORD_RESET_TOKENS_USERS_UserId",
                        column: x => x.UserId,
                        principalTable: "USERS",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "USER_ROLES",
                columns: table => new
                {
                    UserId = table.Column<long>(type: "bigint", nullable: false),
                    RoleId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_USER_ROLES", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_USER_ROLES_ROLES_RoleId",
                        column: x => x.RoleId,
                        principalTable: "ROLES",
                        principalColumn: "RoleId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_USER_ROLES_USERS_UserId",
                        column: x => x.UserId,
                        principalTable: "USERS",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RELATED_COURSES",
                columns: table => new
                {
                    CourseId = table.Column<long>(type: "bigint", nullable: false),
                    RelatedCourseId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RELATED_COURSES", x => new { x.CourseId, x.RelatedCourseId });
                    table.CheckConstraint("CK_RelatedCourses_NotSelf", "[CourseId] <> [RelatedCourseId]");
                    table.ForeignKey(
                        name: "FK_RELATED_COURSES_COURSES_CourseId",
                        column: x => x.CourseId,
                        principalTable: "COURSES",
                        principalColumn: "CourseId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RELATED_COURSES_COURSES_RelatedCourseId",
                        column: x => x.RelatedCourseId,
                        principalTable: "COURSES",
                        principalColumn: "CourseId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TESTIMONIALS",
                columns: table => new
                {
                    TestimonialId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<long>(type: "bigint", nullable: true),
                    CourseId = table.Column<long>(type: "bigint", nullable: true),
                    ClientName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    TitleOrRole = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    QuoteText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AvatarUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    IsFeatured = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TESTIMONIALS", x => x.TestimonialId);
                    table.ForeignKey(
                        name: "FK_TESTIMONIALS_COURSES_CourseId",
                        column: x => x.CourseId,
                        principalTable: "COURSES",
                        principalColumn: "CourseId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TESTIMONIALS_USERS_UserId",
                        column: x => x.UserId,
                        principalTable: "USERS",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PROGRAM_COURSES",
                columns: table => new
                {
                    ProgramId = table.Column<long>(type: "bigint", nullable: false),
                    CourseId = table.Column<long>(type: "bigint", nullable: false),
                    OrderIndex = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PROGRAM_COURSES", x => new { x.ProgramId, x.CourseId });
                    table.ForeignKey(
                        name: "FK_PROGRAM_COURSES_COURSES_CourseId",
                        column: x => x.CourseId,
                        principalTable: "COURSES",
                        principalColumn: "CourseId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PROGRAM_COURSES_PROGRAMS_ProgramId",
                        column: x => x.ProgramId,
                        principalTable: "PROGRAMS",
                        principalColumn: "ProgramId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PROGRAM_PARTNERS",
                columns: table => new
                {
                    ProgramId = table.Column<long>(type: "bigint", nullable: false),
                    PartnerId = table.Column<long>(type: "bigint", nullable: false),
                    AccreditationDetails = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PROGRAM_PARTNERS", x => new { x.ProgramId, x.PartnerId });
                    table.ForeignKey(
                        name: "FK_PROGRAM_PARTNERS_PARTNERS_PartnerId",
                        column: x => x.PartnerId,
                        principalTable: "PARTNERS",
                        principalColumn: "PartnerId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PROGRAM_PARTNERS_PROGRAMS_ProgramId",
                        column: x => x.ProgramId,
                        principalTable: "PROGRAMS",
                        principalColumn: "ProgramId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RELATED_PROGRAMS",
                columns: table => new
                {
                    ProgramId = table.Column<long>(type: "bigint", nullable: false),
                    RelatedProgramId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RELATED_PROGRAMS", x => new { x.ProgramId, x.RelatedProgramId });
                    table.CheckConstraint("CK_RelatedPrograms_NotSelf", "[ProgramId] <> [RelatedProgramId]");
                    table.ForeignKey(
                        name: "FK_RELATED_PROGRAMS_PROGRAMS_ProgramId",
                        column: x => x.ProgramId,
                        principalTable: "PROGRAMS",
                        principalColumn: "ProgramId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RELATED_PROGRAMS_PROGRAMS_RelatedProgramId",
                        column: x => x.RelatedProgramId,
                        principalTable: "PROGRAMS",
                        principalColumn: "ProgramId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SCHEDULES",
                columns: table => new
                {
                    ScheduleId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CourseId = table.Column<long>(type: "bigint", nullable: true),
                    ProgramId = table.Column<long>(type: "bigint", nullable: true),
                    BatchCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    VenueName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    RoomNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Capacity = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SCHEDULES", x => x.ScheduleId);
                    table.CheckConstraint("CK_Schedules_CourseXorProgram", "([CourseId] IS NOT NULL AND [ProgramId] IS NULL) OR ([CourseId] IS NULL AND [ProgramId] IS NOT NULL)");
                    table.CheckConstraint("CK_Schedules_Status", "[Status] IN ('Scheduled','Running','Completed','Cancelled')");
                    table.ForeignKey(
                        name: "FK_SCHEDULES_COURSES_CourseId",
                        column: x => x.CourseId,
                        principalTable: "COURSES",
                        principalColumn: "CourseId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SCHEDULES_PROGRAMS_ProgramId",
                        column: x => x.ProgramId,
                        principalTable: "PROGRAMS",
                        principalColumn: "ProgramId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "APPLICATIONS",
                columns: table => new
                {
                    ApplicationId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<long>(type: "bigint", nullable: false),
                    CourseId = table.Column<long>(type: "bigint", nullable: true),
                    ProgramId = table.Column<long>(type: "bigint", nullable: true),
                    ScheduleId = table.Column<long>(type: "bigint", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    SubmissionDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_APPLICATIONS", x => x.ApplicationId);
                    table.CheckConstraint("CK_Applications_CourseXorProgram", "([CourseId] IS NOT NULL AND [ProgramId] IS NULL) OR ([CourseId] IS NULL AND [ProgramId] IS NOT NULL)");
                    table.CheckConstraint("CK_Applications_Status", "[Status] IN ('Submitted','Under_Review','Approved','Rejected')");
                    table.ForeignKey(
                        name: "FK_APPLICATIONS_COURSES_CourseId",
                        column: x => x.CourseId,
                        principalTable: "COURSES",
                        principalColumn: "CourseId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_APPLICATIONS_PROGRAMS_ProgramId",
                        column: x => x.ProgramId,
                        principalTable: "PROGRAMS",
                        principalColumn: "ProgramId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_APPLICATIONS_SCHEDULES_ScheduleId",
                        column: x => x.ScheduleId,
                        principalTable: "SCHEDULES",
                        principalColumn: "ScheduleId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_APPLICATIONS_USERS_UserId",
                        column: x => x.UserId,
                        principalTable: "USERS",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ASSIGNMENTS",
                columns: table => new
                {
                    AssignmentId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ScheduleId = table.Column<long>(type: "bigint", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DueDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    MaxScore = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ASSIGNMENTS", x => x.AssignmentId);
                    table.ForeignKey(
                        name: "FK_ASSIGNMENTS_SCHEDULES_ScheduleId",
                        column: x => x.ScheduleId,
                        principalTable: "SCHEDULES",
                        principalColumn: "ScheduleId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "COURSE_MATERIALS",
                columns: table => new
                {
                    MaterialId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CourseId = table.Column<long>(type: "bigint", nullable: false),
                    ScheduleId = table.Column<long>(type: "bigint", nullable: true),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    FileUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ResourceType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    UploadedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_COURSE_MATERIALS", x => x.MaterialId);
                    table.CheckConstraint("CK_CourseMaterials_Type", "[ResourceType] IN ('Slide','Document','Reference_Link')");
                    table.ForeignKey(
                        name: "FK_COURSE_MATERIALS_COURSES_CourseId",
                        column: x => x.CourseId,
                        principalTable: "COURSES",
                        principalColumn: "CourseId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_COURSE_MATERIALS_SCHEDULES_ScheduleId",
                        column: x => x.ScheduleId,
                        principalTable: "SCHEDULES",
                        principalColumn: "ScheduleId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "INSTRUCTOR_PAYOUTS",
                columns: table => new
                {
                    PayoutId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InstructorId = table.Column<long>(type: "bigint", nullable: false),
                    ScheduleId = table.Column<long>(type: "bigint", nullable: true),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ProcessedBy = table.Column<long>(type: "bigint", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PaidAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_INSTRUCTOR_PAYOUTS", x => x.PayoutId);
                    table.CheckConstraint("CK_InstructorPayouts_Status", "[Status] IN ('Pending','Paid','Cancelled')");
                    table.ForeignKey(
                        name: "FK_INSTRUCTOR_PAYOUTS_INSTRUCTORS_InstructorId",
                        column: x => x.InstructorId,
                        principalTable: "INSTRUCTORS",
                        principalColumn: "InstructorId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_INSTRUCTOR_PAYOUTS_SCHEDULES_ScheduleId",
                        column: x => x.ScheduleId,
                        principalTable: "SCHEDULES",
                        principalColumn: "ScheduleId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_INSTRUCTOR_PAYOUTS_USERS_ProcessedBy",
                        column: x => x.ProcessedBy,
                        principalTable: "USERS",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SCHEDULE_INSTRUCTORS",
                columns: table => new
                {
                    ScheduleId = table.Column<long>(type: "bigint", nullable: false),
                    InstructorId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SCHEDULE_INSTRUCTORS", x => new { x.ScheduleId, x.InstructorId });
                    table.ForeignKey(
                        name: "FK_SCHEDULE_INSTRUCTORS_INSTRUCTORS_InstructorId",
                        column: x => x.InstructorId,
                        principalTable: "INSTRUCTORS",
                        principalColumn: "InstructorId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SCHEDULE_INSTRUCTORS_SCHEDULES_ScheduleId",
                        column: x => x.ScheduleId,
                        principalTable: "SCHEDULES",
                        principalColumn: "ScheduleId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SESSIONS",
                columns: table => new
                {
                    SessionId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ScheduleId = table.Column<long>(type: "bigint", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    SessionDate = table.Column<DateOnly>(type: "date", nullable: false),
                    StartTime = table.Column<TimeOnly>(type: "time", nullable: false),
                    EndTime = table.Column<TimeOnly>(type: "time", nullable: false),
                    RoomDetails = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SESSIONS", x => x.SessionId);
                    table.ForeignKey(
                        name: "FK_SESSIONS_SCHEDULES_ScheduleId",
                        column: x => x.ScheduleId,
                        principalTable: "SCHEDULES",
                        principalColumn: "ScheduleId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ENROLLMENTS",
                columns: table => new
                {
                    EnrollmentId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<long>(type: "bigint", nullable: false),
                    CourseId = table.Column<long>(type: "bigint", nullable: true),
                    ProgramId = table.Column<long>(type: "bigint", nullable: true),
                    ScheduleId = table.Column<long>(type: "bigint", nullable: true),
                    ApplicationId = table.Column<long>(type: "bigint", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    EnrolledAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ENROLLMENTS", x => x.EnrollmentId);
                    table.CheckConstraint("CK_Enrollments_CourseXorProgram", "([CourseId] IS NOT NULL AND [ProgramId] IS NULL) OR ([CourseId] IS NULL AND [ProgramId] IS NOT NULL)");
                    table.CheckConstraint("CK_Enrollments_Status", "[Status] IN ('Enrolled','Active','Completed','Cancelled')");
                    table.ForeignKey(
                        name: "FK_ENROLLMENTS_APPLICATIONS_ApplicationId",
                        column: x => x.ApplicationId,
                        principalTable: "APPLICATIONS",
                        principalColumn: "ApplicationId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ENROLLMENTS_COURSES_CourseId",
                        column: x => x.CourseId,
                        principalTable: "COURSES",
                        principalColumn: "CourseId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ENROLLMENTS_PROGRAMS_ProgramId",
                        column: x => x.ProgramId,
                        principalTable: "PROGRAMS",
                        principalColumn: "ProgramId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ENROLLMENTS_SCHEDULES_ScheduleId",
                        column: x => x.ScheduleId,
                        principalTable: "SCHEDULES",
                        principalColumn: "ScheduleId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ENROLLMENTS_USERS_UserId",
                        column: x => x.UserId,
                        principalTable: "USERS",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ASSIGNMENT_SUBMISSIONS",
                columns: table => new
                {
                    SubmissionId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AssignmentId = table.Column<long>(type: "bigint", nullable: false),
                    LearnerId = table.Column<long>(type: "bigint", nullable: false),
                    AttemptNumber = table.Column<int>(type: "int", nullable: false, defaultValue: 1),
                    FileUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ASSIGNMENT_SUBMISSIONS", x => x.SubmissionId);
                    table.CheckConstraint("CK_AssignmentSubmissions_Status", "[Status] IN ('Submitted','Late')");
                    table.ForeignKey(
                        name: "FK_ASSIGNMENT_SUBMISSIONS_ASSIGNMENTS_AssignmentId",
                        column: x => x.AssignmentId,
                        principalTable: "ASSIGNMENTS",
                        principalColumn: "AssignmentId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ASSIGNMENT_SUBMISSIONS_USERS_LearnerId",
                        column: x => x.LearnerId,
                        principalTable: "USERS",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ATTENDANCE",
                columns: table => new
                {
                    AttendanceId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SessionId = table.Column<long>(type: "bigint", nullable: false),
                    LearnerId = table.Column<long>(type: "bigint", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    MarkedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ATTENDANCE", x => x.AttendanceId);
                    table.CheckConstraint("CK_Attendance_Status", "[Status] IN ('Present','Absent','Late','Excused')");
                    table.ForeignKey(
                        name: "FK_ATTENDANCE_SESSIONS_SessionId",
                        column: x => x.SessionId,
                        principalTable: "SESSIONS",
                        principalColumn: "SessionId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ATTENDANCE_USERS_LearnerId",
                        column: x => x.LearnerId,
                        principalTable: "USERS",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PAYMENTS",
                columns: table => new
                {
                    PaymentId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<long>(type: "bigint", nullable: false),
                    ApplicationId = table.Column<long>(type: "bigint", nullable: true),
                    EnrollmentId = table.Column<long>(type: "bigint", nullable: true),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    GatewayName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TransactionRef = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PaidAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PAYMENTS", x => x.PaymentId);
                    table.CheckConstraint("CK_Payments_Status", "[Status] IN ('Initiated','Success','Failed','Refunded')");
                    table.CheckConstraint("CK_Payments_Target", "[ApplicationId] IS NOT NULL OR [EnrollmentId] IS NOT NULL");
                    table.ForeignKey(
                        name: "FK_PAYMENTS_APPLICATIONS_ApplicationId",
                        column: x => x.ApplicationId,
                        principalTable: "APPLICATIONS",
                        principalColumn: "ApplicationId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PAYMENTS_ENROLLMENTS_EnrollmentId",
                        column: x => x.EnrollmentId,
                        principalTable: "ENROLLMENTS",
                        principalColumn: "EnrollmentId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PAYMENTS_USERS_UserId",
                        column: x => x.UserId,
                        principalTable: "USERS",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PROGRESS",
                columns: table => new
                {
                    ProgressId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EnrollmentId = table.Column<long>(type: "bigint", nullable: false),
                    CompletedSessionsCount = table.Column<int>(type: "int", nullable: false),
                    SubmittedAssignmentsCount = table.Column<int>(type: "int", nullable: false),
                    ProgressPercentage = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    LastUpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PROGRESS", x => x.ProgressId);
                    table.ForeignKey(
                        name: "FK_PROGRESS_ENROLLMENTS_EnrollmentId",
                        column: x => x.EnrollmentId,
                        principalTable: "ENROLLMENTS",
                        principalColumn: "EnrollmentId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "ROLES",
                columns: new[] { "RoleId", "Name" },
                values: new object[,]
                {
                    { 1, "Learner" },
                    { 2, "Instructor" },
                    { 3, "Manager" },
                    { 4, "Admin" },
                    { 5, "Content_Manager" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_APPLICATIONS_CourseId",
                table: "APPLICATIONS",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_APPLICATIONS_ProgramId",
                table: "APPLICATIONS",
                column: "ProgramId");

            migrationBuilder.CreateIndex(
                name: "IX_APPLICATIONS_ScheduleId",
                table: "APPLICATIONS",
                column: "ScheduleId");

            migrationBuilder.CreateIndex(
                name: "IX_APPLICATIONS_UserId",
                table: "APPLICATIONS",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ASSIGNMENT_SUBMISSIONS_AssignmentId_LearnerId_AttemptNumber",
                table: "ASSIGNMENT_SUBMISSIONS",
                columns: new[] { "AssignmentId", "LearnerId", "AttemptNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ASSIGNMENT_SUBMISSIONS_LearnerId",
                table: "ASSIGNMENT_SUBMISSIONS",
                column: "LearnerId");

            migrationBuilder.CreateIndex(
                name: "IX_ASSIGNMENTS_ScheduleId",
                table: "ASSIGNMENTS",
                column: "ScheduleId");

            migrationBuilder.CreateIndex(
                name: "IX_ATTENDANCE_LearnerId",
                table: "ATTENDANCE",
                column: "LearnerId");

            migrationBuilder.CreateIndex(
                name: "IX_ATTENDANCE_SessionId_LearnerId",
                table: "ATTENDANCE",
                columns: new[] { "SessionId", "LearnerId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CATEGORIES_Slug",
                table: "CATEGORIES",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CONTACT_ENQUIRIES_HandledBy",
                table: "CONTACT_ENQUIRIES",
                column: "HandledBy");

            migrationBuilder.CreateIndex(
                name: "IX_CONTACT_ENQUIRIES_UserId",
                table: "CONTACT_ENQUIRIES",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_CONTENT_PAGES_PageKey_SectionKey",
                table: "CONTENT_PAGES",
                columns: new[] { "PageKey", "SectionKey" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CONTENT_PAGES_UpdatedBy",
                table: "CONTENT_PAGES",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_COURSE_MATERIALS_CourseId",
                table: "COURSE_MATERIALS",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_COURSE_MATERIALS_ScheduleId",
                table: "COURSE_MATERIALS",
                column: "ScheduleId");

            migrationBuilder.CreateIndex(
                name: "IX_COURSES_CategoryId",
                table: "COURSES",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_EMAIL_VERIFICATION_TOKENS_Token",
                table: "EMAIL_VERIFICATION_TOKENS",
                column: "Token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EMAIL_VERIFICATION_TOKENS_UserId",
                table: "EMAIL_VERIFICATION_TOKENS",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ENROLLMENTS_CourseId",
                table: "ENROLLMENTS",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_ENROLLMENTS_ProgramId",
                table: "ENROLLMENTS",
                column: "ProgramId");

            migrationBuilder.CreateIndex(
                name: "IX_ENROLLMENTS_ScheduleId",
                table: "ENROLLMENTS",
                column: "ScheduleId");

            migrationBuilder.CreateIndex(
                name: "UX_Enrollment_Application",
                table: "ENROLLMENTS",
                column: "ApplicationId",
                unique: true,
                filter: "[ApplicationId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "UX_Enrollment_Course",
                table: "ENROLLMENTS",
                columns: new[] { "UserId", "CourseId" },
                unique: true,
                filter: "[CourseId] IS NOT NULL AND [ScheduleId] IS NULL");

            migrationBuilder.CreateIndex(
                name: "UX_Enrollment_Program",
                table: "ENROLLMENTS",
                columns: new[] { "UserId", "ProgramId" },
                unique: true,
                filter: "[ProgramId] IS NOT NULL AND [ScheduleId] IS NULL");

            migrationBuilder.CreateIndex(
                name: "UX_Enrollment_Schedule",
                table: "ENROLLMENTS",
                columns: new[] { "UserId", "ScheduleId" },
                unique: true,
                filter: "[ScheduleId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "UX_Faq_Category_Order",
                table: "FAQS",
                columns: new[] { "CategoryId", "OrderIndex" },
                unique: true,
                filter: "[CategoryId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "UX_Faq_General_Order",
                table: "FAQS",
                column: "OrderIndex",
                unique: true,
                filter: "[CategoryId] IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_INSTRUCTOR_PAYOUTS_InstructorId",
                table: "INSTRUCTOR_PAYOUTS",
                column: "InstructorId");

            migrationBuilder.CreateIndex(
                name: "IX_INSTRUCTOR_PAYOUTS_ProcessedBy",
                table: "INSTRUCTOR_PAYOUTS",
                column: "ProcessedBy");

            migrationBuilder.CreateIndex(
                name: "IX_INSTRUCTOR_PAYOUTS_ScheduleId",
                table: "INSTRUCTOR_PAYOUTS",
                column: "ScheduleId");

            migrationBuilder.CreateIndex(
                name: "IX_NOTIFICATIONS_UserId",
                table: "NOTIFICATIONS",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_PASSWORD_RESET_TOKENS_Token",
                table: "PASSWORD_RESET_TOKENS",
                column: "Token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PASSWORD_RESET_TOKENS_UserId",
                table: "PASSWORD_RESET_TOKENS",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_PAYMENTS_ApplicationId",
                table: "PAYMENTS",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_PAYMENTS_EnrollmentId",
                table: "PAYMENTS",
                column: "EnrollmentId");

            migrationBuilder.CreateIndex(
                name: "IX_PAYMENTS_TransactionRef",
                table: "PAYMENTS",
                column: "TransactionRef",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PAYMENTS_UserId",
                table: "PAYMENTS",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_PERMISSIONS_Code",
                table: "PERMISSIONS",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PROGRAM_COURSES_CourseId",
                table: "PROGRAM_COURSES",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_PROGRAM_PARTNERS_PartnerId",
                table: "PROGRAM_PARTNERS",
                column: "PartnerId");

            migrationBuilder.CreateIndex(
                name: "IX_PROGRAMS_CareerPathId",
                table: "PROGRAMS",
                column: "CareerPathId");

            migrationBuilder.CreateIndex(
                name: "IX_PROGRAMS_CategoryId",
                table: "PROGRAMS",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_PROGRESS_EnrollmentId",
                table: "PROGRESS",
                column: "EnrollmentId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RELATED_COURSES_RelatedCourseId",
                table: "RELATED_COURSES",
                column: "RelatedCourseId");

            migrationBuilder.CreateIndex(
                name: "IX_RELATED_PROGRAMS_RelatedProgramId",
                table: "RELATED_PROGRAMS",
                column: "RelatedProgramId");

            migrationBuilder.CreateIndex(
                name: "IX_ROLE_PERMISSIONS_PermissionId",
                table: "ROLE_PERMISSIONS",
                column: "PermissionId");

            migrationBuilder.CreateIndex(
                name: "IX_ROLES_Name",
                table: "ROLES",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SCHEDULE_INSTRUCTORS_InstructorId",
                table: "SCHEDULE_INSTRUCTORS",
                column: "InstructorId");

            migrationBuilder.CreateIndex(
                name: "IX_SCHEDULES_CourseId",
                table: "SCHEDULES",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_SCHEDULES_ProgramId",
                table: "SCHEDULES",
                column: "ProgramId");

            migrationBuilder.CreateIndex(
                name: "IX_SESSIONS_ScheduleId",
                table: "SESSIONS",
                column: "ScheduleId");

            migrationBuilder.CreateIndex(
                name: "IX_TESTIMONIALS_CourseId",
                table: "TESTIMONIALS",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_TESTIMONIALS_UserId",
                table: "TESTIMONIALS",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_USER_ROLES_RoleId",
                table: "USER_ROLES",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_USERS_Email",
                table: "USERS",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ASSIGNMENT_SUBMISSIONS");

            migrationBuilder.DropTable(
                name: "ATTENDANCE");

            migrationBuilder.DropTable(
                name: "CONTACT_ENQUIRIES");

            migrationBuilder.DropTable(
                name: "CONTENT_PAGES");

            migrationBuilder.DropTable(
                name: "COURSE_MATERIALS");

            migrationBuilder.DropTable(
                name: "EMAIL_VERIFICATION_TOKENS");

            migrationBuilder.DropTable(
                name: "FAQS");

            migrationBuilder.DropTable(
                name: "INSTRUCTOR_PAYOUTS");

            migrationBuilder.DropTable(
                name: "NOTIFICATIONS");

            migrationBuilder.DropTable(
                name: "PASSWORD_RESET_TOKENS");

            migrationBuilder.DropTable(
                name: "PAYMENTS");

            migrationBuilder.DropTable(
                name: "PROGRAM_COURSES");

            migrationBuilder.DropTable(
                name: "PROGRAM_PARTNERS");

            migrationBuilder.DropTable(
                name: "PROGRESS");

            migrationBuilder.DropTable(
                name: "RELATED_COURSES");

            migrationBuilder.DropTable(
                name: "RELATED_PROGRAMS");

            migrationBuilder.DropTable(
                name: "ROLE_PERMISSIONS");

            migrationBuilder.DropTable(
                name: "SCHEDULE_INSTRUCTORS");

            migrationBuilder.DropTable(
                name: "TESTIMONIALS");

            migrationBuilder.DropTable(
                name: "USER_ROLES");

            migrationBuilder.DropTable(
                name: "ASSIGNMENTS");

            migrationBuilder.DropTable(
                name: "SESSIONS");

            migrationBuilder.DropTable(
                name: "PARTNERS");

            migrationBuilder.DropTable(
                name: "ENROLLMENTS");

            migrationBuilder.DropTable(
                name: "PERMISSIONS");

            migrationBuilder.DropTable(
                name: "INSTRUCTORS");

            migrationBuilder.DropTable(
                name: "ROLES");

            migrationBuilder.DropTable(
                name: "APPLICATIONS");

            migrationBuilder.DropTable(
                name: "SCHEDULES");

            migrationBuilder.DropTable(
                name: "USERS");

            migrationBuilder.DropTable(
                name: "COURSES");

            migrationBuilder.DropTable(
                name: "PROGRAMS");

            migrationBuilder.DropTable(
                name: "CAREER_PATHS");

            migrationBuilder.DropTable(
                name: "CATEGORIES");
        }
    }
}
