using System.Globalization;
using Andalusia.Domain.Contracts;
using Andalusia.Domain.Enums;
using Andalusia.Domain.Models;
using Andalusia.Shared.Authorization;
using AndalusiaApp.Data;
using AndalusiaApp.Models;
using Microsoft.EntityFrameworkCore;
using ProgramEntity = AndalusiaApp.Models.Program;

namespace Andalusia.Persistance.Data.DataSeed;


public class DataInitializer : IDataInitializer
{
    private readonly AppDbContext _db;

    public DataInitializer(AppDbContext db)
    {
        _db = db;
    }

    private static DateOnly Today => DateOnly.FromDateTime(DateTime.UtcNow);

    public async Task InitializeAsync()
    {
        await SeedPermissionsAsync();
        await SeedCatalogAsync();

        // Demo accounts only in Development (never ship default passwords to production)
        var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
        if (string.Equals(env, "Development", StringComparison.OrdinalIgnoreCase))
        {
            await SeedDemoUsersAsync();
            await SeedDemoPortalRecordsAsync();
            await SeedDemoTeachingAsync();          // the demo instructor teaches the learner's program batch
            await SeedDemoLearnerWorkspaceAsync();  // sessions, assignments, materials, messages for the student dashboard
            await SeedLandingContentAsync();
        }
    }

    // =====================================================================
    // 1) Permissions + role mapping
    // =====================================================================
    private async Task SeedPermissionsAsync()
    {
        // Idempotent: adds permissions / role links that are missing, never removes existing ones,
        // so new permissions reach databases that were seeded in an earlier sprint.
        var permissions = await _db.Permissions.ToDictionaryAsync(p => p.Code);

        // Default grants are applied ONLY to permissions created in this run. Re-adding grants for existing
        // permissions on every startup would silently undo changes made through PUT /api/admin/roles/{id}/permissions.
        var newlyCreated = new HashSet<string>();

        foreach (var (code, description) in AppPermissions.Catalog)
        {
            if (permissions.ContainsKey(code)) continue;

            var permission = new Permission { Code = code, Description = description };
            _db.Permissions.Add(permission);
            permissions[code] = permission;
            newlyCreated.Add(code);
        }
        await _db.SaveChangesAsync();

        var roles = await _db.Roles.ToDictionaryAsync(r => r.Name);
        var newlyCreatedRoles = new HashSet<string>();
        foreach (var roleName in AppRoles.All)
        {
            if (roles.ContainsKey(roleName)) continue;
            var role = new Role { Name = roleName };
            _db.Roles.Add(role);
            roles[roleName] = role;
            newlyCreatedRoles.Add(roleName);
        }
        if (newlyCreatedRoles.Count > 0) await _db.SaveChangesAsync();

        var existingLinks = (await _db.RolePermissions
                .Select(rp => new { rp.RoleId, rp.PermissionId })
                .ToListAsync())
            .Select(l => (l.RoleId, l.PermissionId))
            .ToHashSet();

        foreach (var (roleName, codes) in AppPermissions.RoleGrants)
        {
            if (!roles.TryGetValue(roleName, out var role)) continue;

            foreach (var code in codes)
            {
                // Preserve existing administrator-edited grants. For a newly-created role,
                // seed its complete default matrix even when the permission already existed.
                if (!newlyCreatedRoles.Contains(roleName) && !newlyCreated.Contains(code)) continue;

                var permissionId = permissions[code].PermissionId;
                if (existingLinks.Add((role.RoleId, permissionId)))
                {
                    _db.RolePermissions.Add(new RolePermission
                    {
                        RoleId = role.RoleId,
                        PermissionId = permissionId
                    });
                }
            }
        }

        await _db.SaveChangesAsync();
    }

