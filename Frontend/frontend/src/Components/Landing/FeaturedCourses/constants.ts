import type { Course } from "../../../types/Course";

const FEATURED_COURSES: Course[] = [
  {
    id: 1,
    category: "Technology & AI",
    modeLabel: "Offline Cohort • Alex Campus",
    modeVariant: "offline",
    title:
      "Executive Diploma in Generative AI & Enterprise LLM Applications",
    description:
      "Hands-on offline cohort focusing on fine-tuning architectures, prompt pipelines, semantic indexing, and enterprise API security.",
    nextBatch: "Nov 15, 2025 (Sat/Tue)",
    duration: "12 Weeks • 72 Hours In-Person",
    hall: "Alexandria Innovation Hall A",
    instructorInitials: "TM",
    instructorName: "Dr. Tarek Mansour",
    instructorTitle: "Ex-Google Cloud Principal",
    price: "EGP 18,500",
  },
  {
    id: 2,
    category: "FinTech & Banking",
    modeLabel: "Blended Hybrid",
    modeVariant: "blended",
    title: "Certified Digital Banking Architect & Open Finance Program",
    description:
      "Master open banking standards, core ledger microservices, instant payment networks, and Central Bank regulatory sandboxes.",
    nextBatch: "Dec 01, 2025 (Fridays)",
    duration: "10 Weeks • Weekend Intensive",
    hall: "Alexandria Executive Room 4",
    instructorInitials: "NK",
    instructorName: "Nadia Khalil, CAMS",
    instructorTitle: "Senior VP of Payment Systems",
    price: "EGP 21,000",
  },
  {
    id: 3,
    category: "Cyber Defense",
    modeLabel: "Offline Cohort • Alex Campus",
    modeVariant: "offline",
    title: "DevSecOps, Cloud Security & Zero Trust Architecture",
    description:
      "Live threat simulation labs, SOC operations, Kubernetes runtime auditing, and NIST governance protocols for modern infrastructure.",
    nextBatch: "Nov 22, 2025 (Mon/Thu)",
    duration: "14 Weeks • SOC Sandbox Lab",
    hall: "Cyber Resilience Lab",
    instructorInitials: "HE",
    instructorName: "Hossam El-Din, CISSP",
    instructorTitle: "CISO Advisor & Red Team Lead",
    price: "EGP 24,000",
  },
];

export { FEATURED_COURSES };
