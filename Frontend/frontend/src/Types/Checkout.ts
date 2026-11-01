type CardBrand = "visa" | "mastercard" | "meeza" | "unknown";

type CardForm = {
  name: string;
  number: string;
  expiry: string;
  cvv: string;
};

type CardErrors = Partial<Record<keyof CardForm, string>>;

type CheckoutStatus = "idle" | "processing" | "success" | "failed";

// Everything the card step needs. Built from the real payment record returned by
// POST /api/payments (amount = the course tuition / program price on the server).
type CheckoutTarget = {
  paymentId: string;
  applicationId: number | null;
  applicationRef: string;
  title: string;
  itemType: string;
  amount: number;
  currency: string;
  reference: string;
  scheduleLabel: string | null;
  startDate: string | null;
};

type CheckoutReceipt = {
  reference: string;
  applicationRef: string;
  program: string;
  cohort: string;
  total: number;
  currency: string;
};

type CheckoutFailure = {
  code: string;
  reason: string;
  traceId: string;
};

type CheckoutOutcome =
  | { kind: "success"; receipt: CheckoutReceipt }
  | { kind: "failed"; failure: CheckoutFailure };

export type {
  CardBrand,
  CardForm,
  CardErrors,
  CheckoutStatus,
  CheckoutTarget,
  CheckoutReceipt,
  CheckoutFailure,
  CheckoutOutcome,
};
