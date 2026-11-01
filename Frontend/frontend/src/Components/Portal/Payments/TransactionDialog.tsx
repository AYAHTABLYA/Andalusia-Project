import Dialog from "../Shared/Dialog";
import { formatAmount } from "../../../utils/format";
import { downloadReceiptPdf } from "../../../utils/documents";
import type { Transaction } from "../../../Types/Payment";
import "../Shared/style.css";
import "./style.css";

type Props = {
  transaction: Transaction;
  canPay: boolean;
  studentName: string;
  onClose: () => void;
  onPay: (id: string) => void;
  onNotify: (message: string) => void;
};

function TransactionDialog({ transaction: t, canPay, studentName, onClose, onPay, onNotify }: Props) {
  const paid = t.status === "paid";
  const money = (amount: number) => `${t.currency} ${formatAmount(amount)}`;
  const banner = {
    paid: { icon: "check_circle", text: "Payment cleared and reconciled", label: "Settled" },
    pending: { icon: "schedule", text: "Payment pending: awaiting card payment", label: "Pending" },
    failed: { icon: "error", text: "Payment failed: you can retry it from the ledger", label: "Failed" },
    refunded: { icon: "undo", text: "Payment refunded to the payer", label: "Refunded" },
  }[t.status];

  return (
    <Dialog
      icon="receipt"
      title={paid ? "Official Payment Receipt" : "Invoice Breakdown"}
      subtitle={`Reference: ${t.id} • Invoice #${t.invoice}`}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            className="payments_dialog-link"
            onClick={() => {
              downloadReceiptPdf(t, studentName);
              onNotify(`Receipt PDF downloaded for ${t.id}.`);
            }}
          >
            <span className="material-symbols-outlined">file_download</span>
            Download PDF Receipt
          </button>
          <div className="payments_dialog-actions">
            <button type="button" className="portal-ui_btn portal-ui_btn--outline" onClick={onClose}>
              Close
            </button>
            {canPay && (
              <button type="button" className="portal-ui_btn portal-ui_btn--primary" onClick={() => onPay(t.id)}>
                {t.status === "failed" ? "Retry" : "Pay"} {money(t.amount)} Now
              </button>
            )}
          </div>
        </>
      }
    >
      <div className={`payments_status-banner payments_status-banner--${paid ? "paid" : "pending"}`}>
        <span>
          <span className="material-symbols-outlined">{banner.icon}</span>
          {banner.text}
        </span>
        <b>{banner.label}</b>
      </div>

      <div className="payments_dialog-grid">
        <div><span>Program</span><strong>{t.course}</strong></div>
        <div><span>Term</span><strong>{t.term}</strong></div>
        <div><span>Student</span><strong>{studentName}</strong></div>
        <div><span>Payment Method</span><strong>{t.method}</strong></div>
        <div><span>Installment</span><strong>{t.installment}</strong></div>
        <div><span>Reference</span><strong>{t.methodNote}</strong></div>
      </div>

      <div className="payments_breakdown">
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount ({t.currency})</th>
            </tr>
          </thead>
          <tbody>
            {t.lines.map((line) => (
              <tr key={line.label}>
                <td>{line.label}</td>
                <td>{formatAmount(line.amount)}</td>
              </tr>
            ))}
            <tr className="payments_breakdown-total">
              <td>{paid ? "Total Cleared" : "Total Due"}</td>
              <td>{money(t.amount)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Dialog>
  );
}

export default TransactionDialog;