    // =====================================================================
    // 2) Catalog: categories, career paths, programs, courses, partners ...
    // =====================================================================
    private async Task SeedCatalogAsync()
    {
        if (await _db.Categories.AnyAsync()) return;

        // ---------- Categories ----------
        var ai = new Category { Name = "Executive AI", Slug = "executive-ai", IsTrending = true };
        var fintech = new Category { Name = "FinTech", Slug = "fintech", IsTrending = true };
        var product = new Category { Name = "Product & Tech", Slug = "product-tech", IsTrending = false };
        var labs = new Category { Name = "Offline Labs", Slug = "offline-labs", IsTrending = false };

        // ---------- Mentors ----------
        var nadia = new Mentor
        {
            Name = "Dr. Nadia Fawzy",
            Title = "Head of Applied AI, Banking Sector",
            Bio = "Leads enterprise AI programs for retail and corporate banks. Twelve years of experience taking machine learning from pilot to production inside regulated institutions."
        };
        var karim = new Mentor
        {
            Name = "Karim Soliman",
            Title = "Principal Cloud Architect",
            Bio = "Designs cloud platforms for payment providers and digital banks. Certified across the major cloud vendors and a regular speaker at regional fintech events."
        };
        var mona = new Mentor
        {
            Name = "Mona El-Sayed",
            Title = "Director of Payments & Fraud Risk",
            Bio = "Built fraud detection and dispute handling operations processing millions of card transactions a month."
        };
        var omar = new Mentor
        {
            Name = "Omar Hassan",
            Title = "VP Product, Digital Services",
            Bio = "Has shipped consumer and B2B products across MENA. Coaches product teams on discovery, prioritisation and measurable delivery."
        };
        var laila = new Mentor
        {
            Name = "Laila Ibrahim",
            Title = "AI Governance & Risk Advisor",
            Bio = "Advises boards and compliance teams on AI risk, model validation and responsible-use policies."
        };

        // ---------- Career paths ----------
        var fintechCloud = new CareerPath
        {
            Slug = "fintech-cloud",
            Title = "FinTech & Cloud Engineering Path",
            Status = "Enrolling",
            Overview = "A guided route from digital banking fundamentals to building secure, cloud-native financial platforms. Designed for professionals moving into fintech technology or product roles.",
            RecommendedSkills = "Digital Banking Lead, Cloud Solutions Architect, FinTech Platform Engineer, Open Banking Product Owner",
            LearningJourney = "Foundations of digital banking and payments\nOpen banking APIs and integration patterns\nCloud architecture for regulated workloads\nSecurity, compliance and DevSecOps practice\nCapstone project reviewed by industry mentors"
        };
        var execAi = new CareerPath
        {
            Slug = "executive-ai-leadership",
            Title = "Executive AI Leadership Path",
            Status = "Enrolling",
            Overview = "For directors and senior managers who need to set AI strategy, evaluate vendors and govern AI use responsibly across the organisation.",
            RecommendedSkills = "Chief AI Officer, Head of Digital Transformation, AI Program Director, Innovation Manager",
            LearningJourney = "AI strategy and business case building\nGenerative AI use cases in your industry\nResponsible AI, governance and risk\nHands-on studio with real data and tooling\nBoard-ready roadmap presentation"
        };
        var productPath = new CareerPath
        {
            Slug = "product-leadership",
            Title = "Product Leadership Path",
            Status = "Upcoming",
            Overview = "Build the discovery, delivery and measurement skills needed to lead digital products from idea to scale.",
            RecommendedSkills = "Product Manager, Senior Product Owner, Head of Product, Delivery Lead",
            LearningJourney = "Customer discovery and problem framing\nRoadmaps, prioritisation and stakeholder alignment\nAgile delivery and product metrics\nPortfolio of product artefacts for interviews"
        };

        // ---------- Programs ----------
        var digitalBanking = new ProgramEntity
        {
            Slug = "digital-banking",
            Title = "Digital Banking Transformation",
            Category = fintech,
            CareerPath = fintechCloud,
            Status = ProgramStatus.Active,
            Duration = "6 Months",
            Price = 48000m,
            Overview = "A blended program that takes banking and fintech professionals through the full digital banking stack: customer journeys, open banking, payments, risk and applied AI. Weekly offline studios at the Alexandria campus.",
            Requirements = "Bachelor's degree or equivalent professional experience\n2+ years in banking, fintech or technology\nLaptop for in-studio labs",
            Structure = "Weekly offline studio sessions on campus\nThree industry-certified courses\nMentor-reviewed capstone project\nCertificate on successful completion"
        };
        var cloudFintech = new ProgramEntity
        {
            Slug = "cloud-fintech-engineering",
            Title = "Cloud FinTech Engineering",
            Category = fintech,
            CareerPath = fintechCloud,
            Status = ProgramStatus.Active,
            Duration = "4 Months",
            Price = 36000m,
            Overview = "Hands-on engineering program covering secure cloud architecture and DevSecOps for regulated financial systems.",
            Requirements = "Working knowledge of a programming language\nBasic networking and Linux familiarity",
            Structure = "Two practical courses with lab environments\nCloud sandbox credits included\nFinal architecture review with mentors"
        };
        var aiLeadership = new ProgramEntity
        {
            Slug = "executive-ai-strategy",
            Title = "Executive AI Strategy Program",
            Category = ai,
            CareerPath = execAi,
            Status = ProgramStatus.Active,
            Duration = "3 Months",
            Price = 42000m,
            Overview = "Executive-level program on building AI strategy, assessing use cases and governing AI responsibly. Evening cohorts designed around working schedules.",
            Requirements = "Senior or managerial role\nNo coding background required",
            Structure = "Evening offline cohorts\nCase-based learning from regional organisations\nBoard-ready AI roadmap as final deliverable"
        };
        var productProgram = new ProgramEntity
        {
            Slug = "product-management-essentials",
            Title = "Product Management Essentials",
            Category = product,
            CareerPath = productPath,
            Status = ProgramStatus.Active,
            Duration = "10 Weeks",
            Price = 24000m,
            Overview = "Learn how modern product teams discover problems, prioritise work and measure outcomes.",
            Requirements = "No prior product experience required\nComfort working in cross-functional teams",
            Structure = "Weekend studios\nReal product brief from a partner company\nPortfolio review session"
        };
        var aiStudio = new ProgramEntity
        {
            Slug = "applied-ai-studio",
            Title = "Applied AI Studio",
            Category = labs,
            CareerPath = execAi,
            Status = ProgramStatus.Active,
            Duration = "8 Weeks",
            Price = 30000m,
            Overview = "A lab-first program where teams build and evaluate working LLM prototypes on real business data.",
            Requirements = "Basic Python or scripting experience\nBring a real business problem to work on",
            Structure = "Small-group lab sessions on campus\nGPU-enabled workstations provided\nDemo day with industry guests"
        };

        // ---------- Courses ----------
        var courses = new List<Course>
        {
            NewCourse("generative-ai-banking", "Generative AI for Banking Leaders",
                "Learn where generative AI creates measurable value in banking, from customer service to compliance operations, and how to launch pilots safely.",
                "Executive AI", "6 Weeks", "Executive Advanced", 16000m, nadia, digitalBanking, fintechCloud,
                featured: true, startInDays: 28, capacity: 24, enrolled: 17,
                outcomes: new[]
                {
                    ("Spot high-value use cases", "Evaluate and rank generative AI opportunities across banking functions."),
                    ("Design safe pilots", "Plan pilots with data, security and model-risk controls from day one."),
                    ("Build the business case", "Estimate cost, benefit and risk in a format your executive committee expects."),
                },
                bullets: new[] { "Offline cohort at Alexandria Campus", "Pearson & CPD accredited certificate", "Mentor-reviewed pilot proposal", "Lifetime access to course materials" }),

            NewCourse("open-banking-apis", "Open Banking APIs in Practice",
                "Understand open banking models, consent flows and API design, then build an integration against a sandbox.",
                "FinTech", "5 Weeks", "Professional", 12000m, karim, digitalBanking, fintechCloud,
                false, 35, 20, 9,
                new[]
                {
                    ("Model open banking ecosystems", "Map the roles of banks, TPPs and regulators."),
                    ("Design secure APIs", "Apply authentication, consent and rate-limiting patterns."),
                    ("Integrate with a sandbox", "Build and test a working account-information flow."),
                },
                new[] { "Hands-on sandbox labs", "Pearson & CPD accredited certificate", "Small cohort of 20" }),

            NewCourse("payments-fraud-risk", "Payments, Fraud & Risk Operations",
                "Follow a card transaction end to end and learn how fraud controls, disputes and chargebacks work in practice.",
                "FinTech", "4 Weeks", "Professional", 11000m, mona, digitalBanking, fintechCloud,
                false, 42, 24, 6,
                new[]
                {
                    ("Understand payment flows", "Trace authorisation, clearing and settlement."),
                    ("Detect and respond to fraud", "Use rules and scoring to reduce losses without hurting approval rates."),
                    ("Run dispute operations", "Handle chargebacks within scheme timelines."),
                },
                new[] { "Real anonymised case studies", "Pearson & CPD accredited certificate" }),

            NewCourse("cloud-architecture-fintech", "Cloud Architecture for FinTech",
                "Design resilient, compliant cloud platforms for payments and banking workloads.",
                "FinTech", "6 Weeks", "Professional Advanced", 15000m, karim, cloudFintech, fintechCloud,
                false, 30, 20, 12,
                new[]
                {
                    ("Design landing zones", "Create multi-account foundations with guardrails."),
                    ("Plan for resilience", "Build for availability targets and disaster recovery."),
                    ("Meet compliance needs", "Map controls to common financial regulations."),
                },
                new[] { "Cloud sandbox credits included", "Architecture review with mentor" }),

            NewCourse("devsecops-regulated-systems", "DevSecOps for Regulated Systems",
                "Embed security testing, secrets management and audit evidence into delivery pipelines.",
                "FinTech", "5 Weeks", "Professional Advanced", 13000m, karim, cloudFintech, fintechCloud,
                false, 49, 20, 4,
                new[]
                {
                    ("Secure the pipeline", "Add SAST, dependency and container scanning."),
                    ("Manage secrets and access", "Apply least privilege and rotation."),
                    ("Produce audit evidence", "Automate evidence collection for reviews."),
                },
                new[] { "Lab environments provided", "Small cohort of 20" }),

            NewCourse("ai-strategy-for-executives", "AI Strategy for Executives",
                "Build a practical AI roadmap: where to start, what to buy or build, and how to measure results.",
                "Executive AI", "4 Weeks", "Executive Advanced", 14000m, nadia, aiLeadership, execAi,
                true, 21, 24, 21,
                new[]
                {
                    ("Frame the AI opportunity", "Connect AI capabilities to strategic priorities."),
                    ("Choose build, buy or partner", "Evaluate vendors and internal capability."),
                    ("Track value", "Define KPIs and governance cadence."),
                },
                new[] { "Evening cohort", "Pearson & CPD accredited certificate", "Board-ready roadmap template" }),

            NewCourse("responsible-ai-governance", "Responsible AI & Governance",
                "Create policies, review processes and monitoring for AI systems that meet regulatory and ethical expectations.",
                "Executive AI", "3 Weeks", "Executive", 9000m, laila, aiLeadership, execAi,
                false, 56, 30, 8,
                new[]
                {
                    ("Assess AI risk", "Classify use cases by impact and risk."),
                    ("Write usable policy", "Draft policies teams will follow."),
                    ("Monitor in production", "Set up ongoing validation and incident handling."),
                },
                new[] { "Policy templates included", "Pearson & CPD accredited certificate" }),

            NewCourse("product-discovery-bootcamp", "Product Discovery Bootcamp",
                "Learn to find the right problem before building: interviews, opportunity mapping and rapid experiments.",
                "Product & Tech", "4 Weeks", "Foundation", 8000m, omar, productProgram, productPath,
                true, 32, 30, 11,
                new[]
                {
                    ("Interview customers well", "Run and synthesise discovery interviews."),
                    ("Map opportunities", "Prioritise problems worth solving."),
                    ("Test assumptions fast", "Design lightweight experiments."),
                },
                new[] { "Weekend studio format", "Portfolio-ready artefacts" }),

            NewCourse("agile-delivery-metrics", "Agile Delivery & Product Metrics",
                "Plan sprints, manage stakeholders and track the metrics that show whether a product is working.",
                "Product & Tech", "4 Weeks", "Foundation", 8000m, omar, productProgram, productPath,
                false, 63, 30, 3,
                new[]
                {
                    ("Run effective sprints", "Plan, review and improve with your team."),
                    ("Choose the right metrics", "Separate vanity metrics from outcome metrics."),
                    ("Communicate progress", "Report status that stakeholders trust."),
                },
                new[] { "Weekend studio format", "Real product brief from a partner" }),

            NewCourse("applied-llm-studio", "Applied LLM Studio",
                "Build, evaluate and demo a working LLM prototype on your own business problem.",
                "Offline Labs", "8 Weeks", "Professional Advanced", 20000m, nadia, aiStudio, execAi,
                false, 38, 16, 10,
                new[]
                {
                    ("Prototype with LLMs", "Build retrieval-augmented and agent-style workflows."),
                    ("Evaluate quality", "Create test sets and measure accuracy and safety."),
                    ("Demo with confidence", "Present results and trade-offs to stakeholders."),
                },
                new[] { "GPU workstations provided", "Small cohort of 16", "Demo day with industry guests" },
                hall: "Lab A-105, Alexandria Campus"),
        };

        Course C(string slug) => courses.First(c => c.Slug == slug);

        // ---------- Program <-> Course ordering ----------
        var programCourses = new List<ProgramCourse>
        {
            new() { Program = digitalBanking, Course = C("generative-ai-banking"), OrderIndex = 1 },
            new() { Program = digitalBanking, Course = C("open-banking-apis"), OrderIndex = 2 },
            new() { Program = digitalBanking, Course = C("payments-fraud-risk"), OrderIndex = 3 },
            new() { Program = cloudFintech, Course = C("cloud-architecture-fintech"), OrderIndex = 1 },
            new() { Program = cloudFintech, Course = C("devsecops-regulated-systems"), OrderIndex = 2 },
            new() { Program = aiLeadership, Course = C("ai-strategy-for-executives"), OrderIndex = 1 },
            new() { Program = aiLeadership, Course = C("responsible-ai-governance"), OrderIndex = 2 },
            new() { Program = productProgram, Course = C("product-discovery-bootcamp"), OrderIndex = 1 },
            new() { Program = productProgram, Course = C("agile-delivery-metrics"), OrderIndex = 2 },
            new() { Program = aiStudio, Course = C("applied-llm-studio"), OrderIndex = 1 },
        };

        // ---------- Related programs / courses ----------
        var relatedPrograms = new List<RelatedProgram>
        {
            new() { Program = digitalBanking, Related = cloudFintech },
            new() { Program = cloudFintech, Related = digitalBanking },
            new() { Program = aiLeadership, Related = aiStudio },
            new() { Program = aiStudio, Related = aiLeadership },
            new() { Program = productProgram, Related = aiLeadership },
        };
        var relatedCourses = new List<RelatedCourse>
        {
            new() { Course = C("generative-ai-banking"), Related = C("ai-strategy-for-executives") },
            new() { Course = C("ai-strategy-for-executives"), Related = C("generative-ai-banking") },
            new() { Course = C("open-banking-apis"), Related = C("payments-fraud-risk") },
            new() { Course = C("payments-fraud-risk"), Related = C("open-banking-apis") },
            new() { Course = C("product-discovery-bootcamp"), Related = C("agile-delivery-metrics") },
            new() { Course = C("agile-delivery-metrics"), Related = C("product-discovery-bootcamp") },
        };

        // ---------- Schedules (shown as "next cohort" on program pages) ----------
        var schedules = new List<Schedule>
        {
            NewSchedule(digitalBanking, "DBT-2026-A", "Hall B-302", 35, 180, 30),
            NewSchedule(cloudFintech, "CFE-2026-A", "Lab A-201", 42, 160, 24),
            NewSchedule(aiLeadership, "EAS-2026-A", "Hall B-101", 21, 105, 30),
            NewSchedule(productProgram, "PME-2026-A", "Hall C-204", 30, 100, 30),
            NewSchedule(aiStudio, "AAS-2026-A", "Lab A-105", 38, 95, 16),
        };

        // ---------- Partners & accreditation ----------
        var pearson = new Partner { Name = "Pearson", LogoUrl = "/partners/pearson.svg", Type = PartnerType.Accreditation };
        var cpd = new Partner { Name = "CPD Certification Service", LogoUrl = "/partners/cpd.svg", Type = PartnerType.Accreditation };
        var deltaCapital = new Partner { Name = "Delta Capital Group", LogoUrl = "/partners/delta-capital.svg", Type = PartnerType.Success_Partner };
        var nileDigital = new Partner { Name = "Nile Digital Bank", LogoUrl = "/partners/nile-digital.svg", Type = PartnerType.Success_Partner };

        var programPartners = new List<ProgramPartner>();
        foreach (var p in new[] { digitalBanking, cloudFintech, aiLeadership, productProgram, aiStudio })
        {
            programPartners.Add(new ProgramPartner { Program = p, Partner = pearson, AccreditationDetails = "Pearson-certified assessment" });
            programPartners.Add(new ProgramPartner { Program = p, Partner = cpd, AccreditationDetails = "CPD-accredited learning hours" });
        }
        programPartners.Add(new ProgramPartner { Program = digitalBanking, Partner = nileDigital, AccreditationDetails = "Hiring partner" });
        programPartners.Add(new ProgramPartner { Program = aiLeadership, Partner = deltaCapital, AccreditationDetails = "Hiring partner" });

        // ---------- FAQs (OrderIndex must be unique per category) ----------
        var faqs = new List<Faq>
        {
            new() { Question = "Where do the cohorts take place?", Answer = "Offline cohorts run at our Alexandria campus. Room details are listed on each course page.", OrderIndex = 1 },
            new() { Question = "Are the certificates accredited?", Answer = "Courses carry Pearson and CPD accreditation as shown on each program page.", OrderIndex = 2 },
            new() { Question = "Can I pay in installments?", Answer = "Yes. Contact admissions to arrange an installment plan before your cohort starts.", OrderIndex = 3 },
            new() { Question = "What happens if a cohort is full?", Answer = "You can join the waitlist or choose the next available start date.", OrderIndex = 4 },
            new() { Category = ai, Question = "Do I need a technical background for Executive AI courses?", Answer = "No. These courses are designed for leaders and focus on strategy and governance.", OrderIndex = 1 },
            new() { Category = ai, Question = "Will I work with real tools?", Answer = "Studio sessions include hands-on work with current AI tooling.", OrderIndex = 2 },
            new() { Category = fintech, Question = "Is prior banking experience required?", Answer = "Two or more years in banking, fintech or technology is recommended.", OrderIndex = 1 },
            new() { Category = fintech, Question = "Are lab environments provided?", Answer = "Yes. Sandbox and cloud lab environments are provided for practical courses.", OrderIndex = 2 },
        };

        // ---------- Testimonials ----------
        var testimonials = new List<Testimonial>
        {
            new()
            {
                ClientName = "Sara Mahmoud", TitleOrRole = "Digital Channels Manager", Course = C("generative-ai-banking"),
                QuoteText = "The pilot proposal I built in class went to my executive committee the following month.",
                AvatarUrl = "", IsFeatured = true
            },
            new()
            {
                ClientName = "Ahmed Tarek", TitleOrRole = "Solutions Architect", Course = C("cloud-architecture-fintech"),
                QuoteText = "Practical labs and mentor feedback on our architecture were the most valuable parts.",
                AvatarUrl = "", IsFeatured = true
            },
            new()
            {
                ClientName = "Hana Adel", TitleOrRole = "Product Owner", Course = C("product-discovery-bootcamp"),
                QuoteText = "I left with real artefacts for my portfolio and a clear way to run discovery with my team.",
                AvatarUrl = "", IsFeatured = true
            },
        };

        _db.Categories.AddRange(ai, fintech, product, labs);
        _db.CareerPaths.AddRange(fintechCloud, execAi, productPath);
        _db.Programs.AddRange(digitalBanking, cloudFintech, aiLeadership, productProgram, aiStudio);
        _db.Courses.AddRange(courses);
        _db.ProgramCourses.AddRange(programCourses);
        _db.RelatedPrograms.AddRange(relatedPrograms);
        _db.RelatedCourses.AddRange(relatedCourses);
        _db.Schedules.AddRange(schedules);
        _db.Partners.AddRange(pearson, cpd, deltaCapital, nileDigital);
        _db.ProgramPartners.AddRange(programPartners);
        _db.Faqs.AddRange(faqs);
        _db.Testimonials.AddRange(testimonials);

        await _db.SaveChangesAsync();
    }

