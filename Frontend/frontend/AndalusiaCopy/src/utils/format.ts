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

export { formatMoney, initials };
