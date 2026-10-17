import type { PaymentFilter } from "../../../Types/Payment";

const STATUS_FILTERS: { value: PaymentFilter; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
];

// ⚠️ SAMPLE DATA – replace with the academy's real bank / billing details
// before going live (or load them from the API / a CMS).
const BANK_DETAILS = {
  beneficiary: "Andalusia Academy",
  bank: "Your bank name & branch",
  iban: "EG00 0000 0000 0000 0000 0000 0000",
  swift: "XXXXEGCA000",
  note: "Include your Student ID and Transaction ID in the wire narration for faster clearance.",
};

const BILLING_CONTACT = {
  location: "Alexandria Campus, Executive Wing, Level 2.",
  email: "billing@andalusia-academy.edu.eg",
  hours: "Sun–Thu (08:30 – 16:30 EET)",
};

const SAVED_METHODS = [
  {
    id: "cib-4821",
    brand: "VISA",
    name: "Commercial International Bank (CIB) •••• 4821",
    detail: "Expires 08/2027 • Authorized for auto-debit installments",
    primary: true,
  },
];

const CSV_HEADER = [
  "Transaction ID",
  "Invoice",
  "Program",
  "Term",
  "Date",
  "Amount",
  "Currency",
  "Installment",
  "Method",
  "Status",
];

export { STATUS_FILTERS, BANK_DETAILS, BILLING_CONTACT, SAVED_METHODS, CSV_HEADER };