    // =====================================================================
    // 2b) Landing-page demo content: testimonials (with ratings) + FAQs (Development only)
    // =====================================================================
    private async Task SeedLandingContentAsync()
    {
        await SeedLandingTestimonialsAsync();
        await SeedLandingFaqsAsync();
    }

    private async Task SeedLandingTestimonialsAsync()
    {
        // Sentinel: the landing-page set is added once.
        if (await _db.Testimonials.AnyAsync(t => t.ClientName == "Eng. Omar Farouk")) return;

        var courseIds = await _db.Courses.ToDictionaryAsync(c => c.Slug, c => c.CourseId);
        long? CourseIdOf(string slug) => courseIds.TryGetValue(slug, out var id) ? id : (long?)null;

        // Not featured: they only feed the rating summary / admin list. Inserted first so the featured
        // set below is the newest (GET /api/testimonials?featured=true&take=4 returns newest first).
        var extras = new (string Name, string Role, string Quote, int Rating, string Course)[]
        {
            ("Mariam Hassan", "Operations Analyst",
                "Clear structure and patient mentors. I would have liked more evening cohort options, but the content was excellent.",
                4, "payments-fraud-risk"),
            ("Tamer Ghoneim", "Head of Digital Products",
                "The metrics workshop changed how my team reports delivery. We dropped three vanity dashboards the week after.",
                5, "agile-delivery-metrics"),
            ("Salma Reda", "Data Analyst",
                "Good balance of theory and practice. The lab sessions were the highlight for me.",
                4, "open-banking-apis"),
            ("Youssef Nabil", "IT Project Manager",
                "Good instructors and useful material. The schedule changed twice, which made planning harder.",
                3, "ai-strategy-for-executives"),
        };

        // The four cards on the landing page (same copy the page showed before it was wired to the API).
        var landing = new (string Name, string Role, string Quote, int Rating, string Course)[]
        {
            ("Eng. Omar Farouk", "FinTech & Payment Architecture",
                "The in-person architecture sprint sessions at Gleem Campus are unlike any online course. We designed real fault-tolerant microservices under intense regulatory constraints.",
                5, "cloud-architecture-fintech"),
            ("Yasmine El-Sayed", "Enterprise Generative AI & LLMs",
                "Having my capstone vetted by senior industry leaders gave me the direct confidence to transition our firm to enterprise LLM pipelines with strict data governance.",
                5, "generative-ai-banking"),
            ("Karim Mostafa", "Cloud & Zero Trust Architecture",
                "The Pearson dual accreditation seal is genuinely recognized internationally. It immediately opened doors for our cloud consulting contracts across the Gulf region.",
                5, "open-banking-apis"),
            ("Nourhan Adel", "Executive Full Stack Engineering",
                "Small cohort sizes mean genuine 1-on-1 feedback on real distributed codebase implementations. A world-class learning experience right here in Alexandria.",
                5, "product-discovery-bootcamp"),
        };

        _db.Testimonials.AddRange(extras.Select(x => NewTestimonial(x, featured: false, CourseIdOf)));
        _db.Testimonials.AddRange(landing.Select(x => NewTestimonial(x, featured: true, CourseIdOf)));
        await _db.SaveChangesAsync();

        static Testimonial NewTestimonial(
            (string Name, string Role, string Quote, int Rating, string Course) x,
            bool featured,
            Func<string, long?> courseIdOf) => new()
            {
                ClientName = x.Name,
                TitleOrRole = x.Role,
                QuoteText = x.Quote,
                AvatarUrl = "",
                Rating = x.Rating,
                IsFeatured = featured,
                CourseId = courseIdOf(x.Course)
            };
    }

