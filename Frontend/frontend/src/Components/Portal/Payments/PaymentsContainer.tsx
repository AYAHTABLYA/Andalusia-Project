import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PaymentsComponent from "./PaymentsComponent";
import CheckoutContainer from "../Checkout/CheckoutContainer";
import { CSV_HEADER } from "./constants";
import usePortalContext from "../../../hooks/portalHooks/usePortalContext";
import { downloadCsv } from "../../../utils/csv";
import type { CheckoutTarget } from "../../../Types/Checkout";
import type { PayableApplication, PaymentFilter, Transaction } from "../../../Types/Payment";

const sum = (list: { amount: number }[]) => list.reduce((total, t) => total + t.amount, 0);

// One tab for the whole money flow:
//   apply -> "Awaiting payment" list -> POST /api/payments -> card step -> confirm -> enrollment -> ledger.
// /payments?application=ID jumps straight to the card step for that application
// (used by the "Pay now" button on My Applications).
function PaymentsContainer() {
  const { showToast, payments } = usePortalContext();
  const { transactions, payable, loading, errorMessage, reload, startPayment, confirm } = payments;
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PaymentFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // `key` changes on every attempt so the card step always starts clean.
  const [checkout, setCheckout] = useState<{ target: CheckoutTarget; key: number } | null>(null);
  const [startingId, setStartingId] = useState<number | null>(null);
  const starting = useRef(false);
  const attempt = useRef(0);

  // Coming back from another portal page: the cached ledger may be stale (e.g. an application
  // was cancelled meanwhile). On the very first load the layout is already fetching, so skip.
  useEffect(() => {
    if (!loading) reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const payableIds = useMemo(
    () => new Set(payable.map((a: PayableApplication) => a.applicationId)),
    [payable],
  );

  // Pending and failed rows can be paid (again) while their application is still payable.
  const canPay = useCallback(
    (t: Transaction) =>
      (t.status === "pending" || t.status === "failed") &&
      t.applicationId !== null &&
      payableIds.has(t.applicationId),
    [payableIds],
  );

  // POST /api/payments { applicationId } -> real payment record -> card step.
  async function beginPayment(applicationId: number) {
    if (starting.current) return;
    starting.current = true;
    setStartingId(applicationId);
    try {
      const target = await startPayment(applicationId);
      attempt.current += 1;
      setSelectedId(null);
      setCheckout({ target, key: attempt.current });
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not start the payment. Please try again.");
      reload();
    } finally {
      starting.current = false;
      setStartingId(null);
    }
  }

  useEffect(() => {
    const raw = params.get("application");
    if (!raw) return;
    setParams({}, { replace: true });
    const id = Number(raw);
    if (Number.isInteger(id) && id > 0) void beginPayment(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions.filter(
      (t) =>
        (status === "all" || t.status === status) &&
        (q === "" ||
          t.id.toLowerCase().includes(q) ||
          t.invoice.toLowerCase().includes(q) ||
          t.reference.toLowerCase().includes(q) ||
          t.course.toLowerCase().includes(q)),
    );
  }, [transactions, search, status]);

  const counts = useMemo(
    () => ({
      all: transactions.length,
      paid: transactions.filter((t) => t.status === "paid").length,
      pending: transactions.filter((t) => t.status === "pending").length,
      failed: transactions.filter((t) => t.status === "failed").length,
      refunded: transactions.filter((t) => t.status === "refunded").length,
    }),
    [transactions],
  );

  const stats = useMemo(() => {
    const paid = transactions.filter((t) => t.status === "paid");
    return {
      currency: payable[0]?.currency ?? transactions[0]?.currency ?? "EGP",
      paidTotal: sum(paid),
      // What the learner still owes: the real fee of every unpaid application.
      dueTotal: sum(payable),
      dueCount: payable.length,
      invoiceCount: paid.length,
    };
  }, [transactions, payable]);

  // Derived from the live list so the dialog flips to "Settled" right after paying.
  const selected = transactions.find((t) => t.id === selectedId) ?? null;

  // "Pay Now" / "Retry" on a ledger row: re-uses the pending payment or creates a new one.
  function handlePay(id: string) {
    const txn = transactions.find((t) => t.id === id);
    if (txn?.applicationId != null) void beginPayment(txn.applicationId);
  }

  function handleExport() {
    downloadCsv("andalusia-ledger.csv", [
      CSV_HEADER,
      ...filtered.map((t) => [
        t.id, t.invoice, t.course, t.term, t.date,
        t.amount, t.currency, t.installment, t.method, t.status,
      ]),
    ]);
    showToast(`Exported ${filtered.length} transactions as CSV.`);
  }

  function handleReset() {
    setSearch("");
    setStatus("all");
  }

  if (checkout) {
    const { target } = checkout;
    const backToLedger = () => {
      setCheckout(null);
      reload();
    };
    return (
      <CheckoutContainer
        key={checkout.key}
        target={target}
        confirm={confirm}
        onBack={backToLedger}
        onRetry={() => (target.applicationId !== null ? void beginPayment(target.applicationId) : backToLedger())}
        onContinue={() => navigate("/enrollments")}
      />
    );
  }

  return (
    <PaymentsComponent
      transactions={filtered}
      payable={payable}
      startingId={startingId}
      canPay={canPay}
      counts={counts}
      stats={stats}
      loading={loading}
      errorMessage={errorMessage}
      search={search}
      status={status}
      selected={selected}
      onSearch={setSearch}
      onStatus={setStatus}
      onReset={handleReset}
      onSelect={setSelectedId}
      onCloseDialog={() => setSelectedId(null)}
      onPay={handlePay}
      onPayApplication={(id) => void beginPayment(id)}
      onExport={handleExport}
      onRetry={reload}
      onNotify={showToast}
    />
  );
}

export default PaymentsContainer;
