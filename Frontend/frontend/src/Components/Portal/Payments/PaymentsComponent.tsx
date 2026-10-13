import { memo } from "react";
import Breadcrumb from "../../Academy/Shared/Breadcrumb";
import CatalogState from "../../Academy/Shared/CatalogState";
import { SUPPORT_PHONE } from "../../Academy/Navbar/constants";
import TransactionDialog from "./TransactionDialog";
import { BANK_DETAILS, BILLING_CONTACT, SAVED_METHODS, STATUS_FILTERS } from "./constants";
import { formatAmount } from "../../../utils/format";
import { getStoredUser } from "../../../utils/session";
import type { PaymentFilter, Transaction } from "../../../Types/Payment";
import "../Shared/style.css";
import "./style.css";

type Stats = {
  currency: string;
  paidTotal: number;
  dueTotal: number;
  nextDue: Transaction | null;
  invoiceCount: number;
};

type Props = {
  transactions: Transaction[];
  counts: Record<PaymentFilter, number>;
  stats: Stats;
  loading: boolean;
  errorMessage?: string;
  search: string;
  status: PaymentFilter;
  selected: Transaction | null;
  onSearch: (value: string) => void;
  onStatus: (value: PaymentFilter) => void;
  onReset: () => void;
  onSelect: (id: string) => void;
  onCloseDialog: () => void;
  onPay: (id: string) => void;
  onExport: () => void;
  onRetry: () => void;
  onNotify: (message: string) => void;
};

const STATUS_PILL = {
  paid: { cls: "portal-ui_pill--success", label: "Paid & Cleared", icon: "check" },
  pending: { cls: "portal-ui_pill--warning", label: "Pending", icon: "schedule" },
  failed: { cls: "portal-ui_pill--danger", label: "Failed", icon: "error" },
} as const;