    private async Task SeedLandingFaqsAsync()
    {
        // **double asterisks** mark bold text; the frontend renders them as <strong>.
        var items = new (string Question, string Answer)[]
        {
            ("How can I apply for a program?",
                "You can submit your application directly using the **Request Admission Interview** form below. Once reviewed, our admissions committee reaches out within 2 business days to schedule an interview with an academic lead."),
            ("Are the programs online or offline?",
                "All executive diplomas are delivered in an intensive **blended executive format**. Core architectural theory is accompanied by mandatory hands-on cohort sessions hosted physically at the **Alexandria Executive Campus (Gleem District)** on evenings and weekends."),
            ("What are the admission requirements?",
                "Most executive tracks require a minimum of 1–3 years of hands-on software, data, or product management background. Because seats are limited to a **1:12 mentor-to-learner ratio**, selection evaluates prior experience and portfolio readiness."),
            ("Will I receive a certificate after completing a program?",
                "Yes. Successful candidates receive a verified **Dual Credential**: an accredited Andalusia Academy Executive Diploma together with an internationally recognized **Pearson Assured & CPD Standards UK** transcript badge."),
            ("How can I track my application status?",
                "Upon submitting your application, you will receive an acknowledgment email with a tracking reference number. You may also contact our admissions desk via WhatsApp or email directly with your applicant reference ID."),
        };

        // Sentinel: the landing-page set is added once.
        var sentinel = items[0].Question;
        if (await _db.Faqs.AnyAsync(f => f.Question == sentinel)) return;

        // OrderIndex is unique among general FAQs. Push the existing ones below the new set
        // (two phases so the unique index is never hit half-way through the update).
        var general = await _db.Faqs.Where(f => f.CategoryId == null).ToListAsync();
        if (general.Count > 0)
        {
            foreach (var f in general) f.OrderIndex += 1000;
            await _db.SaveChangesAsync();
            foreach (var f in general) f.OrderIndex = f.OrderIndex - 1000 + items.Length;
            await _db.SaveChangesAsync();
        }

        _db.Faqs.AddRange(items.Select((x, i) => new Faq
        {
            Question = x.Question,
            Answer = x.Answer,
            OrderIndex = i + 1,
            IsActive = true
        }));
        await _db.SaveChangesAsync();
    }

