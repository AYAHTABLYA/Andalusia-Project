import type { CardBrand, CardErrors, CardForm } from "../Types/Checkout";

const digitsOnly = (value: string) => value.replace(/\D/g, "");

// "4000123456789010" -> "4000 1234 5678 9010"
function formatCardNumber(value: string): string {
  const digits = digitsOnly(value).slice(0, 16);
  return digits.match(/.{1,4}/g)?.join(" ") ?? digits;
}

// "0828" -> "08/28"
function formatExpiry(value: string): string {
  const digits = digitsOnly(value).slice(0, 4);
  return digits.length >= 3 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

// Detect the network from the IIN prefix.
function detectCardBrand(value: string): CardBrand {
  const digits = digitsOnly(value);
  if (digits.startsWith("4")) return "visa";
  if (/^5[1-5]/.test(digits)) return "mastercard";
  if (/^(5078|6051|9)/.test(digits)) return "meeza";
  return "unknown";
}

function isExpiryValid(expiry: string, now = new Date()): boolean {
  const match = /^(\d{2})\/(\d{2})$/.exec(expiry);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;
  // A card is valid through the last day of its expiry month.
  return new Date(year, month, 1) > now;
}

function validateCard(form: CardForm): CardErrors {
  const errors: CardErrors = {};
  if (form.name.trim().length < 3) errors.name = "Enter the name as printed on the card.";
  if (digitsOnly(form.number).length !== 16) errors.number = "Card number must be 16 digits.";
  if (!isExpiryValid(form.expiry)) errors.expiry = "Enter a valid future date (MM/YY).";
  if (!/^\d{3}$/.test(form.cvv)) errors.cvv = "CVV must be 3 digits.";
  return errors;
}

export { formatCardNumber, formatExpiry, detectCardBrand, validateCard };
