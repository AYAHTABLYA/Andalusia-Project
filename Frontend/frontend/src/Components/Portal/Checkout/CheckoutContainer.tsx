import { useState } from "react";
import CheckoutComponent from "./CheckoutComponent";
import { makeDemoCard } from "./constants";
import useCheckout from "../../../hooks/portalHooks/useCheckout";
import { detectCardBrand, formatCardNumber, formatExpiry, validateCard } from "../../../utils/card";
import { getStoredUser } from "../../../utils/session";
import type { CardErrors, CardForm, CheckoutTarget } from "../../../Types/Checkout";
import type { Transaction } from "../../../Types/Payment";

type Props = {
  target: CheckoutTarget;
  confirm: (paymentId: string, success: boolean) => Promise<Transaction>;
  onBack: () => void;
  // Start over with a fresh payment record (a failed payment cannot be confirmed again).
  onRetry: () => void;
  onContinue: () => void;
};

// Card step of the merged Payments tab. Rendered by PaymentsContainer in place of the ledger.
function CheckoutContainer({ target, confirm, onBack, onRetry, onContinue }: Props) {
  const [card, setCard] = useState<CardForm>(() => makeDemoCard(getStoredUser()?.name ?? ""));
  const [errors, setErrors] = useState<CardErrors>({});

  const { status, outcome, pay } = useCheckout(target, confirm);
  const brand = detectCardBrand(card.number);

  function handleField(field: keyof CardForm, value: string) {
    const next =
      field === "number" ? formatCardNumber(value)
      : field === "expiry" ? formatExpiry(value)
      : field === "cvv" ? value.replace(/\D/g, "").slice(0, 3)
      : value;
    setCard((prev) => ({ ...prev, [field]: next }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleSubmit() {
    const found = validateCard(card);
    setErrors(found);
    if (Object.keys(found).length === 0) void pay(true);
  }

  return (
    <CheckoutComponent
      target={target}
      card={card}
      errors={errors}
      brand={brand}
      status={status}
      outcome={outcome}
      onField={handleField}
      onSubmit={handleSubmit}
      onSimulateFailure={() => void pay(false)}
      onBack={onBack}
      // A paid receipt returns to the ledger; a failed one starts a new attempt.
      onDismiss={outcome?.kind === "success" ? onBack : onRetry}
      onRetry={onRetry}
      onContinue={onContinue}
    />
  );
}

export default CheckoutContainer;