    // =====================================================================
    // 3) Demo users (Development only)
    // =====================================================================
    private async Task SeedDemoUsersAsync()
    {
        var password = Environment.GetEnvironmentVariable("SEED_DEFAULT_PASSWORD") ?? "Andalusia@2026";
        var hash = BCrypt.Net.BCrypt.HashPassword(password);
        var roles = await _db.Roles.ToDictionaryAsync(r => r.Name);

        var demo = new[]
        {
            ("admin@andalusia.local", "Admin", "User", "Admin", false),
            ("manager@andalusia.local", "Mariam", "Manager", "Manager", false),
            ("content@andalusia.local", "Culture", "Editor", "Content_Manager", false),
            ("instructor@andalusia.local", "Nadia", "Fawzy", "Instructor", true),
            ("learner@andalusia.local", "Youssef", "Learner", "Learner", false),
        };

        foreach (var (email, first, last, roleName, isInstructor) in demo)
        {
            if (await _db.Users.AnyAsync(u => u.Email == email)) continue;
            if (!roles.TryGetValue(roleName, out var role)) continue;

            var user = new User
            {
                FirstName = first,
                LastName = last,
                Email = email,
                MobileNumber = "01000000000",
                Country = "Egypt",
                PreferredLanguage = "en",
                PasswordHash = hash,
                IsActive = true,
                IsEmailVerified = true,
                TermsAcceptedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };

            user.UserRoles.Add(new UserRole { RoleId = role.RoleId });

            if (isInstructor)
            {
                user.Instructor = new Instructor
                {
                    JobTitle = "Head of Applied AI",
                    Bio = "Leads applied AI programs for banking clients.",
                    AvatarUrl = ""
                };
            }

            _db.Users.Add(user);
        }

        await _db.SaveChangesAsync();
    }

    // =====================================================================
    // 3b) Demo applications + enrollments for the demo learner (Development only)
    // =====================================================================
    private async Task SeedDemoPortalRecordsAsync()
    {
        var learner = await _db.Users.FirstOrDefaultAsync(u => u.Email == "learner@andalusia.local");
        if (learner is null) return;

        // Idempotent: do nothing if this learner already has portal records.
        if (await _db.Applications.AnyAsync(a => a.UserId == learner.UserId)
            || await _db.Enrollments.AnyAsync(e => e.UserId == learner.UserId))
            return;

        var courses = await _db.Courses.OrderBy(c => c.CourseId).Take(4).ToListAsync();
        var programs = await _db.Set<ProgramEntity>().OrderBy(p => p.ProgramId).Take(2).ToListAsync();
        if (courses.Count < 3 || programs.Count < 1) return;

        var now = DateTime.UtcNow;

        // Programs have scheduled batches; use one for the approved program application.
        var schedule = await _db.Schedules
            .Where(s => s.ProgramId == programs[0].ProgramId)
            .OrderBy(s => s.StartDate)
            .FirstOrDefaultAsync();

        // --- Applications: one per status (course XOR program, as the DB check constraint requires) ---
        var approvedProgramApp = new Application
        {
            UserId = learner.UserId,
            ProgramId = programs[0].ProgramId,
            ScheduleId = schedule?.ScheduleId,
            Status = ApplicationStatus.Approved,
            SubmissionDate = now.AddDays(-30)
        };
        var approvedCourseApp = new Application
        {
            UserId = learner.UserId,
            CourseId = courses[0].CourseId,
            Status = ApplicationStatus.Approved,
            SubmissionDate = now.AddDays(-60)
        };
        var underReviewCourseApp = new Application
        {
            UserId = learner.UserId,
            CourseId = courses[1].CourseId,
            Status = ApplicationStatus.Under_Review,
            SubmissionDate = now.AddDays(-5)
        };
        var submittedCourseApp = new Application
        {
            UserId = learner.UserId,
            CourseId = courses[2].CourseId,
            Status = ApplicationStatus.Submitted,
            SubmissionDate = now.AddDays(-1)
        };
        var rejectedApp = new Application
        {
            UserId = learner.UserId,
            CourseId = courses.Count > 3 ? courses[3].CourseId : courses[2].CourseId,
            Status = ApplicationStatus.Rejected,
            SubmissionDate = now.AddDays(-45)
        };

        _db.Applications.AddRange(approvedProgramApp, approvedCourseApp, underReviewCourseApp,
            submittedCourseApp, rejectedApp);

        if (programs.Count > 1)
        {
            _db.Applications.Add(new Application
            {
                UserId = learner.UserId,
                ProgramId = programs[1].ProgramId,
                Status = ApplicationStatus.Cancelled,
                SubmissionDate = now.AddDays(-20)
            });
        }

        await _db.SaveChangesAsync(); // generates ApplicationId values used below

        // --- Enrollments created from the approved applications (ApplicationId is unique per enrollment) ---
        _db.Enrollments.AddRange(
            new Enrollment
            {
                UserId = learner.UserId,
                ProgramId = programs[0].ProgramId,
                ScheduleId = schedule?.ScheduleId,
                ApplicationId = approvedProgramApp.ApplicationId,
                Status = EnrollmentStatus.Active,
                EnrolledAt = now.AddDays(-28)
            },
            new Enrollment
            {
                UserId = learner.UserId,
                CourseId = courses[0].CourseId,
                ApplicationId = approvedCourseApp.ApplicationId,
                Status = EnrollmentStatus.Completed,
                EnrolledAt = now.AddDays(-58)
            });

        await _db.SaveChangesAsync();
    }

    // =====================================================================
    // 3c) Demo teaching: the demo instructor teaches the program batch the demo learner is enrolled in (Development only)
    // =====================================================================
    private const string DemoLearnerEmail = "learner@andalusia.local";
    private const string DemoInstructorEmail = "instructor@andalusia.local";
    private const string DemoMeetingLink = "https://meet.google.com/andalusia-demo-class";

