# Andalusia Academy

Learning-management platform for Andalusia Academy: a public catalog (career paths, programs, courses), applications and
payments, and role-based portals for learners, instructors, coordinators and admins.

| Part | Tech | Location |
|---|---|---|
| API | ASP.NET Core (net10.0), EF Core, SQL Server, JWT | this repository (`Andalusia.slnx`) |
| Web app | React + TypeScript (Vite) | the separate `src/` folder of the front-end project |

Layered solution:

```
Andalusia                  startup project (Program.cs, appsettings, launchSettings)
Andalusia.Presentation     API controllers
Andalusia.ServicesAbstraction   service interfaces
Andalusia.Services         business logic, specifications, e-mail (Brevo / MailKit)
Andalusia.Persistance      EF Core DbContext, configurations, migrations, seed data, repositories
Andalusia.Domain           entities, enums, repository/specification contracts
Andalusia.Shared           DTOs, authorization constants, Result / PaginatedResult
```

The database schema is documented in [`docs/ERD.md`](docs/ERD.md).

## 1. Run the API

Prerequisites: [.NET 10 SDK](https://dotnet.microsoft.com/download) and a SQL Server instance
(SQL Server Express or LocalDB is fine on Windows).

1. Check the connection string in `Andalusia/appsettings.json` (default: local SQL Server, database `LmsDb`, Windows auth):

   ```json
   "ConnectionStrings": { "Default": "Server=.;Database=LmsDb;Trusted_Connection=True;TrustServerCertificate=True" }
   ```

   Override it without editing the file with user-secrets or an environment variable
   (`ConnectionStrings__Default`).

2. Configure secrets (never commit them). Brevo e-mail is needed for OTP / confirmation e-mails; see
   [`Andalusia/BREVO_OTP_SETUP.md`](Andalusia/BREVO_OTP_SETUP.md). Optionally set `Jwt:Key`, `Jwt:Issuer`, `Jwt:Audience`
   (the app has development defaults, but use your own key outside local development):

   ```bash
   cd Andalusia
   dotnet user-secrets init
   dotnet user-secrets set "Brevo:UserName" "YOUR_BREVO_SMTP_LOGIN"
   dotnet user-secrets set "Brevo:Password" "YOUR_BREVO_SMTP_KEY"
   dotnet user-secrets set "Brevo:SenderEmail" "YOUR_VERIFIED_SENDER"
   dotnet user-secrets set "Jwt:Key" "A-LONG-RANDOM-STRING-OF-AT-LEAST-32-CHARACTERS"
   ```

3. Start the API:

   ```bash
   dotnet run --project Andalusia --launch-profile http
   ```

   On startup the app applies all EF migrations and runs the data seeder, so a fresh database is created and filled with
   demo data (categories, programs, courses, partners, users, ...). No manual `dotnet ef database update` is required.

4. Open Swagger (Development only): `http://localhost:5152/swagger` (the profile names and ports are in
   `Andalusia/Properties/launchSettings.json`; the `https` profile uses `https://localhost:7001`).

CORS allows the origins listed under `Cors:AllowedOrigins` in `appsettings.json` (`localhost:5173`, `5174`, `3000`).
Add your front-end origin there if it differs.

### Useful public endpoints

| Endpoint | Purpose |
|---|---|
| `GET /api/courses?search=&category=&sort=&page=&pageSize=` | Course catalog. `sort`: `title_asc`, `title_desc`, `price_asc`, `price_desc` (default: oldest first) |
| `GET /api/courses/featured?take=3` | Featured courses |
| `GET /api/courses/coming-soon?take=3` | Courses with a scheduled cohort starting soon |
| `GET /api/programs?search=&category=&sort=&page=&pageSize=` | Program catalog (same `sort` values) |
| `GET /api/programs/categories/popular?take=6` | Popular categories (trending first) |
| `GET /api/partners?type=Accreditation` or `type=Success_Partner` | Accreditations and partners |
| `GET /api/career-paths/{slug}` | Career path detail incl. `recommendedSkills` and `relatedCourses` |

### Migrations

```bash
dotnet ef migrations add <Name> --project Andalusia.Persistance --startup-project Andalusia
dotnet ef database update      --project Andalusia.Persistance --startup-project Andalusia
```

## 2. Run the web app

Prerequisites: Node.js 20+ and npm.

1. From the front-end project root (the folder that contains `package.json` and `src/`):

   ```bash
   npm install
   ```

2. Point the app at the API with a `.env.local` file (default if omitted: `https://localhost:7001`):

   ```env
   VITE_API_URL=http://localhost:5152
   # optional feature flags (see src/utils/features.ts)
   # VITE_ENABLE_LOGIN_OTP=true
   # VITE_USE_LOCAL_IMAGES=true
   ```

3. Start the dev server and open the printed URL (normally `http://localhost:5173`):

   ```bash
   npm run dev
   ```

Start the API first; the landing page, catalog and portals all read from it.

## 3. Project conventions

- Public catalog queries use the specification pattern (`Andalusia.Services/Specification`); add new filters/sorting there.
- Controllers stay thin and call a service from `Andalusia.ServicesAbstraction`; register new services in `Andalusia/Program.cs`.
- Front-end data hooks live in `src/hooks/academyHooks`, DTO types in `src/Types/AcademyApi.ts`, and DTO-to-view mapping in
  `src/apis/mappers.ts`.
