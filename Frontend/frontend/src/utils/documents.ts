import { downloadPdf } from "./pdf";
import { formatAmount } from "./format";
import type { Transaction } from "../Types/Payment";

function downloadReceiptPdf(t: Transaction, studentName = ""): void {
  const money = (n: number) => `${t.currency} ${formatAmount(n)}`;
  const lines = [
    `Reference: ${t.id}`,
    `Invoice: ${t.invoice}`,
    ...(studentName ? [`Student: ${studentName}`] : []),
    `Course: ${t.course}`,
    `Term: ${t.term}`,
    `Date: ${t.date}`,
    `Method: ${t.method}`,
    `Installment: ${t.installment}`,
    `Status: ${t.status.toUpperCase()}`,
    "",
    "# Breakdown",
    ...t.lines.map((l) => `${l.label}: ${money(l.amount)}`),
    "",
    `Total: ${money(t.amount)}`,
  ];
  downloadPdf(`receipt-${t.invoice || t.id}.pdf`, t.status === "paid" ? "Official Payment Receipt" : "Invoice", lines);
}

function downloadTaxStatementPdf(transactions: Transaction[]): void {
  const paid = transactions.filter((t) => t.status === "paid");
  const currency = paid[0]?.currency ?? "EGP";
  const total = paid.reduce((s, t) => s + t.amount, 0);
  const lines = [
    `Statement year: ${new Date().getFullYear()}`,
    `Paid transactions: ${paid.length}`,
    `Total paid: ${currency} ${formatAmount(total)}`,
    "",
    "# Paid transactions",
    ...paid.map((t) => `${t.date} | ${t.invoice} | ${t.course} | ${currency} ${formatAmount(t.amount)}`),
  ];
  downloadPdf(`tax-statement-${new Date().getFullYear()}.pdf`, "Annual Tax Statement", lines);
}

export { downloadReceiptPdf, downloadTaxStatementPdf };