    private async Task SeedDemoTeachingAsync()
    {
        var instructor = await _db.Instructors.FirstOrDefaultAsync(i => i.User.Email == DemoInstructorEmail);
        if (instructor is null) return;

        // Idempotent: nothing to do once the instructor teaches any batch (also keeps manual assignments untouched).
        if (await _db.ScheduleInstructors.AnyAsync(l => l.InstructorId == instructor.InstructorId)) return;

        var learner = await _db.Users.FirstOrDefaultAsync(u => u.Email == DemoLearnerEmail);
        var schedule = (learner is null ? null : await FindLearnerProgramBatchAsync(learner.UserId))
                       ?? await _db.Schedules.OrderBy(s => s.StartDate).FirstOrDefaultAsync();
        if (schedule is null) return;

        _db.ScheduleInstructors.Add(new ScheduleInstructor { ScheduleId = schedule.ScheduleId, InstructorId = instructor.InstructorId });
        await _db.SaveChangesAsync();
    }

    // =====================================================================
    // 3d) Demo learner workspace (Development only). Everything the student dashboard shows comes from here:
    //     batches + active enrollments, sessions, attendance, assignments (pending / submitted / graded),
    //     materials, instructor messages and notifications. Every step is idempotent (keyed by batch code / title),
    //     so it is safe on a fresh database and on one that was seeded by an earlier version.
    // =====================================================================
    private async Task SeedDemoLearnerWorkspaceAsync()
    {
        var learner = await _db.Users.FirstOrDefaultAsync(u => u.Email == DemoLearnerEmail);
        if (learner is null) return;

        var instructor = await _db.Instructors
            .Include(i => i.User)
            .FirstOrDefaultAsync(i => i.User.Email == DemoInstructorEmail);
        var instructorUser = instructor?.User;

        // 1) The program batch the learner already belongs to (created by SeedDemoPortalRecordsAsync).
        var programBatch = await FindLearnerProgramBatchAsync(learner.UserId);
        if (programBatch is not null)
            await SeedBatchContentAsync(programBatch, learner, instructorUser, null, ProgramBatchContent);

        // 2) Course batches: a course enrollment is what gives the learner course materials, a mentor and a course page.
        foreach (var plan in CourseBatchPlans)
        {
            var course = await _db.Courses.FirstOrDefaultAsync(c => c.Slug == plan.CourseSlug);
            if (course is null) continue;

            var batch = await EnsureCourseBatchAsync(course, plan);
            await EnsureEnrollmentAsync(learner, course, batch, plan.EnrolledDaysAgo);
            if (instructor is not null) await EnsureInstructorAsync(batch, instructor);
            await SeedBatchContentAsync(batch, learner, instructorUser, course.CourseId, plan.Content);
        }

        await SeedDemoMessagesAsync(learner, instructorUser);
        await SeedDemoNotificationsAsync(learner);
    }

    /// <summary>The batch of the learner's (non-cancelled) program enrollment, if any.</summary>
    private async Task<Schedule?> FindLearnerProgramBatchAsync(long learnerId)
    {
        var scheduleId = await _db.Enrollments
            .Where(e => e.UserId == learnerId && e.ProgramId != null && e.ScheduleId != null
                        && e.Status != EnrollmentStatus.Cancelled)
            .OrderBy(e => e.EnrollmentId)
            .Select(e => e.ScheduleId)
            .FirstOrDefaultAsync();

        return scheduleId is null
            ? null
            : await _db.Schedules.FirstOrDefaultAsync(s => s.ScheduleId == scheduleId.Value);
    }

    private async Task<Schedule> EnsureCourseBatchAsync(Course course, CourseBatchPlan plan)
    {
        var batch = await _db.Schedules.FirstOrDefaultAsync(s => s.BatchCode == plan.BatchCode);
        if (batch is not null) return batch;

        batch = new Schedule
        {
            CourseId = course.CourseId, // course XOR program (CK_Schedules_CourseXorProgram)
            BatchCode = plan.BatchCode,
            VenueName = "Alexandria: Smouha Campus",
            RoomNumber = plan.Room,
            StartDate = Today.AddDays(plan.StartDay),
            EndDate = Today.AddDays(plan.EndDay),
            Capacity = plan.Capacity,
            Status = ScheduleStatus.Running
        };
        _db.Schedules.Add(batch);
        await _db.SaveChangesAsync();
        return batch;
    }

    private async Task EnsureEnrollmentAsync(User learner, Course course, Schedule batch, int enrolledDaysAgo)
    {
        if (await _db.Enrollments.AnyAsync(e => e.UserId == learner.UserId && e.ScheduleId == batch.ScheduleId)) return;

        _db.Enrollments.Add(new Enrollment
        {
            UserId = learner.UserId,
            CourseId = course.CourseId, // course XOR program (CK_Enrollments_CourseXorProgram)
            ScheduleId = batch.ScheduleId,
            Status = EnrollmentStatus.Active,
            EnrolledAt = DateTime.UtcNow.AddDays(-enrolledDaysAgo)
        });
        await _db.SaveChangesAsync();
    }

    private async Task EnsureInstructorAsync(Schedule batch, Instructor instructor)
    {
        if (await _db.ScheduleInstructors.AnyAsync(l => l.ScheduleId == batch.ScheduleId && l.InstructorId == instructor.InstructorId))
            return;

        _db.ScheduleInstructors.Add(new ScheduleInstructor { ScheduleId = batch.ScheduleId, InstructorId = instructor.InstructorId });
        await _db.SaveChangesAsync();
    }

