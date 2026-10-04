import type { CatalogCourse } from "../../../Types/CatalogCourse";

const L = "/courses/generative-ai-banking";

const COURSES: CatalogCourse[] = [
  { id: 1, title: "Enterprise Generative AI & Regulatory Compliance in Banking", category: "AI & FinTech", type: "Offline (Alex Campus)", duration: "12 Wks (72 Hrs)", mentor: "Dr. Tarek Mansour", role: "Lead Architect (ex-Google)", tuition: "EGP 18,500", seats: "4 Seats Left", link: L },
  { id: 2, title: "Certified Digital Banking Architect & Open Finance Program", category: "FinTech & Banking", type: "Blended Hybrid", duration: "10 Weeks", mentor: "Nadia Khalil, CAMS", role: "Regulatory Advisor", tuition: "EGP 21,000", seats: "Enrolling", link: "/programs/digital-banking" },
  { id: 3, title: "DevSecOps, Cloud Security & Zero Trust Architecture", category: "Cyber Defense", type: "Offline (Alex Campus)", duration: "14 Weeks", mentor: "Hossam El-Din, CISSP", role: "SOC Director EMEA", tuition: "EGP 24,000", seats: "Waitlist Only", link: L },
  { id: 4, title: "Strategic Healthcare Operations & Clinical Informatics", category: "Healthcare Management", type: "Blended Offline", duration: "8 Weeks", mentor: "Dr. Sherif El-Wakil", role: "Medical Director", tuition: "EGP 19,500", seats: "Enrolling", link: L },
  { id: 5, title: "Applied Data Engineering & Distributed Analytics (Kafka & PySpark)", category: "AI & FinTech", type: "Offline (Alex Campus)", duration: "12 Weeks", mentor: "Ahmed Samy", role: "Principal Data Engineer", tuition: "EGP 17,000", seats: "Upcoming", link: L },
  { id: 6, title: "Clinical Governance & Hospital Accreditation (ISO 21001 & JCI)", category: "Healthcare Management", type: "Executive Masterclass", duration: "6 Weeks", mentor: "Dr. Maha Zaki", role: "Lead Auditor", tuition: "EGP 15,500", seats: "Enrolling", link: L },
];

const COURSE_CATEGORIES = ["All", "AI & FinTech", "FinTech & Banking", "Healthcare Management", "Cyber Defense"];

export { COURSES, COURSE_CATEGORIES };
