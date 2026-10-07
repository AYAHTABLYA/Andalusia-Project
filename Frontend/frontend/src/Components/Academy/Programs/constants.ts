import type { Program } from "../../../Types/Program";

const L = "/programs/digital-banking";

const PROGRAMS: Program[] = [
  {
    id: 1,
    title: "Certified Digital Banking Architect & Open Finance Program",
    category: "FinTech & Banking",
    duration: "24 Weeks (144 Hrs)",
    coursesCount: 3,
    tuition: "EGP 48,000",
    accreditation: "Pearson Assured & CPD",
    cohortDate: "Nov 20, 2025",
    link: L,
  },
  {
    id: 2,
    title: "Executive AI & Cloud Architecture Diploma",
    category: "Technology & AI",
    duration: "28 Weeks",
    coursesCount: 4,
    tuition: "EGP 52,000",
    accreditation: "Pearson Assured",
    cohortDate: "Dec 05, 2025",
    link: L,
  },
  {
    id: 3,
    title: "Strategic Healthcare Operations & Clinical Leadership",
    category: "Healthcare Management",
    duration: "20 Weeks",
    coursesCount: 3,
    tuition: "EGP 42,000",
    accreditation: "CPD UK & Andalusia Hospitals",
    cohortDate: "Jan 12, 2026",
    link: L,
  },
  {
    id: 4,
    title: "DevSecOps, Cloud Security & Zero Trust Architecture",
    category: "Cyber Defense",
    duration: "18 Weeks",
    coursesCount: 3,
    tuition: "EGP 46,000",
    accreditation: "Pearson Assured",
    cohortDate: "Dec 15, 2025",
    link: L,
  },
  {
    id: 5,
    title: "Executive Data Engineering & Modern Lakehouse Architecture",
    category: "Technology & AI",
    duration: "22 Weeks",
    coursesCount: 3,
    tuition: "EGP 38,000",
    accreditation: "CPD Standards",
    cohortDate: "Jan 20, 2026",
    link: L,
  },
  {
    id: 6,
    title: "Clinical Governance & Hospital Quality Accreditation (ISQua/GAHAR)",
    category: "Healthcare Management",
    duration: "14 Weeks",
    coursesCount: 2,
    tuition: "EGP 34,000",
    accreditation: "ISO 21001",
    cohortDate: "Nov 28, 2025",
    link: L,
  },
];

const PROGRAM_CATEGORIES = [
  "All",
  "FinTech & Banking",
  "Technology & AI",
  "Healthcare Management",
  "Cyber Defense",
];

export { PROGRAMS, PROGRAM_CATEGORIES };
