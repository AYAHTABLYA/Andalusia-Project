type PaymentStatus = "paid" | "pending" | "failed";
type PaymentFilter = "all" | PaymentStatus;

type TransactionLine = { label: string; amount: number };

type Transaction = {
  id: string;
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

// What the Portal layout shares with the Payments page (and the nav badge).
type PaymentsState = {
  transactions: Transaction[];
  loading: boolean;
  errorMessage?: string;
  reload: () => void;
  payNow: (id: string) => void;
};

export type {
  PaymentStatus,
  PaymentFilter,
  Transaction,
  TransactionLine,
  PaymentsState,
};
