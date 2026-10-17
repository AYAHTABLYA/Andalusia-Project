import useApi from "../academyHooks/useApi";
import { confirmPayment, getPayments } from "../../apis/portalApi";
import { toTransactions } from "../../apis/portalMappers";
import type { PaymentsState, Transaction } from "../../Types/Payment";

// Lives in PortalLayout so the "1 Due" badge in the nav and the Payments page
// always show the same data.
//   GET  /api/payments               -> list
//   POST /api/payments/{id}/confirm  -> payNow (simulated gateway callback)
function usePayments(): PaymentsState {
  const { data, loading, error, reload } = useApi<Transaction[]>(
    async (signal) => toTransactions(await getPayments(signal)),
    [],
  );

  async function payNow(id: string) {
    await confirmPayment(id); // throws ApiError on failure; the page shows it in a toast
    reload();
  }

  return { transactions: data ?? [], loading, errorMessage: error?.message, reload, payNow };
}

export default usePayments;
