import { memo } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Breadcrumb from "../../Academy/Shared/Breadcrumb";
import Dialog from "../Shared/Dialog";
import CardPreview from "./CardPreview";
import { ACCEPTED_BRANDS, ORDER, VAT_LINE } from "./constants";
import { SUPPORT_PHONE } from "../../Academy/Navbar/constants";
import { formatAmount } from "../../../utils/format";
import type {
  CardBrand,
  CardErrors,
  CardForm,
  CheckoutLine,
  CheckoutOutcome,
  CheckoutStatus,
} from "../../../Types/Checkout";
import "../Shared/style.css";
import "./style.css";

type Props = {
  card: CardForm;
  errors: CardErrors;
  brand: CardBrand;
  status: CheckoutStatus;
  outcome: CheckoutOutcome | null;
  lines: CheckoutLine[];
  vat: number;
  total: number;
  onField: (field: keyof CardForm, value: string) => void;
  onSubmit: () => void;
  onSimulateFailure: () => void;
  onDismiss: () => void;
  onContinue: () => void;
  onDownloadReceipt: () => void;
};

const STEPS = [
  { n: "01", state: "done", title: "Course & Schedule Select", text: "Alexandria Cohort • Nov 25, 2025" },
  { n: "02", state: "active", title: "Payment & Card Simulation", text: "Order Summary + Secure Sandbox Gateway" },
  { n: "03", state: "todo", title: "Outcome & Confirmation", text: "e-Receipt & Immediate LMS Activation" },
] as const;

const STEP_LABEL = { done: "Completed", active: "Active Now", todo: "Final Step" } as const;

