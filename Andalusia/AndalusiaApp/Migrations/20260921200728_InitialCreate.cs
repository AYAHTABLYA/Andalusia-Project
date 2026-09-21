using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace AndalusiaApp.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CAREER_PATHS",
                columns: table => new
                {
                    career_path_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    overview = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    recommended_skills = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    learning_journey = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_career_paths", x => x.career_path_id);
                });

            migrationBuilder.CreateTable(
                name: "CATEGORIES",
                columns: table => new
                {
                    category_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    slug = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    is_trending = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_categories", x => x.category_id);
                });

            migrationBuilder.CreateTable(
                name: "CONTACT_ENQUIRIES",
                columns: table => new
                {
                    enquiry_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    full_name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    mobile_number = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    subject_type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_contact_enquiries", x => x.enquiry_id);
                    table.CheckConstraint("CK_ContactEnquiries_Status", "[status] IN ('New','In_Progress','Resolved','Closed')");
                    table.CheckConstraint("CK_ContactEnquiries_Subject", "[subject_type] IN ('General','Course','Program','Corporate')");
                });

            migrationBuilder.CreateTable(
                name: "PARTNERS",
                columns: table => new
                {
                    partner_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    logo_url = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    is_active = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_partners", x => x.partner_id);
                    table.CheckConstraint("CK_Partners_Type", "[type] IN ('Accreditation','Success_Partner')");
                });

            migrationBuilder.CreateTable(
                name: "PERMISSIONS",
                columns: table => new
                {
                    permission_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    code = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_permissions", x => x.permission_id);
                });

            migrationBuilder.CreateTable(
                name: "ROLES",
                columns: table => new
                {
                    role_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_roles", x => x.role_id);
                });

            migrationBuilder.CreateTable(
                name: "TESTIMONIALS",
                columns: table => new
                {
                    testimonial_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    client_name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    title_or_role = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    quote_text = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    avatar_url = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    is_featured = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_testimonials", x => x.testimonial_id);
                });

            migrationBuilder.CreateTable(
                name: "USERS",
                columns: table => new
                {
                    user_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    first_name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    last_name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    mobile_number = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    country = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    preferred_language = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    password_hash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    terms_accepted_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_users", x => x.user_id);
                });

            migrationBuilder.CreateTable(
                name: "COURSES",
                columns: table => new
                {
                    course_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    category_id = table.Column<long>(type: "bigint", nullable: false),
                    title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    short_description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    full_description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    objectives = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    duration = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    image_url = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_courses", x => x.course_id);
                    table.CheckConstraint("CK_Courses_Status", "[status] IN ('Draft','Upcoming','Active','Closed')");
                    table.ForeignKey(
                        name: "fk_courses_categories_category_id",
                        column: x => x.category_id,
                        principalTable: "CATEGORIES",
                        principalColumn: "category_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "FAQS",
                columns: table => new
                {
                    faq_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    category_id = table.Column<long>(type: "bigint", nullable: true),
                    question = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    answer = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    order_index = table.Column<int>(type: "int", nullable: false),
                    is_active = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_faqs", x => x.faq_id);
                    table.ForeignKey(
                        name: "fk_faqs_categories_category_id",
                        column: x => x.category_id,
                        principalTable: "CATEGORIES",
                        principalColumn: "category_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PROGRAMS",
                columns: table => new
                {
                    program_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    category_id = table.Column<long>(type: "bigint", nullable: false),
                    career_path_id = table.Column<long>(type: "bigint", nullable: true),
                    title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    overview = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    requirements = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    structure = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    duration = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_programs", x => x.program_id);
                    table.CheckConstraint("CK_Programs_Status", "[status] IN ('Draft','Active','Archived')");
                    table.ForeignKey(
                        name: "fk_programs_career_paths_career_path_id",
                        column: x => x.career_path_id,
                        principalTable: "CAREER_PATHS",
                        principalColumn: "career_path_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_programs_categories_category_id",
                        column: x => x.category_id,
                        principalTable: "CATEGORIES",
                        principalColumn: "category_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ROLE_PERMISSIONS",
                columns: table => new
                {
                    role_id = table.Column<int>(type: "int", nullable: false),
                    permission_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_role_permissions", x => new { x.role_id, x.permission_id });
                    table.ForeignKey(
                        name: "fk_role_permissions_permissions_permission_id",
                        column: x => x.permission_id,
                        principalTable: "PERMISSIONS",
                        principalColumn: "permission_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_role_permissions_roles_role_id",
                        column: x => x.role_id,
                        principalTable: "ROLES",
                        principalColumn: "role_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CONTENT_PAGES",
                columns: table => new
                {
                    page_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    page_key = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    section_key = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    content_payload = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    updated_by = table.Column<long>(type: "bigint", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_content_pages", x => x.page_id);
                    table.ForeignKey(
                        name: "fk_content_pages_users_updated_by",
                        column: x => x.updated_by,
                        principalTable: "USERS",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EMAIL_VERIFICATION_TOKENS",
                columns: table => new
                {
                    verification_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<long>(type: "bigint", nullable: false),
                    token = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    expires_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    verified_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_email_verification_tokens", x => x.verification_id);
                    table.ForeignKey(
                        name: "fk_email_verification_tokens_users_user_id",
                        column: x => x.user_id,
                        principalTable: "USERS",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "INSTRUCTORS",
                columns: table => new
                {
                    instructor_id = table.Column<long>(type: "bigint", nullable: false),
                    bio = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    job_title = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    avatar_url = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_instructors", x => x.instructor_id);
                    table.ForeignKey(
                        name: "fk_instructors_users_instructor_id",
                        column: x => x.instructor_id,
                        principalTable: "USERS",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "NOTIFICATIONS",
                columns: table => new
                {
                    notification_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<long>(type: "bigint", nullable: false),
                    title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    is_read = table.Column<bool>(type: "bit", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_notifications", x => x.notification_id);
                    table.ForeignKey(
                        name: "fk_notifications_users_user_id",
                        column: x => x.user_id,
                        principalTable: "USERS",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PASSWORD_RESET_TOKENS",
                columns: table => new
                {
                    reset_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<long>(type: "bigint", nullable: false),
                    token = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    expires_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    used_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_password_reset_tokens", x => x.reset_id);
                    table.ForeignKey(
                        name: "fk_password_reset_tokens_users_user_id",
                        column: x => x.user_id,
                        principalTable: "USERS",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "USER_ROLES",
                columns: table => new
                {
                    user_id = table.Column<long>(type: "bigint", nullable: false),
                    role_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_user_roles", x => new { x.user_id, x.role_id });
                    table.ForeignKey(
                        name: "fk_user_roles_roles_role_id",
                        column: x => x.role_id,
                        principalTable: "ROLES",
                        principalColumn: "role_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_user_roles_users_user_id",
                        column: x => x.user_id,
                        principalTable: "USERS",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RELATED_COURSES",
                columns: table => new
                {
                    course_id = table.Column<long>(type: "bigint", nullable: false),
                    related_course_id = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_related_courses", x => new { x.course_id, x.related_course_id });
                    table.CheckConstraint("CK_RelatedCourses_NotSelf", "[course_id] <> [related_course_id]");
                    table.ForeignKey(
                        name: "fk_related_courses_courses_course_id",
                        column: x => x.course_id,
                        principalTable: "COURSES",
                        principalColumn: "course_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_related_courses_courses_related_course_id",
                        column: x => x.related_course_id,
                        principalTable: "COURSES",
                        principalColumn: "course_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PROGRAM_COURSES",
                columns: table => new
                {
                    program_id = table.Column<long>(type: "bigint", nullable: false),
                    course_id = table.Column<long>(type: "bigint", nullable: false),
                    order_index = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_program_courses", x => new { x.program_id, x.course_id });
                    table.ForeignKey(
                        name: "fk_program_courses_courses_course_id",
                        column: x => x.course_id,
                        principalTable: "COURSES",
                        principalColumn: "course_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_program_courses_programs_program_id",
                        column: x => x.program_id,
                        principalTable: "PROGRAMS",
                        principalColumn: "program_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RELATED_PROGRAMS",
                columns: table => new
                {
                    program_id = table.Column<long>(type: "bigint", nullable: false),
                    related_program_id = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_related_programs", x => new { x.program_id, x.related_program_id });
                    table.CheckConstraint("CK_RelatedPrograms_NotSelf", "[program_id] <> [related_program_id]");
                    table.ForeignKey(
                        name: "fk_related_programs_programs_program_id",
                        column: x => x.program_id,
                        principalTable: "PROGRAMS",
                        principalColumn: "program_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_related_programs_programs_related_program_id",
                        column: x => x.related_program_id,
                        principalTable: "PROGRAMS",
                        principalColumn: "program_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SCHEDULES",
                columns: table => new
                {
                    schedule_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    course_id = table.Column<long>(type: "bigint", nullable: true),
                    program_id = table.Column<long>(type: "bigint", nullable: true),
                    batch_code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    venue_name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    room_number = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    start_date = table.Column<DateOnly>(type: "date", nullable: false),
                    end_date = table.Column<DateOnly>(type: "date", nullable: false),
                    capacity = table.Column<int>(type: "int", nullable: false),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_schedules", x => x.schedule_id);
                    table.CheckConstraint("CK_Schedules_CourseXorProgram", "([course_id] IS NOT NULL AND [program_id] IS NULL) OR ([course_id] IS NULL AND [program_id] IS NOT NULL)");
                    table.CheckConstraint("CK_Schedules_Status", "[status] IN ('Scheduled','Running','Completed','Cancelled')");
                    table.ForeignKey(
                        name: "fk_schedules_courses_course_id",
                        column: x => x.course_id,
                        principalTable: "COURSES",
                        principalColumn: "course_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_schedules_programs_program_id",
                        column: x => x.program_id,
                        principalTable: "PROGRAMS",
                        principalColumn: "program_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "APPLICATIONS",
                columns: table => new
                {
                    application_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<long>(type: "bigint", nullable: false),
                    course_id = table.Column<long>(type: "bigint", nullable: true),
                    program_id = table.Column<long>(type: "bigint", nullable: true),
                    schedule_id = table.Column<long>(type: "bigint", nullable: true),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    submission_date = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_applications", x => x.application_id);
                    table.CheckConstraint("CK_Applications_CourseXorProgram", "([course_id] IS NOT NULL AND [program_id] IS NULL) OR ([course_id] IS NULL AND [program_id] IS NOT NULL)");
                    table.CheckConstraint("CK_Applications_Status", "[status] IN ('Submitted','Under_Review','Approved','Rejected')");
                    table.ForeignKey(
                        name: "fk_applications_courses_course_id",
                        column: x => x.course_id,
                        principalTable: "COURSES",
                        principalColumn: "course_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_applications_programs_program_id",
                        column: x => x.program_id,
                        principalTable: "PROGRAMS",
                        principalColumn: "program_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_applications_schedules_schedule_id",
                        column: x => x.schedule_id,
                        principalTable: "SCHEDULES",
                        principalColumn: "schedule_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_applications_users_user_id",
                        column: x => x.user_id,
                        principalTable: "USERS",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ASSIGNMENTS",
                columns: table => new
                {
                    assignment_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    schedule_id = table.Column<long>(type: "bigint", nullable: false),
                    title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    due_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    max_score = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_assignments", x => x.assignment_id);
                    table.ForeignKey(
                        name: "fk_assignments_schedules_schedule_id",
                        column: x => x.schedule_id,
                        principalTable: "SCHEDULES",
                        principalColumn: "schedule_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "COURSE_MATERIALS",
                columns: table => new
                {
                    material_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    course_id = table.Column<long>(type: "bigint", nullable: false),
                    schedule_id = table.Column<long>(type: "bigint", nullable: true),
                    title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    file_url = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    resource_type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    uploaded_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_course_materials", x => x.material_id);
                    table.CheckConstraint("CK_CourseMaterials_Type", "[resource_type] IN ('Slide','Document','Reference_Link')");
                    table.ForeignKey(
                        name: "fk_course_materials_courses_course_id",
                        column: x => x.course_id,
                        principalTable: "COURSES",
                        principalColumn: "course_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_course_materials_schedules_schedule_id",
                        column: x => x.schedule_id,
                        principalTable: "SCHEDULES",
                        principalColumn: "schedule_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "INSTRUCTOR_PAYOUTS",
                columns: table => new
                {
                    payout_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    instructor_id = table.Column<long>(type: "bigint", nullable: false),
                    schedule_id = table.Column<long>(type: "bigint", nullable: true),
                    amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    processed_by = table.Column<long>(type: "bigint", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    paid_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_instructor_payouts", x => x.payout_id);
                    table.CheckConstraint("CK_InstructorPayouts_Status", "[status] IN ('Pending','Paid','Cancelled')");
                    table.ForeignKey(
                        name: "fk_instructor_payouts_instructors_instructor_id",
                        column: x => x.instructor_id,
                        principalTable: "INSTRUCTORS",
                        principalColumn: "instructor_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_instructor_payouts_schedules_schedule_id",
                        column: x => x.schedule_id,
                        principalTable: "SCHEDULES",
                        principalColumn: "schedule_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_instructor_payouts_users_processed_by",
                        column: x => x.processed_by,
                        principalTable: "USERS",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SCHEDULE_INSTRUCTORS",
                columns: table => new
                {
                    schedule_id = table.Column<long>(type: "bigint", nullable: false),
                    instructor_id = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_schedule_instructors", x => new { x.schedule_id, x.instructor_id });
                    table.ForeignKey(
                        name: "fk_schedule_instructors_instructors_instructor_id",
                        column: x => x.instructor_id,
                        principalTable: "INSTRUCTORS",
                        principalColumn: "instructor_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_schedule_instructors_schedules_schedule_id",
                        column: x => x.schedule_id,
                        principalTable: "SCHEDULES",
                        principalColumn: "schedule_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SESSIONS",
                columns: table => new
                {
                    session_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    schedule_id = table.Column<long>(type: "bigint", nullable: false),
                    title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    session_date = table.Column<DateOnly>(type: "date", nullable: false),
                    start_time = table.Column<TimeOnly>(type: "time", nullable: false),
                    end_time = table.Column<TimeOnly>(type: "time", nullable: false),
                    room_details = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_sessions", x => x.session_id);
                    table.ForeignKey(
                        name: "fk_sessions_schedules_schedule_id",
                        column: x => x.schedule_id,
                        principalTable: "SCHEDULES",
                        principalColumn: "schedule_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ENROLLMENTS",
                columns: table => new
                {
                    enrollment_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<long>(type: "bigint", nullable: false),
                    course_id = table.Column<long>(type: "bigint", nullable: true),
                    program_id = table.Column<long>(type: "bigint", nullable: true),
                    schedule_id = table.Column<long>(type: "bigint", nullable: true),
                    application_id = table.Column<long>(type: "bigint", nullable: true),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    enrolled_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_enrollments", x => x.enrollment_id);
                    table.CheckConstraint("CK_Enrollments_CourseXorProgram", "([course_id] IS NOT NULL AND [program_id] IS NULL) OR ([course_id] IS NULL AND [program_id] IS NOT NULL)");
                    table.CheckConstraint("CK_Enrollments_Status", "[status] IN ('Enrolled','Active','Completed','Cancelled')");
                    table.ForeignKey(
                        name: "fk_enrollments_applications_application_id",
                        column: x => x.application_id,
                        principalTable: "APPLICATIONS",
                        principalColumn: "application_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_enrollments_courses_course_id",
                        column: x => x.course_id,
                        principalTable: "COURSES",
                        principalColumn: "course_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_enrollments_programs_program_id",
                        column: x => x.program_id,
                        principalTable: "PROGRAMS",
                        principalColumn: "program_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_enrollments_schedules_schedule_id",
                        column: x => x.schedule_id,
                        principalTable: "SCHEDULES",
                        principalColumn: "schedule_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_enrollments_users_user_id",
                        column: x => x.user_id,
                        principalTable: "USERS",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ASSIGNMENT_SUBMISSIONS",
                columns: table => new
                {
                    submission_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    assignment_id = table.Column<long>(type: "bigint", nullable: false),
                    learner_id = table.Column<long>(type: "bigint", nullable: false),
                    attempt_number = table.Column<int>(type: "int", nullable: false, defaultValue: 1),
                    file_url = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    submitted_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_assignment_submissions", x => x.submission_id);
                    table.CheckConstraint("CK_AssignmentSubmissions_Status", "[status] IN ('Submitted','Late')");
                    table.ForeignKey(
                        name: "fk_assignment_submissions_assignments_assignment_id",
                        column: x => x.assignment_id,
                        principalTable: "ASSIGNMENTS",
                        principalColumn: "assignment_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_assignment_submissions_users_learner_id",
                        column: x => x.learner_id,
                        principalTable: "USERS",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ATTENDANCE",
                columns: table => new
                {
                    attendance_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    session_id = table.Column<long>(type: "bigint", nullable: false),
                    learner_id = table.Column<long>(type: "bigint", nullable: false),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    marked_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_attendance", x => x.attendance_id);
                    table.CheckConstraint("CK_Attendance_Status", "[status] IN ('Present','Absent','Late','Excused')");
                    table.ForeignKey(
                        name: "fk_attendance_sessions_session_id",
                        column: x => x.session_id,
                        principalTable: "SESSIONS",
                        principalColumn: "session_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_attendance_users_learner_id",
                        column: x => x.learner_id,
                        principalTable: "USERS",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PAYMENTS",
                columns: table => new
                {
                    payment_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<long>(type: "bigint", nullable: false),
                    application_id = table.Column<long>(type: "bigint", nullable: true),
                    enrollment_id = table.Column<long>(type: "bigint", nullable: true),
                    amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    gateway_name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    transaction_ref = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    paid_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_payments", x => x.payment_id);
                    table.CheckConstraint("CK_Payments_Status", "[status] IN ('Initiated','Success','Failed','Refunded')");
                    table.CheckConstraint("CK_Payments_Target", "[application_id] IS NOT NULL OR [enrollment_id] IS NOT NULL");
                    table.ForeignKey(
                        name: "fk_payments_applications_application_id",
                        column: x => x.application_id,
                        principalTable: "APPLICATIONS",
                        principalColumn: "application_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_payments_enrollments_enrollment_id",
                        column: x => x.enrollment_id,
                        principalTable: "ENROLLMENTS",
                        principalColumn: "enrollment_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_payments_users_user_id",
                        column: x => x.user_id,
                        principalTable: "USERS",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PROGRESS",
                columns: table => new
                {
                    progress_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    enrollment_id = table.Column<long>(type: "bigint", nullable: false),
                    completed_sessions_count = table.Column<int>(type: "int", nullable: false),
                    submitted_assignments_count = table.Column<int>(type: "int", nullable: false),
                    progress_percentage = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    last_updated_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_progress", x => x.progress_id);
                    table.ForeignKey(
                        name: "fk_progress_enrollments_enrollment_id",
                        column: x => x.enrollment_id,
                        principalTable: "ENROLLMENTS",
                        principalColumn: "enrollment_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "ROLES",
                columns: new[] { "role_id", "name" },
                values: new object[,]
                {
                    { 1, "Learner" },
                    { 2, "Instructor" },
                    { 3, "Manager" },
                    { 4, "Admin" },
                    { 5, "Content_Manager" }
                });

            migrationBuilder.CreateIndex(
                name: "ix_applications_course_id",
                table: "APPLICATIONS",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "ix_applications_program_id",
                table: "APPLICATIONS",
                column: "program_id");

            migrationBuilder.CreateIndex(
                name: "ix_applications_schedule_id",
                table: "APPLICATIONS",
                column: "schedule_id");

            migrationBuilder.CreateIndex(
                name: "ix_applications_user_id",
                table: "APPLICATIONS",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_assignment_submissions_assignment_id_learner_id_attempt_number",
                table: "ASSIGNMENT_SUBMISSIONS",
                columns: new[] { "assignment_id", "learner_id", "attempt_number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_assignment_submissions_learner_id",
                table: "ASSIGNMENT_SUBMISSIONS",
                column: "learner_id");

            migrationBuilder.CreateIndex(
                name: "ix_assignments_schedule_id",
                table: "ASSIGNMENTS",
                column: "schedule_id");

            migrationBuilder.CreateIndex(
                name: "ix_attendance_learner_id",
                table: "ATTENDANCE",
                column: "learner_id");

            migrationBuilder.CreateIndex(
                name: "ix_attendance_session_id_learner_id",
                table: "ATTENDANCE",
                columns: new[] { "session_id", "learner_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_categories_slug",
                table: "CATEGORIES",
                column: "slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_content_pages_page_key_section_key",
                table: "CONTENT_PAGES",
                columns: new[] { "page_key", "section_key" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_content_pages_updated_by",
                table: "CONTENT_PAGES",
                column: "updated_by");

            migrationBuilder.CreateIndex(
                name: "ix_course_materials_course_id",
                table: "COURSE_MATERIALS",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "ix_course_materials_schedule_id",
                table: "COURSE_MATERIALS",
                column: "schedule_id");

            migrationBuilder.CreateIndex(
                name: "ix_courses_category_id",
                table: "COURSES",
                column: "category_id");

            migrationBuilder.CreateIndex(
                name: "ix_email_verification_tokens_token",
                table: "EMAIL_VERIFICATION_TOKENS",
                column: "token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_email_verification_tokens_user_id",
                table: "EMAIL_VERIFICATION_TOKENS",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_enrollments_course_id",
                table: "ENROLLMENTS",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "ix_enrollments_program_id",
                table: "ENROLLMENTS",
                column: "program_id");

            migrationBuilder.CreateIndex(
                name: "ix_enrollments_schedule_id",
                table: "ENROLLMENTS",
                column: "schedule_id");

            migrationBuilder.CreateIndex(
                name: "UX_Enrollment_Application",
                table: "ENROLLMENTS",
                column: "application_id",
                unique: true,
                filter: "[application_id] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "UX_Enrollment_Course",
                table: "ENROLLMENTS",
                columns: new[] { "user_id", "course_id" },
                unique: true,
                filter: "[course_id] IS NOT NULL AND [schedule_id] IS NULL");

            migrationBuilder.CreateIndex(
                name: "UX_Enrollment_Program",
                table: "ENROLLMENTS",
                columns: new[] { "user_id", "program_id" },
                unique: true,
                filter: "[program_id] IS NOT NULL AND [schedule_id] IS NULL");

            migrationBuilder.CreateIndex(
                name: "UX_Enrollment_Schedule",
                table: "ENROLLMENTS",
                columns: new[] { "user_id", "schedule_id" },
                unique: true,
                filter: "[schedule_id] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "UX_Faq_Category_Order",
                table: "FAQS",
                columns: new[] { "category_id", "order_index" },
                unique: true,
                filter: "[category_id] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "UX_Faq_General_Order",
                table: "FAQS",
                column: "order_index",
                unique: true,
                filter: "[category_id] IS NULL");

            migrationBuilder.CreateIndex(
                name: "ix_instructor_payouts_instructor_id",
                table: "INSTRUCTOR_PAYOUTS",
                column: "instructor_id");

            migrationBuilder.CreateIndex(
                name: "ix_instructor_payouts_processed_by",
                table: "INSTRUCTOR_PAYOUTS",
                column: "processed_by");

            migrationBuilder.CreateIndex(
                name: "ix_instructor_payouts_schedule_id",
                table: "INSTRUCTOR_PAYOUTS",
                column: "schedule_id");

            migrationBuilder.CreateIndex(
                name: "ix_notifications_user_id",
                table: "NOTIFICATIONS",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_password_reset_tokens_token",
                table: "PASSWORD_RESET_TOKENS",
                column: "token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_password_reset_tokens_user_id",
                table: "PASSWORD_RESET_TOKENS",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_payments_application_id",
                table: "PAYMENTS",
                column: "application_id");

            migrationBuilder.CreateIndex(
                name: "ix_payments_enrollment_id",
                table: "PAYMENTS",
                column: "enrollment_id");

            migrationBuilder.CreateIndex(
                name: "ix_payments_transaction_ref",
                table: "PAYMENTS",
                column: "transaction_ref",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_payments_user_id",
                table: "PAYMENTS",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_permissions_code",
                table: "PERMISSIONS",
                column: "code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_program_courses_course_id",
                table: "PROGRAM_COURSES",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "ix_programs_career_path_id",
                table: "PROGRAMS",
                column: "career_path_id");

            migrationBuilder.CreateIndex(
                name: "ix_programs_category_id",
                table: "PROGRAMS",
                column: "category_id");

            migrationBuilder.CreateIndex(
                name: "ix_progress_enrollment_id",
                table: "PROGRESS",
                column: "enrollment_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_related_courses_related_course_id",
                table: "RELATED_COURSES",
                column: "related_course_id");

            migrationBuilder.CreateIndex(
                name: "ix_related_programs_related_program_id",
                table: "RELATED_PROGRAMS",
                column: "related_program_id");

            migrationBuilder.CreateIndex(
                name: "ix_role_permissions_permission_id",
                table: "ROLE_PERMISSIONS",
                column: "permission_id");

            migrationBuilder.CreateIndex(
                name: "ix_roles_name",
                table: "ROLES",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_schedule_instructors_instructor_id",
                table: "SCHEDULE_INSTRUCTORS",
                column: "instructor_id");

            migrationBuilder.CreateIndex(
                name: "ix_schedules_course_id",
                table: "SCHEDULES",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "ix_schedules_program_id",
                table: "SCHEDULES",
                column: "program_id");

            migrationBuilder.CreateIndex(
                name: "ix_sessions_schedule_id",
                table: "SESSIONS",
                column: "schedule_id");

            migrationBuilder.CreateIndex(
                name: "ix_user_roles_role_id",
                table: "USER_ROLES",
                column: "role_id");

            migrationBuilder.CreateIndex(
                name: "ix_users_email",
                table: "USERS",
                column: "email",
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
                name: "PARTNERS");

            migrationBuilder.DropTable(
                name: "PASSWORD_RESET_TOKENS");

            migrationBuilder.DropTable(
                name: "PAYMENTS");

            migrationBuilder.DropTable(
                name: "PROGRAM_COURSES");

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
