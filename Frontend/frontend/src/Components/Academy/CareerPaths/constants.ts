import type { CareerPath } from "../../../Types/CareerPath";
import type { ApiState } from "../../../Types/ApiState";

const CAREER_PATHS: CareerPath[] = [
  {
    id: "FIN-EXEC-25",
    title: "Executive FinTech & Cloud Architecture Career Path",
    roles: "Chief FinTech Architect, Head of Core Banking, VP of Digital Engineering",
    summary: "Sovereign banking architecture journey combining high-throughput microservices, CBE regulatory sandboxes, generative credit models, and cloud infrastructure defense.",
    duration: "10 Months", credits: "24 Credits", diplomas: "2 Programs", courses: "8 Courses",
    tuition: "EGP 68,000", status: "Enrolling (Spring 2025)",
    pathUrl: "/career-paths/fintech-cloud", domain: "FinTech & Banking",
  },
  {
    id: "MED-EXEC-19",
    title: "Executive Healthcare Operations & Hospital Leadership",
    roles: "Medical Director, Hospital CEO, VP of Clinical Operations, Quality Director",
    summary: "Designed for physician leaders and healthcare administrators mastering hospital economics, JCI/GAHAR accreditation readiness, clinical lean operations, and digital health records.",
    duration: "9 Months", credits: "20 Credits", diplomas: "2 Programs", courses: "6 Courses",
    tuition: "EGP 58,000", status: "Enrolling",
    pathUrl: "/career-paths/fintech-cloud", domain: "Healthcare Management",
  },
  {
    id: "AI-EXEC-44",
    title: "Enterprise AI & Autonomous Systems Leadership",
    roles: "Chief AI Officer (CAIO), Head of Applied Data Science, Lead Enterprise AI Architect",
    summary: "From distributed data lakehouses to sovereign LLM deployments and AI governance boards under European and Middle East regulatory safety frameworks.",
    duration: "12 Months", credits: "28 Credits", diplomas: "3 Programs", courses: "9 Courses",
    tuition: "EGP 74,000", status: "Waitlist Only",
    pathUrl: "/career-paths/fintech-cloud", domain: "Technology & AI",
  },
  {
    id: "SEC-EXEC-08",
    title: "Cyber Warfare, Cloud Resilience & Zero-Trust Defense",
    roles: "Chief Information Security Officer (CISO), Director of Cyber Defense, Threat Intel Lead",
    summary: "Defensive and offensive cloud-native security engineering, Kubernetes runtime eBPF telemetry, red-teaming financial ledgers, and sovereign threat response.",
    duration: "9 Months", credits: "22 Credits", diplomas: "2 Programs", courses: "7 Courses",
    tuition: "EGP 64,000", status: "Enrolling",
    pathUrl: "/career-paths/fintech-cloud", domain: "Cyber Defense",
  },
];

const DOMAIN_OPTIONS = [
  { value: "All", label: "All Domains" },
  { value: "FinTech", label: "FinTech & Banking" },
  { value: "Healthcare", label: "Healthcare Management" },
  { value: "AI", label: "Technology & AI" },
  { value: "Cyber", label: "Cyber Defense" },
];

const API_STATES: ApiState[] = ["catalog", "skeleton", "empty", "error"];

const PROGRESSION_LEVELS = [
  { level: "Level 1 • Modular Units", title: "Coursework", text: "6–8 specialized masterclasses & labs." },
  { level: "Level 2 • Specialization", title: "Accredited Diplomas", text: "2–3 comprehensive programs validating mastery." },
  { level: "Level 3 • Unified Path", title: "Career Path", text: "10-12 months sovereign executive track." },
  { level: "Level 4 • Culmination", title: "Boardroom Defense", text: "Live defense before industry juries.", highlighted: true },
];

export { CAREER_PATHS, DOMAIN_OPTIONS, API_STATES, PROGRESSION_LEVELS };