    /// <summary>Sessions, attendance, assignments, submissions and (for course batches) materials of one batch.</summary>
    private async Task SeedBatchContentAsync(
        Schedule schedule, User learner, User? instructorUser, long? courseId, BatchContent content)
    {
        // ---- sessions ----
        var sessions = await _db.Sessions.Where(s => s.ScheduleId == schedule.ScheduleId).ToListAsync();
        foreach (var seed in content.Sessions)
        {
            if (sessions.Any(s => s.Title == seed.Title)) continue;

            var session = new Session
            {
                ScheduleId = schedule.ScheduleId,
                Title = seed.Title,
                SessionDate = Today.AddDays(seed.Day),
                StartTime = TimeOnly.Parse(seed.Start, CultureInfo.InvariantCulture),
                EndTime = TimeOnly.Parse(seed.End, CultureInfo.InvariantCulture),
                // One free-text field: a room for on-site classes, a meeting link for online ones.
                RoomDetails = seed.Online ? DemoMeetingLink : schedule.RoomNumber
            };
            _db.Sessions.Add(session);
            sessions.Add(session);
        }
        await _db.SaveChangesAsync(); // generates SessionId values used below

        // ---- attendance: one row per learner + session (unique index) ----
        var marked = (await _db.Attendances
                .Where(a => a.LearnerId == learner.UserId && a.Session.ScheduleId == schedule.ScheduleId)
                .Select(a => a.SessionId)
                .ToListAsync())
            .ToHashSet();
        foreach (var seed in content.Sessions.Where(s => s.Attendance is not null))
        {
            var session = sessions.First(s => s.Title == seed.Title);
            if (marked.Contains(session.SessionId)) continue;

            _db.Attendances.Add(new Attendance
            {
                SessionId = session.SessionId,
                LearnerId = learner.UserId,
                Status = seed.Attendance!.Value,
                MarkedAt = DateTime.SpecifyKind(session.SessionDate.ToDateTime(session.StartTime), DateTimeKind.Utc)
            });
        }

        // ---- assignments ----
        var assignments = await _db.Assignments.Where(a => a.ScheduleId == schedule.ScheduleId).ToListAsync();
        foreach (var seed in content.Assignments)
        {
            if (assignments.Any(a => a.Title == seed.Title)) continue;

            var assignment = new Assignment
            {
                ScheduleId = schedule.ScheduleId,
                Title = seed.Title,
                Description = seed.Description,
                DueDate = DateTime.UtcNow.AddDays(seed.DueInDays),
                MaxScore = seed.MaxScore
            };
            _db.Assignments.Add(assignment);
            assignments.Add(assignment);
        }
        await _db.SaveChangesAsync(); // generates AssignmentId values used below

        // ---- submissions: pending = no row, submitted = Score null, graded = Score set ----
        var submitted = (await _db.AssignmentSubmissions
                .Where(s => s.LearnerId == learner.UserId && s.Assignment.ScheduleId == schedule.ScheduleId)
                .Select(s => s.AssignmentId)
                .ToListAsync())
            .ToHashSet();
        foreach (var seed in content.Assignments.Where(a => a.Submission is not null))
        {
            var assignment = assignments.First(a => a.Title == seed.Title);
            if (submitted.Contains(assignment.AssignmentId)) continue;

            var sub = seed.Submission!;
            var graded = sub.Score is not null;
            _db.AssignmentSubmissions.Add(new AssignmentSubmission
            {
                AssignmentId = assignment.AssignmentId,
                LearnerId = learner.UserId,
                AttemptNumber = 1,
                FileUrl = sub.File,
                Status = sub.Late ? AssignmentSubmissionStatus.Late : AssignmentSubmissionStatus.Submitted,
                SubmittedAt = sub.Late ? assignment.DueDate.AddHours(20) : assignment.DueDate.AddDays(-1),
                Score = sub.Score,
                Feedback = sub.Feedback,
                GradedAt = graded ? assignment.DueDate.AddDays(2) : (DateTime?)null,
                GradedBy = graded ? instructorUser?.UserId : (long?)null
            });
        }

        // ---- materials (course batches only: materials belong to a course) ----
        if (courseId is not null)
        {
            var titles = (await _db.CourseMaterials
                    .Where(m => m.CourseId == courseId.Value)
                    .Select(m => m.Title)
                    .ToListAsync())
                .ToHashSet();
            foreach (var seed in content.Materials)
            {
                if (titles.Contains(seed.Title)) continue;

                _db.CourseMaterials.Add(new CourseMaterial
                {
                    CourseId = courseId.Value,
                    ScheduleId = seed.BatchOnly ? schedule.ScheduleId : null, // null = visible to every batch of the course
                    Title = seed.Title,
                    FileUrl = seed.Url,
                    ResourceType = seed.Type,
                    UploadedAt = DateTime.UtcNow.AddDays(-seed.AddedDaysAgo)
                });
            }
        }

        await _db.SaveChangesAsync();
    }

    /// <summary>A short thread with the instructor; the last two messages are unread (drives the Messages badge).</summary>
    private async Task SeedDemoMessagesAsync(User learner, User? instructorUser)
    {
        if (instructorUser is null) return;

        var any = await _db.DirectMessages.AnyAsync(m =>
            (m.SenderId == learner.UserId && m.RecipientId == instructorUser.UserId) ||
            (m.SenderId == instructorUser.UserId && m.RecipientId == learner.UserId));
        if (any) return;

        var now = DateTime.UtcNow;
        var thread = new (bool FromLearner, string Body, TimeSpan Ago, bool Read)[]
        {
            (false, "Welcome to the program, Youssef! Please review the kick-off slides before our first lab.", TimeSpan.FromDays(6), true),
            (true, "Thank you! Will the case brief be graded or is it practice only?", TimeSpan.FromDays(5) + TimeSpan.FromHours(20), true),
            (false, "It is graded. Focus on the problem framing and your three recommendations.", TimeSpan.FromDays(5) + TimeSpan.FromHours(18), true),
            (true, "Understood. I uploaded my vendor comparison, could you check the scoring criteria?", TimeSpan.FromDays(2), true),
            (false, "Good structure. I left feedback on the submission, the criteria need clearer weights.", TimeSpan.FromHours(20), false),
            (false, "Reminder: the governance outline is due next week. Office hours are open if you want a review.", TimeSpan.FromHours(3), false),
        };

        _db.DirectMessages.AddRange(thread.Select(t => new DirectMessage
        {
            SenderId = t.FromLearner ? learner.UserId : instructorUser.UserId,
            RecipientId = t.FromLearner ? instructorUser.UserId : learner.UserId,
            Body = t.Body,
            SentAt = now - t.Ago,
            ReadAt = t.Read ? now - t.Ago + TimeSpan.FromMinutes(20) : (DateTime?)null
        }));
        await _db.SaveChangesAsync();
    }

    private async Task SeedDemoNotificationsAsync(User learner)
    {
        if (await _db.Notifications.AnyAsync(n => n.UserId == learner.UserId && n.Type == "Assignment")) return;

        var now = DateTime.UtcNow;
        _db.Notifications.AddRange(
            new Notification { UserId = learner.UserId, Type = "Assignment", Title = "Assignment graded", Message = "\"Use-case shortlist\" was graded: 92/100.", CreatedAt = now.AddDays(-8), IsRead = true },
            new Notification { UserId = learner.UserId, Type = "Material", Title = "New material", Message = "\"Session 3: Build, buy or partner (slides)\" was added to AI Strategy for Executives.", CreatedAt = now.AddDays(-6), IsRead = false },
            new Notification { UserId = learner.UserId, Type = "Session", Title = "Session tomorrow", Message = "Applied lab starts tomorrow at 10:00.", CreatedAt = now.AddHours(-4), IsRead = false });
        await _db.SaveChangesAsync();
    }

    // ---------------------------------------------------------------------
    // Demo workspace content (data only). Day offsets are relative to the day the seed runs.
    // ---------------------------------------------------------------------
    private sealed record SessionSeed(int Day, string Title, string Start, string End, AttendanceStatus? Attendance = null, bool Online = false);
    private sealed record SubmissionSeed(string File, bool Late, int? Score = null, string? Feedback = null);
    private sealed record AssignmentSeed(string Title, string Description, int DueInDays, int MaxScore, SubmissionSeed? Submission = null);
    private sealed record MaterialSeed(string Title, string Url, CourseMaterialResourceType Type, int AddedDaysAgo, bool BatchOnly = false);
    private sealed record BatchContent(IReadOnlyList<SessionSeed> Sessions, IReadOnlyList<AssignmentSeed> Assignments, IReadOnlyList<MaterialSeed> Materials);
    private sealed record CourseBatchPlan(string CourseSlug, string BatchCode, string Room, int StartDay, int EndDay, int Capacity, int EnrolledDaysAgo, BatchContent Content);

