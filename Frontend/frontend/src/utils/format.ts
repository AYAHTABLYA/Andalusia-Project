import { API_BASE_URL } from "../apis/academyApi";

// Backend may return a relative path ("/uploads/..."): make it absolute.
function resolveAssetUrl(url?: string | null): string | null {
  if (!url) return null;
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

function formatMoney(amount: number, currency = "EGP"): string {
  if (!amount || amount <= 0) return "To be announced";
  return `${currency} ${amount.toLocaleString("en-US")}`;
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Exact amount with 2 decimals, e.g. 19000 -> "19,000.00" (used by invoices / receipts)
function formatAmount(amount: number): string {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export { formatMoney, formatAmount, initials, resolveAssetUrl };
