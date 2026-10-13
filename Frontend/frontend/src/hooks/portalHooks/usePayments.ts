import { useMemo, useState } from "react";
import type { PaymentsState, Transaction } from "../../Types/Payment";
import useApi from "../academyHooks/useApi";
import { MOCK_TRANSACTIONS } from "./mockData";

type Settlement = Pick<Transaction, "date" | "dateNote">;

// Lives in PortalLayout so the "1 Due" badge in the nav and the Payments page
// always show the same data.
// TODO: replace the fetcher with  apiGet<Transaction[]>("/api/payments", undefined, signal)
// and make payNow() call your payment-gateway endpoint instead of settling locally.
function usePayments(): PaymentsState {
  const { data, loading, error, reload } = useApi<Transaction[]>(
    () => Promise.resolve(MOCK_TRANSACTIONS),
    [],
  );
  const [settled, setSettled] = useState<Record<string, Settlement>>({});

  const transactions = useMemo(
    () =>
      (data ?? []).map((t) =>
        settled[t.id] ? { ...t, status: "paid" as const, ...settled[t.id] } : t,
      ),
    [data, settled],
  );

  function payNow(id: string) {
    setSettled((prev) => ({
      ...prev,
      [id]: { date: "Today (Cleared)", dateNote: "Direct CIB PGW Settlement" },
    }));
  }

  return { transactions, loading, errorMessage: error?.message, reload, payNow };
}

export default usePayments;
