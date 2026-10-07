const HIGHLIGHTS = [
  { icon: "schedule", label: "Duration", value: "10 Months (240 Hrs)", tone: "primary" },
  { icon: "badge", label: "Target Seniority", value: "Chief Architect / VP", tone: "amber" },
  { icon: "verified", label: "Recognition", value: "24 Transferable ECTS", tone: "neutral" },
  { icon: "dns", label: "Facilities", value: "Gleem Hall B & H100 GPU Pod", tone: "slate" },
];

const GUARANTEES = [
  "Strict 16-candidate cohort limit for individualized advisory",
  "1:1 architectural reviews with ex-Google & CIB Chief Architects",
  "Boardroom defense before commercial bank CIOs",
];

const PATH_PROGRAMS = [
  {
    badge: "Program 01 of 02", meta: "16 Weeks • 144 Lab Hrs", dark: false,
    title: "Certified Digital Banking Architect & Open Finance",
    text: "Build full-scale sovereign banking ledgers adhering strictly to CBE open banking directives, deploy production Kafka backbones, and engineer immutable audit pipelines.",
    courses: ["Course 1: Enterprise Generative AI & Compliance", "Course 2: Open Banking Microservices & APIs", "Course 3: Core Ledger Fault Tolerance"],
    tuition: "EGP 38,000", cta: "View Program Details", to: "/programs/digital-banking",
  },
  {
    badge: "Program 02 of 02", meta: "12 Weeks • 96 Lab Hrs", dark: true,
    title: "DevSecOps, Cloud Security & Zero Trust Architecture",
    text: "Harden mission-critical financial workloads across hybrid cloud topologies. Master automated eBPF runtime observability and enforce zero-trust identity chains with Vault.",
    courses: ["Course 4: Kubernetes Hardening & eBPF Security", "Course 5: Zero-Trust IAM & Vault Governance", "Capstone: Autonomous Sovereign Bank Defense"],
    tuition: "EGP 34,000", cta: "Explore Catalog", to: "/programs",
  },
];

export { HIGHLIGHTS, GUARANTEES, PATH_PROGRAMS };
