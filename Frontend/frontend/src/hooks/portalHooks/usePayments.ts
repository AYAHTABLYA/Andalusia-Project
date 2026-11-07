import { useCallback } from "react";
import useApi from "../academyHooks/useApi";
import {
  confirmPayment,
  getPayableApplications,
  getPayments,
  initiatePayment,
} from "../../apis/portalApi";
import {
  toCheckoutTarget,
  toPayables,
  toTransaction,
  toTransactions,
} from "../../apis/portalMappers";
import type { CheckoutTarget } from "../../Types/Checkout";
import type {
  PayableApplication,
  PaymentsState,
  Transaction,
} from "../../Types/Payment";

// Lives in PortalLayout so the "N Due" badge in the nav and the Payments page
// always show the same data.
//   GET  /api/payments                -> ledger
//   GET  /api/payments/payable        -> applications still waiting for payment
//   POST /api/payments                -> startPayment (creates / re-uses the payment record)
//   POST /api/payments/{id}/confirm   -> confirm (simulated gateway callback, creates the enrollment)
function usePayments(): PaymentsState {
  const ledger = useApi<Transaction[]>(
    async (signal) => toTransactions(await getPayments(signal)),
    [],
  );
  const payable = useApi<PayableApplication[]>(
    async (signal) => toPayables(await getPayableApplications(signal)),
    [],
  );

  const { reload: reloadLedger } = ledger;
  const { reload: reloadPayable } = payable;
  const reload = useCallback(() => {
    reloadLedger();
    reloadPayable();
  }, [reloadLedger, reloadPayable]);

  const startPayment = useCallback(
    async (applicationId: number): Promise<CheckoutTarget> => {
      // Throws ApiError on a business conflict (already paid, rejected, ...): the page toasts it.
      const txn = toTransaction(
        (await initiatePayment({ applicationId })) as Record<string, unknown>,
      );

      // Only used for display (schedule / start date), so a failure here must not block paying.
      let app: PayableApplication | null = null;
      try {
        app =
          toPayables(await getPayableApplications()).find(
            (a) => a.applicationId === applicationId,
          ) ?? null;
      } catch {
        app = null;
      }

      reload();
      return toCheckoutTarget(txn, app);
    },
    [reload],
  );

  const confirm = useCallback(
    async (paymentId: string, success: boolean): Promise<Transaction> => {
      try {
        return toTransaction(
          (await confirmPayment(paymentId, success)) as Record<string, unknown>,
        );
      } finally {
        reload();
      }
    },
    [reload],
  );

  return {
    transactions: ledger.data ?? [],
    payable: payable.data ?? [],
    // Keep showing the old data while a background reload runs.
    loading: (ledger.loading && !ledger.data) || (payable.loading && !payable.data),
    errorMessage: ledger.error?.message ?? payable.error?.message,
    reload,
    startPayment,
    confirm,
  };
}

export default usePayments;