function CheckoutComponent({
  card, errors, brand, status, outcome, lines, vat, total,
  onField, onSubmit, onSimulateFailure, onDismiss, onContinue, onDownloadReceipt,
}: Props) {
  const money = (amount: number) => `${ORDER.currency} ${formatAmount(amount)}`;
  const processing = status === "processing";

  const bind =
    (field: keyof CardForm) => (e: ChangeEvent<HTMLInputElement>) => onField(field, e.target.value);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const allLines: CheckoutLine[] = [...lines, { ...VAT_LINE, amount: vat }];

  return (
    <div className="checkout">
      <Breadcrumb
        items={[
          { label: "Student Workspace", to: "/profile" },
          { label: "Admissions", to: "/applications" },
          { label: ORDER.applicationRef },
          { label: "Tuition Checkout" },
        ]}
      />

      {/* Progress */}
      <ol className="portal-ui_card checkout_steps" aria-label="Checkout progress">
        {STEPS.map((s) => (
          <li key={s.n} className={`checkout_step checkout_step--${s.state}`}>
            <span className="checkout_step-dot">
              {s.state === "done" ? <span className="material-symbols-outlined">check</span> : s.n}
            </span>
            <div>
              <span className="checkout_step-kicker">Step {s.n} • {STEP_LABEL[s.state]}</span>
              <strong>{s.title}</strong>
              <span className="checkout_step-text">{s.text}</span>
            </div>
          </li>
        ))}
      </ol>

      <div className="checkout_grid">
        {/* Left: order summary */}
        <section className="checkout_summary">
          <article className="portal-ui_card checkout_panel checkout_panel--accent">
            <div className="checkout_row-between">
              <span className="portal-ui_pill portal-ui_pill--success">
                <span className="checkout_dot" /> Cleared for Matriculation
              </span>
              <span className="checkout_ref">REF: {ORDER.applicationRef}</span>
            </div>
            <h2 className="checkout_program">{ORDER.program}</h2>
            <p className="checkout_muted">{ORDER.moduleSummary}</p>

            <ul className="checkout_facts">
              <li>
                <span className="material-symbols-outlined">location_on</span>
                <div><strong>{ORDER.campus}</strong><span>{ORDER.campusNote}</span></div>
              </li>
              <li>
                <span className="material-symbols-outlined">calendar_month</span>
                <div><strong>{ORDER.startsOn}</strong><span>{ORDER.schedule}</span></div>
              </li>
              <li>
                <span className="material-symbols-outlined">school</span>
                <div><strong>{ORDER.accreditation}</strong><span>{ORDER.accreditationNote}</span></div>
              </li>
            </ul>

            <div className="checkout_lab">
              <span className="material-symbols-outlined">terminal</span>
              <strong>Dedicated Cloud FinTech Sandbox Access</strong>
              <span className="portal-ui_pill portal-ui_pill--warning">Included</span>
            </div>
          </article>

          <article className="portal-ui_card checkout_panel">
            <div className="checkout_row-between checkout_panel-head">
              <h3><span className="material-symbols-outlined">receipt_long</span> Itemized Tuition Schedule</h3>
              <span className="portal-ui_pill portal-ui_pill--muted">{ORDER.planLabel}</span>
            </div>

            <ul className="checkout_lines">
              {allLines.map((line) => (
                <li key={line.label}>
                  <div><strong>{line.label}</strong><span>{line.note}</span></div>
                  <b>{money(line.amount)}</b>
                </li>
              ))}
            </ul>

            <div className="checkout_total">
              <div>
                <span className="checkout_total-label">Total Due Now</span>
                <span className="checkout_muted">Includes all taxes and campus credentials</span>
              </div>
              <div className="checkout_total-amount">
                <strong>{money(total)}</strong>
                <span>{ORDER.currency} ({ORDER.usdApprox})</span>
              </div>
            </div>

            <p className="checkout_guarantee">
              <span className="material-symbols-outlined">verified</span>
              Institutional Guarantee: Official Tax Invoice provided upon validation.
            </p>
          </article>
        </section>

        {/* Right: card form */}
        <section className="portal-ui_card checkout_panel checkout_pay">
          <div className="checkout_sandbox" role="note">
            <span className="material-symbols-outlined">science</span>
            <div>
              <strong>Demo Payment Simulation Sandbox</strong>
              <p>
                Card credentials entered here are strictly client-side for UI testing. No sensitive
                card data or CVV is transmitted or stored in the database.
              </p>
            </div>
          </div>

          <CardPreview card={card} brand={brand} />

          <form className="checkout_form" onSubmit={handleSubmit} noValidate>
            <div className="portal-ui_field">
              <label htmlFor="cardName">Cardholder Full Name (اسم حامل الكارت)</label>
              <div className="checkout_input">
                <span className="material-symbols-outlined">person</span>
                <input id="cardName" className="portal-ui_input" type="text" autoComplete="cc-name"
                  placeholder="e.g. Ahmed Samy Al-Mansoor" value={card.name} onChange={bind("name")}
                  aria-invalid={!!errors.name} />
              </div>
              {errors.name && <span className="checkout_error">{errors.name}</span>}
            </div>

            <div className="portal-ui_field">
              <div className="checkout_row-between">
                <label htmlFor="cardNumber">Card Number (رقم الكارت)</label>
                <span className="checkout_brands">
                  {ACCEPTED_BRANDS.map((b) => <span key={b}>{b}</span>)}
                </span>
              </div>
              <div className="checkout_input">
                <span className="material-symbols-outlined">credit_card</span>
                <input id="cardNumber" className="portal-ui_input checkout_mono" type="text"
                  inputMode="numeric" autoComplete="cc-number" maxLength={19}
                  placeholder="4000 1234 5678 9010" value={card.number} onChange={bind("number")}
                  aria-invalid={!!errors.number} />
              </div>
              {errors.number && <span className="checkout_error">{errors.number}</span>}
            </div>

            <div className="checkout_two">
              <div className="portal-ui_field">
                <label htmlFor="cardExpiry">Expiry Date (تاريخ الانتهاء)</label>
                <div className="checkout_input">
                  <span className="material-symbols-outlined">calendar_today</span>
                  <input id="cardExpiry" className="portal-ui_input checkout_mono" type="text"
                    inputMode="numeric" autoComplete="cc-exp" maxLength={5} placeholder="MM/YY"
                    value={card.expiry} onChange={bind("expiry")} aria-invalid={!!errors.expiry} />
                </div>
                {errors.expiry && <span className="checkout_error">{errors.expiry}</span>}
              </div>

              <div className="portal-ui_field">
                <label htmlFor="cardCvv">CVV (الـ CVV)</label>
                <div className="checkout_input">
                  <span className="material-symbols-outlined">lock</span>
                  <input id="cardCvv" className="portal-ui_input checkout_mono" type="password"
                    inputMode="numeric" autoComplete="cc-csc" maxLength={3} placeholder="•••"
                    value={card.cvv} onChange={bind("cvv")} aria-invalid={!!errors.cvv} />
                </div>
                {errors.cvv && <span className="checkout_error">{errors.cvv}</span>}
              </div>
            </div>

            <div className="checkout_notice">
              <span className="material-symbols-outlined">info</span>
              <p>
                <strong>Notice:</strong> No account password field is required for card checkout. In
                authentic 3-D Secure banking workflows, your issuing bank will dispatch a one-time
                OTP directly to your registered mobile device.
              </p>
            </div>

            <button type="submit" className="portal-ui_btn portal-ui_btn--primary checkout_submit" disabled={processing}>
              <span className={`material-symbols-outlined${processing ? " checkout_spin" : ""}`}>
                {processing ? "progress_activity" : "verified"}
              </span>
              {processing ? "Processing with Banking Gateway..." : `Confirm Payment (${money(total)})`}
            </button>
            <button type="button" className="portal-ui_btn portal-ui_btn--outline checkout_fail"
              onClick={onSimulateFailure} disabled={processing}>
              <span className="material-symbols-outlined">bug_report</span>
              Simulate Gateway Failure / Error Response (Test Handler)
            </button>
          </form>
        </section>
      </div>

      {/* Outcome dialogs */}
      {outcome?.kind === "success" && (
        <Dialog
          icon="check_circle"
          title="Matriculation Confirmed!"
          subtitle="Transaction approved & settled by the Meeza Gateway simulator."
          onClose={onDismiss}
          footer={
            <>
              <button type="button" className="portal-ui_btn portal-ui_btn--outline" onClick={onDownloadReceipt}>
                <span className="material-symbols-outlined">download</span>
                Download Tax Invoice (PDF)
              </button>
              <button type="button" className="portal-ui_btn portal-ui_btn--primary" onClick={onContinue}>
                <span className="material-symbols-outlined">school</span>
                Proceed to My Courses (الانتقال إلى كورساتي)
              </button>
            </>
          }
        >
          <dl className="checkout_receipt">
            <div><dt>Official Transaction Ref</dt><dd className="checkout_mono">{outcome.receipt.reference}</dd></div>
            <div><dt>Student Application</dt><dd className="checkout_mono">{outcome.receipt.applicationRef}</dd></div>
            <div><dt>Program Track</dt><dd>{outcome.receipt.program}</dd></div>
            <div><dt>Campus Cohort</dt><dd>{outcome.receipt.cohort}</dd></div>
            <div className="checkout_receipt-total">
              <dt>Total Cleared Amount</dt>
              <dd>{outcome.receipt.currency} {formatAmount(outcome.receipt.total)}</dd>
            </div>
          </dl>
        </Dialog>
      )}

      {outcome?.kind === "failed" && (
        <Dialog
          icon="error"
          title="Payment Processing Denied"
          subtitle={`Simulation Error Response: Code #${outcome.failure.code}`}
          onClose={onDismiss}
          footer={
            <>
              <a className="portal-ui_btn portal-ui_btn--outline" href={`tel:${SUPPORT_PHONE.replace(/[^\d+]/g, "")}`}>
                <span className="material-symbols-outlined">support_agent</span>
                Contact Campus Bursar • {SUPPORT_PHONE}
              </a>
              <button type="button" className="portal-ui_btn portal-ui_btn--primary" onClick={onDismiss}>
                <span className="material-symbols-outlined">refresh</span>
                Try Again with Alternate Method
              </button>
            </>
          }
        >
          <div className="checkout_failure">
            <span className="material-symbols-outlined">warning</span>
            <div>
              <strong>Rejection Reason:</strong>
              <p>{outcome.failure.reason}</p>
              <small>Gateway Trace ID: <span className="checkout_mono">{outcome.failure.traceId}</span></small>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}

export default memo(CheckoutComponent);
