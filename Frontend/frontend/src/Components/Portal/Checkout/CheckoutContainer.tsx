import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CheckoutComponent from "./CheckoutComponent";
import { DEMO_CARD, TUITION_LINES, VAT_RATE } from "./constants";
import usePortalContext from "../../../hooks/portalHooks/usePortalContext";
import useCheckout from "../../../hooks/portalHooks/useCheckout";
import { detectCardBrand, formatCardNumber, formatExpiry, validateCard } from "../../../utils/card";
import type { CardErrors, CardForm } from "../../../Types/Checkout";

const round2 = (n: number) => Math.round(n * 100) / 100;

function CheckoutContainer() {
  const { showToast } = usePortalContext();
  const navigate = useNavigate();

  const [card, setCard] = useState<CardForm>(DEMO_CARD);
  const [errors, setErrors] = useState<CardErrors>({});

  // 16,666 + 2,000 = 18,666  ->  VAT 14% = 2,613.24  ->  total 21,279.24
  const { vat, total } = useMemo(() => {
    const subtotal = TUITION_LINES.reduce((sum, l) => sum + l.amount, 0);
    const tax = round2(subtotal * VAT_RATE);
    return { vat: tax, total: round2(subtotal + tax) };
  }, []);

  const { status, outcome, pay, dismiss } = useCheckout(total);
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
    if (Object.keys(found).length === 0) pay(true);
  }

  return (
    <CheckoutComponent
      card={card}
      errors={errors}
      brand={brand}
      status={status}
      outcome={outcome}
      lines={TUITION_LINES}
      vat={vat}
      total={total}
      onField={handleField}
      onSubmit={handleSubmit}
      onSimulateFailure={() => pay(false)}
      onDismiss={dismiss}
      onContinue={() => navigate("/enrollments")}
      onDownloadReceipt={() => showToast("Tax invoice generated and queued for PDF download.")}
    />
  );
}

export default CheckoutContainer;
