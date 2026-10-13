// Sample data used until the backend exposes /api/profile and /api/payments.
// The hooks in this folder are the only place that reads it, so swapping to the
// real API means changing a single line per hook (see usePayments / useProfile).
import type { ProfileData } from "../../Types/Profile";
import type { Transaction } from "../../Types/Payment";

const MOCK_PROFILE: ProfileData = {
  firstName: "",
  lastName: "",
  title: "Executive Learner",
  email: "",
  phone: "",
  campus: "Alexandria: Gleem Campus",
  studentId: "#AA-0000",
  memberSince: "October 2024 (Cohort 03)",
};

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "TXN-2024-8821-A",
    invoice: "AA-EGY-9031",
    course: "Certified Digital Banking Architect Program",
    term: "Cohort 2024 • Term 2 (Module 3 of 4)",
    date: "Nov 25, 2025",
    dateNote: "Maturity Date",
    amount: 19000,
    currency: "EGP",
    installment: "Installment 3 / 4",
    method: "CIB Visa •••• 4821",
    methodNote: "Auto-debit on due date",
    status: "pending",
    lines: [
      { label: "Module Tuition", amount: 16521.74 },
      { label: "Executive Campus Lab Facility Access", amount: 1000 },
      { label: "Value Added Tax", amount: 1478.26 },
    ],
  },
  {
    id: "TXN-2024-7412-B",
    invoice: "AA-EGY-8419",
    course: "Certified Digital Banking Architect Program",
    term: "Cohort 2024 • Term 2 (Module 2 of 4)",
    date: "Aug 20, 2024",
    dateNote: "14:22 EET",
    amount: 19000,
    currency: "EGP",
    installment: "Installment 2 / 4",
    method: "CIB Visa •••• 4821",
    methodNote: "Auth Code: 884102",
    status: "paid",
    lines: [
      { label: "Module Tuition", amount: 16521.74 },
      { label: "Executive Campus Lab Facility Access", amount: 1000 },
      { label: "Value Added Tax", amount: 1478.26 },
    ],
  },
  {
    id: "TXN-2024-5109-C",
    invoice: "AA-EGY-7102",
    course: "Executive AI & FinTech Lab Fee",
    term: "Alexandria High-Performance Computational Sandbox",
    date: "Jul 12, 2024",
    dateNote: "09:40 EET",
    amount: 9500,
    currency: "EGP",
    installment: "One-time Facility Access",
    method: "Banque Misr Wire",
    methodNote: "Ref: BM-EGY-09941",
    status: "paid",
    lines: [{ label: "Lab Facility Access", amount: 9500 }],
  },
  {
    id: "TXN-2024-3290-D",
    invoice: "AA-EGY-6211",
    course: "Certified Digital Banking Architect Program",
    term: "Matriculation Deposit & Module 1 Tuition",
    date: "May 05, 2024",
    dateNote: "11:15 EET",
    amount: 38000,
    currency: "EGP",
    installment: "Installment 1 + Registration",
    method: "ValU 0% Interest (6 Mo)",
    methodNote: "Agreement: VLU-7740",
    status: "paid",
    lines: [
      { label: "Registration Fee", amount: 5000 },
      { label: "Module 1 Tuition", amount: 33000 },
    ],
  },
];

export { MOCK_PROFILE, MOCK_TRANSACTIONS };