function PaymentsComponent({
  transactions, counts, stats, loading, errorMessage, search, status, selected,
  onSearch, onStatus, onReset, onSelect, onCloseDialog, onPay, onExport, onRetry, onNotify,
}: Props) {
  const money = (amount: number, currency = stats.currency) => `${currency} ${formatAmount(amount)}`;
  const { nextDue } = stats;

  return (
    <div className="payments">
      <Breadcrumb items={[{ label: "Student Workspace", to: "/profile" }, { label: "Financial Ledger & Invoices" }]} />

      {/* Heading */}
      <div className="payments_heading">
        <div>
          <h1>Payments &amp; Financial Ledger</h1>
          <p>
            Review course tuition, upcoming installment schedules, tax invoices and payment receipts
            for your Alexandria campus and blended programs.
          </p>
        </div>
        <div className="payments_heading-actions">
          <button type="button" className="portal-ui_btn portal-ui_btn--outline" onClick={() => onNotify("Sponsorship ledger exported.")}>
            <span className="material-symbols-outlined">account_tree</span>
            Corporate Sponsorship Ledger
          </button>
          <button type="button" className="portal-ui_btn portal-ui_btn--primary" onClick={() => onNotify("Annual tax statement downloaded.")}>
            <span className="material-symbols-outlined">download</span>
            Annual Tax Statement (PDF)
          </button>
        </div>
      </div>

      {loading ? (
        <CatalogState kind="loading" rows={4} />
      ) : errorMessage ? (
        <CatalogState kind="error" title="Could not load your payments" text={errorMessage} actionLabel="Retry" onAction={onRetry} />
      ) : (
        <>
          {/* KPIs */}
          <section className="payments_kpis" aria-label="Financial summary">
            <article className="portal-ui_card payments_kpi">
              <div className="payments_kpi-top">
                <div>
                  <span className="payments_kpi-label">Total Paid</span>
                  <div className="payments_kpi-value">{money(stats.paidTotal)}</div>
                </div>
                <span className="payments_kpi-icon payments_kpi-icon--success"><span className="material-symbols-outlined">check_circle</span></span>
              </div>
              <div className="payments_kpi-foot"><span className="material-symbols-outlined">verified_user</span>Verified payments only</div>
            </article>

            <article className="portal-ui_card payments_kpi payments_kpi--due">
              <div className="payments_kpi-top">
                <div>
                  <span className="payments_kpi-label">Upcoming Installment</span>
                  <div className="payments_kpi-value payments_kpi-value--warn">{money(stats.dueTotal)}</div>
                </div>
                <span className="payments_kpi-icon payments_kpi-icon--warn"><span className="material-symbols-outlined">pending_actions</span></span>
              </div>
              <div className="payments_kpi-foot">
                <span className="material-symbols-outlined">event</span>
                {nextDue ? `Due ${nextDue.date}` : "All paid"}
              </div>
            </article>

            <article className="portal-ui_card payments_kpi">
              <div className="payments_kpi-top">
                <div>
                  <span className="payments_kpi-label">Failed Payments</span>
                  <div className="payments_kpi-value">{counts.failed}</div>
                </div>
                <span className="payments_kpi-icon"><span className="material-symbols-outlined">task_alt</span></span>
              </div>
              <div className="payments_kpi-foot">
                <span className="payments_dot" />
                {counts.failed === 0 ? "All cycles in good standing" : "Action needed"}
              </div>
            </article>

            <article className="portal-ui_card payments_kpi">
              <div className="payments_kpi-top">
                <div>
                  <span className="payments_kpi-label">Invoices &amp; Receipts</span>
                  <div className="payments_kpi-value">{stats.invoiceCount} Issued</div>
                </div>
                <span className="payments_kpi-icon"><span className="material-symbols-outlined">receipt_long</span></span>
              </div>
              <div className="payments_kpi-foot">Available as PDF below</div>
            </article>
          </section>

          {/* Pending banner */}
          {nextDue && (
            <section className="payments_banner">
              <div className="payments_banner-main">
                <span className="payments_banner-icon"><span className="material-symbols-outlined">credit_score</span></span>
                <div>
                  <div className="payments_banner-title">
                    <strong>{nextDue.installment} Due Soon</strong>
                    <span className="portal-ui_pill portal-ui_pill--warning">Action Required</span>
                  </div>
                  <p>
                    Your installment for <strong>{nextDue.course}</strong> matures on {nextDue.date}.
                    Pay securely by card, bank transfer or 0% installments.
                  </p>
                </div>
              </div>
              <div className="payments_banner-actions">
                <button type="button" className="portal-ui_btn portal-ui_btn--outline" onClick={() => onSelect(nextDue.id)}>
                  View Breakdown
                </button>
                <button type="button" className="portal-ui_btn portal-ui_btn--primary" onClick={() => onPay(nextDue.id)}>
                  <span className="material-symbols-outlined">lock</span>
                  Pay {money(nextDue.amount, nextDue.currency)} Now
                </button>
              </div>
            </section>
          )}

          {/* Toolbar */}
          <section className="payments_toolbar">
            <div className="payments_toolbar-top">
              <div className="payments_search">
                <span className="material-symbols-outlined">search</span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => onSearch(e.target.value)}
                  placeholder="Search by Transaction ID, program or invoice..."
                  aria-label="Search transactions"
                />
              </div>
              <button type="button" className="payments_export" onClick={onExport} title="Export ledger as CSV" aria-label="Export ledger as CSV">
                <span className="material-symbols-outlined">file_download</span>
              </button>
            </div>
            <div className="payments_toolbar-bottom">
              <div className="payments_chips">
                <span>Status:</span>
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    className={`payments_chip${status === f.value ? " payments_chip--active" : ""}`}
                    onClick={() => onStatus(f.value)}
                  >
                    {f.label} ({counts[f.value]})
                  </button>
                ))}
              </div>
              <span className="payments_count">
                Showing <strong>{transactions.length}</strong> of {counts.all} transactions
              </span>
            </div>
          </section>

          {/* Table */}
          <section className="portal-ui_card payments_table-card">
            <div className="payments_table-scroll">
              <table className="payments_table">
                <thead>
                  <tr>
                    <th>Transaction</th>
                    <th>Program / Module</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Invoice</th>
                    <th className="payments_th-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="payments_empty">
                        <span className="material-symbols-outlined">search_off</span>
                        <strong>No matching financial records found</strong>
                        <p>Try adjusting your search or reset the filters.</p>
                        <button type="button" className="portal-ui_btn portal-ui_btn--outline portal-ui_btn--sm" onClick={onReset}>
                          Reset Filters
                        </button>
                      </td>
                    </tr>
                  ) : (
                    transactions.map((t) => {
                      const pill = STATUS_PILL[t.status];
                      return (
                        <tr key={t.id}>
                          <td>
                            <div className="payments_mono payments_strong">{t.id}</div>
                            <div className="payments_sub">Inv #{t.invoice}</div>
                          </td>
                          <td className="payments_td-wide">
                            <div className="payments_medium">{t.course}</div>
                            <div className="payments_sub">{t.term}</div>
                          </td>
                          <td className="payments_nowrap">
                            <div className={t.status === "paid" ? "payments_strong" : "payments_warn"}>{t.date}</div>
                            <div className="payments_sub">{t.dateNote}</div>
                          </td>
                          <td className="payments_nowrap">
                            <div className="payments_amount">{money(t.amount, t.currency)}</div>
                            <div className="payments_sub">{t.installment}</div>
                          </td>
                          <td className="payments_nowrap">
                            <div className="payments_method">
                              <span className="material-symbols-outlined">credit_card</span>{t.method}
                            </div>
                            <div className="payments_sub">{t.methodNote}</div>
                          </td>
                          <td className="payments_nowrap">
                            <span className={`portal-ui_pill ${pill.cls}`}>
                              <span className="material-symbols-outlined payments_pill-icon">{pill.icon}</span>
                              {pill.label}
                            </span>
                          </td>
                          <td className="payments_nowrap">
                            <button
                              type="button"
                              className="portal-ui_btn portal-ui_btn--outline portal-ui_btn--sm"
                              onClick={() => onNotify(`Generating receipt for ${t.invoice}...`)}
                              title="Download receipt"
                            >
                              <span className="material-symbols-outlined">picture_as_pdf</span>
                              PDF
                            </button>
                          </td>
                          <td className="payments_nowrap payments_td-right">
                            <div className="payments_row-actions">
                              <button type="button" className="portal-ui_btn portal-ui_btn--outline portal-ui_btn--sm" onClick={() => onSelect(t.id)}>
                                {t.status === "paid" ? "View Receipt" : "Details"}
                              </button>
                              {t.status !== "paid" && (
                                <button type="button" className="portal-ui_btn portal-ui_btn--primary portal-ui_btn--sm" onClick={() => onPay(t.id)}>
                                  Pay Now
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Payment methods + support */}
          <div className="payments_bottom">
            <section className="portal-ui_card payments_panel payments_panel--methods">
              <div className="payments_panel-head">
                <div className="payments_panel-title">
                  <span className="material-symbols-outlined">credit_card</span>
                  <h2>Registered Payment Methods</h2>
                </div>
                <button type="button" className="payments_add" onClick={() => onNotify("Card setup opened.")}>
                  <span className="material-symbols-outlined">add</span>Add New Card
                </button>
              </div>

              {SAVED_METHODS.map((m) => (
                <div key={m.id} className="payments_method-card">
                  <span className="payments_brand">{m.brand}</span>
                  <div>
                    <div className="payments_method-name">
                      <strong>{m.name}</strong>
                      {m.primary && <span className="payments_primary-tag">Primary</span>}
                    </div>
                    <span className="payments_sub">{m.detail}</span>
                  </div>
                </div>
              ))}

              <div className="payments_wire">
                <div className="payments_wire-title">
                  <span className="material-symbols-outlined">account_balance</span>
                  <strong>Direct Bank Wire</strong>
                </div>
                <div className="payments_wire-grid">
                  <div><b>Beneficiary:</b> {BANK_DETAILS.beneficiary}</div>
                  <div><b>Bank:</b> {BANK_DETAILS.bank}</div>
                  <div><b>IBAN:</b> <span className="payments_mono">{BANK_DETAILS.iban}</span></div>
                  <div><b>Swift / BIC:</b> <span className="payments_mono">{BANK_DETAILS.swift}</span></div>
                </div>
                <p>* {BANK_DETAILS.note}</p>
              </div>
            </section>

            <section className="portal-ui_card payments_panel payments_panel--support">
              <div className="payments_panel-head">
                <div className="payments_panel-title">
                  <span className="material-symbols-outlined">corporate_fare</span>
                  <h2>Sponsorship &amp; Tuition Aid</h2>
                </div>
              </div>
              <div className="payments_support">
                <div>
                  <span className="material-symbols-outlined">domain_verification</span>
                  <p><strong>Corporate reimbursement:</strong> need an invoice addressed to your employer&apos;s tax ID? Request a stamped invoice from the registrar.</p>
                </div>
                <div>
                  <span className="material-symbols-outlined">support_agent</span>
                  <div>
                    <p><strong>Bursar &amp; Registrar desk:</strong> {BILLING_CONTACT.location}</p>
                    <ul className="payments_mono">
                      <li><span className="material-symbols-outlined">phone</span>{SUPPORT_PHONE}</li>
                      <li><span className="material-symbols-outlined">mail</span>{BILLING_CONTACT.email}</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="payments_support-foot">
                <span>Hours: {BILLING_CONTACT.hours}</span>
                <button type="button" onClick={() => onNotify("Billing ticket opened with the finance desk.")}>
                  Open Billing Ticket →
                </button>
              </div>
            </section>
          </div>
        </>
      )}

      {selected && (
        <TransactionDialog
          transaction={selected}
          studentName={getStoredUser()?.name ?? "Learner"}
          onClose={onCloseDialog}
          onPay={onPay}
          onNotify={onNotify}
        />
      )}
    </div>
  );
}

export default memo(PaymentsComponent);
