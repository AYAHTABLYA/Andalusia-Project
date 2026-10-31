import { useCallback, useEffect, useRef, useState } from "react";
import {
  FAILURE_CODE,
  FAILURE_REASONS,
  ORDER,
  PROCESSING_DELAY_MS,
} from "../../Components/Portal/Checkout/constants";
import type { CheckoutOutcome, CheckoutStatus } from "../../Types/Checkout";

const randomDigits = (length: number) =>
  String(Math.floor(Math.random() * 10 ** length)).padStart(length, "0");

// Client-side payment simulation. Nothing is sent anywhere.
// To go live: replace the setTimeout with initiatePayment(...) + confirmPayment(id)
// from apis/portalApi.ts and map the response into a CheckoutOutcome.
function useCheckout(total: number) {
  const [status, setStatus] = useState<CheckoutStatus>("idle");
  const [outcome, setOutcome] = useState<CheckoutOutcome | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const pay = useCallback(
    (simulateSuccess: boolean) => {
      if (status === "processing") return;
      setStatus("processing");

      timer.current = window.setTimeout(() => {
        if (simulateSuccess) {
          setOutcome({
            kind: "success",
            receipt: {
              reference: `TXN-${new Date().getFullYear()}-${randomDigits(4)}`,
              applicationRef: ORDER.applicationRef,
              program: "Certified Digital Banking Architect",
              cohort: "Alexandria • Starts Nov 25, 2025",
              total,
              currency: ORDER.currency,
            },
          });
          setStatus("success");
        } else {
          setOutcome({
            kind: "failed",
            failure: {
              code: FAILURE_CODE,
              reason: FAILURE_REASONS[Math.floor(Math.random() * FAILURE_REASONS.length)],
              traceId: `SIM-FAIL-${randomDigits(4)}-ERR`,
            },
          });
          setStatus("failed");
        }
      }, PROCESSING_DELAY_MS);
    },
    [status, total],
  );

  const dismiss = useCallback(() => {
    setOutcome(null);
    setStatus("idle");
  }, []);

  return { status, outcome, pay, dismiss };
}

export default useCheckout;