    private static readonly BatchContent ProgramBatchContent = new(
        Sessions: new SessionSeed[]
        {
            new(-2, "Kick-off workshop", "10:00", "12:00", AttendanceStatus.Present),
            new(1, "Applied lab", "10:00", "12:30"),
            new(3, "Case study review", "14:00", "16:00"),
            new(8, "Open banking studio (online)", "10:00", "13:00", Online: true),
        },
        Assignments: new AssignmentSeed[]
        {
            new("Week 1 case brief", "Summarise the case and propose next steps.", 7, 100),
            new("Digital channels audit", "Audit one digital channel and list three improvements.", 14, 100),
        },
        Materials: Array.Empty<MaterialSeed>());

    private static readonly CourseBatchPlan[] CourseBatchPlans =
    {
        new("ai-strategy-for-executives", "EAS-C-2026-A", "Hall B-101", StartDay: -21, EndDay: 35, Capacity: 24, EnrolledDaysAgo: 24,
            new BatchContent(
                Sessions: new SessionSeed[]
                {
                    new(-20, "Kick-off: AI strategy foundations", "18:00", "20:00", AttendanceStatus.Present),
                    new(-13, "Use-case discovery workshop", "18:00", "20:00", AttendanceStatus.Present),
                    new(-9, "Vendor evaluation clinic (online)", "19:00", "20:00", AttendanceStatus.Excused, Online: true),
                    new(-6, "Build, buy or partner", "18:00", "20:00", AttendanceStatus.Late),
                    new(-2, "Measuring AI value (KPIs)", "18:00", "20:00", AttendanceStatus.Absent),
                    new(2, "Governance and risk review", "18:00", "20:00"),
                    new(5, "Roadmap studio: part 1", "18:00", "20:30"),
                    new(9, "Roadmap studio: part 2 (online)", "19:00", "20:30", Online: true),
                    new(16, "Board-ready roadmap presentations", "18:00", "21:00"),
                },
                Assignments: new AssignmentSeed[]
                {
                    new("Use-case shortlist", "Rank five AI use cases for your organisation by value and feasibility.", -10, 100,
                        new SubmissionSeed("/uploads/demo/use-case-shortlist.pdf", Late: false, Score: 92, Feedback: "Strong prioritisation. Add cost estimates next time.")),
                    new("Vendor comparison matrix", "Compare two vendors against weighted criteria.", -4, 100,
                        new SubmissionSeed("/uploads/demo/vendor-comparison.xlsx", Late: true, Score: 74, Feedback: "Good structure; the scoring criteria need clearer weights.")),
                    new("KPI framework draft", "Define the KPIs you would use to track one AI initiative.", -1, 100,
                        new SubmissionSeed("/uploads/demo/kpi-framework.docx", Late: false)),
                    new("AI governance policy outline", "Outline the policy sections your teams would follow.", 6, 100),
                    new("Board roadmap (final)", "Present a 12-month AI roadmap ready for a board meeting.", 17, 100),
                },
                Materials: new MaterialSeed[]
                {
                    new("Session 1: AI strategy foundations (slides)", "/materials/ai-strategy/session-1-foundations.pdf", CourseMaterialResourceType.Slide, 20),
                    new("Use-case prioritisation template", "/materials/ai-strategy/use-case-template.xlsx", CourseMaterialResourceType.Document, 14, BatchOnly: true),
                    new("Session 3: Build, buy or partner (slides)", "/materials/ai-strategy/session-3-build-buy-partner.pdf", CourseMaterialResourceType.Slide, 6, BatchOnly: true),
                    new("NIST AI Risk Management Framework", "https://www.nist.gov/itl/ai-risk-management-framework", CourseMaterialResourceType.Reference_Link, 12),
                    new("Stanford AI Index report", "https://aiindex.stanford.edu/report/", CourseMaterialResourceType.Reference_Link, 9),
                })),

        new("product-discovery-bootcamp", "PDB-C-2026-A", "Hall C-204", StartDay: -14, EndDay: 28, Capacity: 30, EnrolledDaysAgo: 16,
            new BatchContent(
                Sessions: new SessionSeed[]
                {
                    new(-14, "Discovery fundamentals", "10:00", "13:00", AttendanceStatus.Present),
                    new(-7, "Customer interview lab", "10:00", "13:00", AttendanceStatus.Present),
                    new(-1, "Opportunity mapping", "10:00", "13:00", AttendanceStatus.Present),
                    new(6, "Rapid experiments", "10:00", "13:00"),
                    new(13, "Portfolio review", "10:00", "12:00"),
                },
                Assignments: new AssignmentSeed[]
                {
                    new("Interview synthesis", "Synthesise five customer interviews into themes.", -5, 100,
                        new SubmissionSeed("/uploads/demo/interview-synthesis.pdf", Late: false, Score: 85, Feedback: "Clear themes. Quote more customer language.")),
                    new("Opportunity map", "Map the opportunities you found and pick one to test.", 4, 100),
                },
                Materials: new MaterialSeed[]
                {
                    new("Discovery fundamentals (slides)", "/materials/product-discovery/discovery-fundamentals.pdf", CourseMaterialResourceType.Slide, 14),
                    new("Customer interview guide", "/materials/product-discovery/interview-guide.docx", CourseMaterialResourceType.Document, 7, BatchOnly: true),
                    new("Continuous discovery resources", "https://www.producttalk.org/", CourseMaterialResourceType.Reference_Link, 10),
                })),
    };

    // =====================================================================
    // Helpers
    // =====================================================================
    private static Course NewCourse(
        string slug, string title, string description, string category, string duration, string level,
        decimal tuition, Mentor mentor, ProgramEntity program, CareerPath careerPath,
        bool featured, int startInDays, int capacity, int enrolled,
        (string Title, string Text)[] outcomes, string[] bullets,
        string hall = "Hall B-302, Alexandria Campus")
    {
        return new Course
        {
            Slug = slug,
            Title = title,
            Description = description,
            Category = category,
            DeliveryMode = "Offline (Alex Campus)",
            Hall = hall,
            DurationLabel = duration,
            Level = level,
            Accreditation = "Pearson & CPD",
            Tuition = tuition,
            TuitionNote = "Installment plans available. Contact admissions.",
            IsFeatured = featured,
            Mentor = mentor,
            Program = program,
            CareerPath = careerPath,
            Cohorts = new List<CourseCohort>
            {
                new()
                {
                    StartDate = Today.AddDays(startInDays),
                    Capacity = capacity,
                    EnrolledCount = enrolled,
                    Status = ScheduleStatus.Scheduled
                },
                new()
                {
                    StartDate = Today.AddDays(startInDays + 56),
                    Capacity = capacity,
                    EnrolledCount = Math.Max(0, enrolled / 4),
                    Status = ScheduleStatus.Scheduled
                }
            },
            LearningOutcomes = outcomes
                .Select((o, i) => new LearningOutcome { Title = o.Title, Text = o.Text, Order = i + 1 })
                .ToList(),
            Bullets = bullets.Select(b => new CourseBullet { Text = b }).ToList()
        };
    }

    private static Schedule NewSchedule(ProgramEntity program, string batchCode, string room,
        int startInDays, int lengthInDays, int capacity)
    {
        return new Schedule
        {
            Program = program,
            BatchCode = batchCode,
            VenueName = "Alexandria: Smouha Campus",
            RoomNumber = room,
            StartDate = Today.AddDays(startInDays),
            EndDate = Today.AddDays(startInDays + lengthInDays),
            Capacity = capacity,
            Status = ScheduleStatus.Scheduled
        };
    }
}