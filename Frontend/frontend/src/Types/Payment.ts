import type { CheckoutTarget } from "./Checkout";

type PaymentStatus = "paid" | "pending" | "failed" | "refunded";
type PaymentFilter = "all" | PaymentStatus;

type TransactionLine = { label: string; amount: number };

type Transaction = {
  id: string;
  applicationId: number | null;
  reference: string;
  invoice: string;
  course: string;
  term: string;
  date: string;
  dateNote: string;
  amount: number;
  currency: string;
  installment: string;
  method: string;
  methodNote: string;
  status: PaymentStatus;
  lines: TransactionLine[];
};

// An application that still has to be paid (GET /api/payments/payable).
type PayableApplication = {
  applicationId: number;
  applicationRef: string;
  status: string;
  itemType: "Course" | "Program";
  title: string;
  amount: number;
  currency: string;
  submitted: string;
  scheduleLabel: string | null;
  startDate: string | null;
  pendingPaymentId: string | null;
};

// What the Portal layout shares with the Payments page (and the nav badge).
type PaymentsState = {
  transactions: Transaction[];
  payable: PayableApplication[];
  loading: boolean;
  errorMessage?: string;
  reload: () => void;
  // POST /api/payments { applicationId } -> real payment record, ready for the card step.
  // Re-uses the pending payment when there is one, creates a fresh one after a failure.
  startPayment: (applicationId: number) => Promise<CheckoutTarget>;
  // POST /api/payments/{id}/confirm { success } -> enrollment is created on success.
  confirm: (paymentId: string, success: boolean) => Promise<Transaction>;
};

export type {
  PaymentStatus,
  PaymentFilter,
  Transaction,
  TransactionLine,
  PayableApplication,
  PaymentsState,
};
