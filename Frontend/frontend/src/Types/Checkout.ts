type CardBrand = "visa" | "mastercard" | "meeza" | "unknown";

type CardForm = {
  name: string;
  number: string;
  expiry: string;
  cvv: string;
};

type CardErrors = Partial<Record<keyof CardForm, string>>;

type CheckoutStatus = "idle" | "processing" | "success" | "failed";

type CheckoutLine = { label: string; note: string; amount: number };

type CheckoutOrder = {
  applicationRef: string;
  program: string;
  moduleSummary: string;
  campus: string;
  campusNote: string;
  startsOn: string;
  schedule: string;
  accreditation: string;
  accreditationNote: string;
  planLabel: string;
  currency: string;
  usdApprox: string;
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
  CheckoutLine,
  CheckoutOrder,
  CheckoutReceipt,
  CheckoutFailure,
  CheckoutOutcome,
};
