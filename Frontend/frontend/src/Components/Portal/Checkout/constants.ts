import type { CardBrand, CardForm, CheckoutLine, CheckoutOrder } from "../../../Types/Checkout";

// ⚠️ SAMPLE DATA – replace with the real application / invoice returned by the API
// (e.g. GET /api/applications/:id) before going live.
const ORDER: CheckoutOrder = {
  applicationRef: "APP-2025-0842",
  program: "Certified Digital Banking Architect & Open Finance Program",
  moduleSummary:
    "Module 1: Cloud-Native Core Banking Platforms, Real-time APIs, & ISO 20022 Financial Messaging Architecture.",
  campus: "Alexandria Executive Campus",
  campusNote: "Gleem Hall B (Executive Floor) • Offline Cohort",
  startsOn: "Starts Saturday, Nov 25, 2025",
  schedule: "Weekly Saturdays: 10:00 AM – 02:00 PM EET",
  accreditation: "Accreditation & Academic Transfer",
  accreditationNote: "24 Transferable UK ECTS • CPD UK Validated Certification",
  planLabel: "Quarterly Plan",
  currency: "EGP",
  usdApprox: "~$430.00 USD",
};

// The VAT line is computed from these in CheckoutContainer.
const TUITION_LINES: CheckoutLine[] = [
  {
    label: "Program Tuition (Installment 1 of 4)",
    note: "Standard academic term fee allocation",
    amount: 16666,
  },
  {
    label: "High-Performance FinTech Lab & Bare-metal Sandbox",
    note: "Cloud infrastructure runtime token",
    amount: 2000,
  },
];

const VAT_RATE = 0.14;
const VAT_LINE = {
  label: "Egyptian ETA Value Added Tax (14% VAT)",
  note: "Statutory educational services tax compliance",
};

// Pre-filled so the demo can be clicked through. Set every value to "" to start blank.
const DEMO_CARD: CardForm = {
  name: "Ahmed Samy Al-Mansoor",
  number: "4000 1234 5678 9010",
  expiry: "08/28",
  cvv: "842",
};

const CARD_PLACEHOLDER = {
  name: "AHMED SAMY AL-MANSOOR",
  number: "4000 1234 5678 9010",
  expiry: "08/28",
};

const BRAND_LABEL: Record<CardBrand, string> = {
  visa: "VISA",
  mastercard: "MASTERCARD",
  meeza: "MEEZA EGYPT",
  unknown: "CARD NET",
};

const ACCEPTED_BRANDS = ["Visa", "Mastercard", "Meeza"];

const FAILURE_REASONS = [
  "Payment Denied: Alexandria Cohort Gleem Hall B has reached maximum seat capacity.",
  "Payment Denied: Installment 1 of 4 is already marked as settled for this application.",
  "Payment Denied: Insufficient balance or daily domestic online transaction threshold exceeded (Error Code #EGP-842).",
];

const FAILURE_CODE = "FIN-409-SCHED";
const PROCESSING_DELAY_MS = 750;

export {
  ORDER,
  TUITION_LINES,
  VAT_RATE,
  VAT_LINE,
  DEMO_CARD,
  CARD_PLACEHOLDER,
  BRAND_LABEL,
  ACCEPTED_BRANDS,
  FAILURE_REASONS,
  FAILURE_CODE,
  PROCESSING_DELAY_MS,
};
