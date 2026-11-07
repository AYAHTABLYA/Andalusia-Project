import type { CardBrand, CardForm } from "../../../Types/Checkout";

// Sandbox gateway: the card is only validated in the browser and never sent anywhere.
// The form is pre-filled with a test card so the flow can be clicked through; the
// expiry is always two years ahead so it never goes stale.
function makeDemoCard(holderName = ""): CardForm {
  const next = new Date();
  next.setFullYear(next.getFullYear() + 2);
  const month = String(next.getMonth() + 1).padStart(2, "0");
  const year = String(next.getFullYear()).slice(-2);
  return {
    name: holderName,
    number: "4000 1234 5678 9010",
    expiry: `${month}/${year}`,
    cvv: "842",
  };
}

const CARD_PLACEHOLDER = {
  name: "CARDHOLDER NAME",
  number: "4000 1234 5678 9010",
  expiry: "MM/YY",
};

const BRAND_LABEL: Record<CardBrand, string> = {
  visa: "VISA",
  mastercard: "MASTERCARD",
  meeza: "MEEZA EGYPT",
  unknown: "CARD NET",
};

const ACCEPTED_BRANDS = ["Visa", "Mastercard", "Meeza"];

export { makeDemoCard, CARD_PLACEHOLDER, BRAND_LABEL, ACCEPTED_BRANDS };
