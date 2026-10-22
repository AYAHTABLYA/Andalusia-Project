import { useMemo, useRef, useState } from "react";
import PaymentsComponent from "./PaymentsComponent";
import { CSV_HEADER } from "./constants";
import usePortalContext from "../../../hooks/portalHooks/usePortalContext";
import { downloadCsv } from "../../../utils/csv";
import { formatAmount } from "../../../utils/format";
import type { PaymentFilter, Transaction } from "../../../Types/Payment";

const sum = (list: Transaction[]) => list.reduce((total, t) => total + t.amount, 0);

function PaymentsContainer() {
  const { showToast, payments } = usePortalContext();
  const { transactions, loading, errorMessage, reload, payNow } = payments;

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PaymentFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions.filter(
      (t) =>
        (status === "all" || t.status === status) &&
        (q === "" ||
          t.id.toLowerCase().includes(q) ||
          t.invoice.toLowerCase().includes(q) ||
          t.course.toLowerCase().includes(q)),
    );
  }, [transactions, search, status]);

  const counts = useMemo(
    () => ({
      all: transactions.length,
      paid: transactions.filter((t) => t.status === "paid").length,
      pending: transactions.filter((t) => t.status === "pending").length,
      failed: transactions.filter((t) => t.status === "failed").length,
    }),
    [transactions],
  );

  const stats = useMemo(() => {
    const paid = transactions.filter((t) => t.status === "paid");
    const pending = transactions.filter((t) => t.status === "pending");
    return {
      currency: transactions[0]?.currency ?? "EGP",
      paidTotal: sum(paid),
      dueTotal: sum(pending),
      nextDue: pending[0] ?? null,
      invoiceCount: paid.length,
    };
  }, [transactions]);

  // Derived from the live list so the dialog flips to "Settled" right after paying.
  const selected = transactions.find((t) => t.id === selectedId) ?? null;

  // POST /api/payments/{id}/confirm (simulated gateway callback), then reload the list.
  const paying = useRef(new Set<string>());
  async function handlePay(id: string) {
    const txn = transactions.find((t) => t.id === id);
    if (!txn || paying.current.has(id)) return;
    paying.current.add(id);
    try {
      await payNow(id);
      showToast(`Payment of ${txn.currency} ${formatAmount(txn.amount)} processed for ${id}.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Payment failed. Please try again.");
    } finally {
      paying.current.delete(id);
    }
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

  return (
    <PaymentsComponent
      transactions={filtered}
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
      onExport={handleExport}
      onRetry={reload}
      onNotify={showToast}
    />
  );
}

export default PaymentsContainer;
