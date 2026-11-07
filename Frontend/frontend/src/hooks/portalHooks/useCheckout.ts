import { useCallback, useRef, useState } from "react";
import { ApiError } from "../../apis/academyApi";
import type {
  CheckoutOutcome,
  CheckoutStatus,
  CheckoutTarget,
} from "../../Types/Checkout";
import type { Transaction } from "../../Types/Payment";

// Card step of the Payments page. The only network call is the confirm callback:
//   POST /api/payments/{id}/confirm { success }
// On success the backend creates the enrollment and approves the application.
// Card details never leave the browser.
function useCheckout(
  target: CheckoutTarget,
  confirm: (paymentId: string, success: boolean) => Promise<Transaction>,
) {
  const [status, setStatus] = useState<CheckoutStatus>("idle");
  const [outcome, setOutcome] = useState<CheckoutOutcome | null>(null);
  const busy = useRef(false);

  const fail = useCallback(
    (code: string, reason: string) => {
      setOutcome({
        kind: "failed",
        failure: { code, reason, traceId: target.reference || `PAY-${target.paymentId}` },
      });
      setStatus("failed");
    },
    [target],
  );

  const pay = useCallback(
    async (simulateSuccess: boolean) => {
      if (busy.current) return;
      busy.current = true;
      setStatus("processing");

      try {
        const txn = await confirm(target.paymentId, simulateSuccess);
        if (txn.status === "paid") {
          setOutcome({
            kind: "success",
            receipt: {
              reference: txn.reference || target.reference || `PAY-${txn.id}`,
              applicationRef: target.applicationRef,
              program: target.title,
              cohort: target.scheduleLabel ?? target.itemType,
              total: txn.amount,
              currency: txn.currency,
            },
          });
          setStatus("success");
        } else {
          fail(
            "GATEWAY-DECLINED",
            simulateSuccess
              ? "The gateway did not approve this payment."
              : "Payment declined by the sandbox gateway (test handler).",
          );
        }
      } catch (err) {
        fail(
          err instanceof ApiError && err.status ? `HTTP-${err.status}` : "NETWORK",
          err instanceof Error && err.message
            ? err.message
            : "The payment could not be completed. Please try again.",
        );
      } finally {
        busy.current = false;
      }
    },
    [confirm, fail, target],
  );

  const dismiss = useCallback(() => {
    setOutcome(null);
    setStatus("idle");
  }, []);

  return { status, outcome, pay, dismiss };
}

export default useCheckout;
