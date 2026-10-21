
using Andalusia.Services;
using Andalusia.ServicesAbstraction;
using Andalusia.Domain.Contracts;
using Andalusia.Persistance.Data.DataSeed;
using Andalusia.Persistance.Repositories;
using Andalusia.Shared.Authorization;
using AndalusiaApp.Data;
using AndalusiaApp.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// ==========================================
// 1. Database
// ==========================================
var connectionString = builder.Configuration.GetConnectionString("Default");
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "Connection string 'Default' is missing or empty. Set ConnectionStrings:Default in appsettings.");
}

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlServer(connectionString, sql => sql.EnableRetryOnFailure());

    if (builder.Environment.IsDevelopment())
    {
        options.EnableDetailedErrors();
        options.EnableSensitiveDataLogging();
    }
});

// ==========================================
// 2. Dependency Injection
// ==========================================
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IDataInitializer, DataInitializer>();
builder.Services.AddScoped<ICourseService, CourseService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserAdminService, UserAdminService>();

// Email / OTP via Brevo SMTP (MailKit) - reads Brevo:Host/Port/UserName/Password/SenderEmail
builder.Services.AddScoped<IEmailService, MailKitEmailService>();

// Rate limiting for /api/auth (protects OTP endpoints from brute force)
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("auth", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));
});
builder.Services.AddScoped<IProgramService, ProgramService>();
builder.Services.AddScoped<ICareerPathService, CareerPathService>();
builder.Services.AddScoped<
    IPortalRecordsService,
    PortalRecordsService>();
builder.Services.AddSingleton<ITokenBlacklist, InMemoryTokenBlacklist>();
builder.Services.AddScoped<IProfileService, ProfileService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<ILearnerDashboardService, LearnerDashboardService>();

builder.Services.AddScoped<IStaffWorkspaceService, StaffWorkspaceService>();
builder.Services.AddScoped<IStaffSessionService, StaffSessionService>();
builder.Services.AddScoped<IStaffContentService, StaffContentService>();
builder.Services.AddScoped<IStaffStudentService, StaffStudentService>();
builder.Services.AddScoped<IInstructorAdminService, InstructorAdminService>();
builder.Services.AddScoped<IScheduleAdminService, ScheduleAdminService>();
builder.Services.AddScoped<IPaymentAdminService, PaymentAdminService>();
builder.Services.AddScoped<IAdminReportsService, AdminReportsService>();
builder.Services.AddScoped<IRolePermissionAdminService, RolePermissionAdminService>();

// ==========================================
// 3. Authentication & JWT
// ==========================================
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? "AndalusiaSuperSecretKey2026SecureKeyWith32CharsMinimum!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "AndalusiaApp";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "AndalusiaClients";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };

    options.Events = new JwtBearerEvents
    {
        OnTokenValidated = async context =>
        {
            // 1) Logout support: reject tokens whose jti was revoked.
            var blacklist = context.HttpContext.RequestServices.GetRequiredService<ITokenBlacklist>();
            var jti = context.SecurityToken?.Id;
            if (!string.IsNullOrEmpty(jti) && blacklist.IsRevoked(jti))
            {
                context.Fail("This token has been revoked (logged out).");
                return;
            }

            // 2) Re-check the account against the DB on every request, so deactivating a user or
            //    changing their role takes effect immediately instead of when the 7-day token expires.
            var subject = context.Principal?.FindFirstValue(ClaimTypes.NameIdentifier)
                          ?? context.Principal?.FindFirstValue("sub");
            if (!long.TryParse(subject, out var userId))
            {
                context.Fail("Invalid token subject.");
                return;
            }

            var db = context.HttpContext.RequestServices.GetRequiredService<AppDbContext>();
            var current = await db.UserRoles
                .AsNoTracking()
                .Where(ur => ur.UserId == userId)
                .Select(ur => new { ur.User.IsActive, RoleName = ur.Role.Name })
                .FirstOrDefaultAsync();

            var tokenRole = context.Principal?.FindFirstValue(ClaimTypes.Role);
            if (current is null || !current.IsActive || current.RoleName != tokenRole)
                context.Fail("Your account or role has changed. Please sign in again.");
        }
    };
});

// One policy per permission code: [Authorize(Policy = AppPermissions.AttendanceManage)].
// Permissions travel in the JWT as "permission" claims (see TokenService).
builder.Services.AddAuthorization(options =>
{
    foreach (var code in AppPermissions.All)
        options.AddPolicy(code, policy => policy.RequireClaim(AppClaimTypes.Permission, code));
});

// ==========================================
// 4. Controllers & JSON
// ==========================================
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

builder.Services.AddProblemDetails();
builder.Services.AddHealthChecks();

// ==========================================
// 5. Swagger with JWT Support (Fix)
// ==========================================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Andalusia API",
        Version = "v1",
        Description = "Andalusia Learning Management & Cohort API"
    });

    c.CustomSchemaIds(t => t.FullName?.Replace("+", "."));

    // 1. تعريف الـ Bearer Token مرة واحدة فقط وبشكل قياسي
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "Enter your JWT token"
    });

    c.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("Bearer", document)] = new List<string>()
    });
});


// ==========================================
// 6. CORS
// ==========================================
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:5173", "http://localhost:3000"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy => policy
        .WithOrigins(allowedOrigins)
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
});

var app = builder.Build();

// ==========================================
// 7. Migrations & Seeding
// ==========================================
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();

    try
    {
        var db = services.GetRequiredService<AppDbContext>();
        await db.Database.MigrateAsync();

        var initializer = services.GetRequiredService<IDataInitializer>();
        await initializer.InitializeAsync();
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Database migration/seeding failed on startup.");
    }
}

// ==========================================
// 8. Middleware Pipeline
// ==========================================
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler();
    app.UseHsts();
}

if (app.Environment.IsDevelopment() || app.Configuration.GetValue<bool>("Swagger:Enabled"))
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Andalusia API v1"));
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");

app.Run();