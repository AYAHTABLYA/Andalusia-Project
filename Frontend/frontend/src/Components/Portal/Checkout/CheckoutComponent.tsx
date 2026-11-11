import { memo } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Breadcrumb from "../../Academy/Shared/Breadcrumb";
import Dialog from "../Shared/Dialog";
import CardPreview from "./CardPreview";
import { ACCEPTED_BRANDS } from "./constants";
import { SUPPORT_PHONE } from "../../Academy/Navbar/constants";
import { formatAmount } from "../../../utils/format";
import type {
  CardBrand,
  CardErrors,
  CardForm,
  CheckoutOutcome,
  CheckoutStatus,
  CheckoutTarget,
} from "../../../Types/Checkout";
import "../Shared/style.css";
import "./style.css";

type Props = {
  target: CheckoutTarget;
  card: CardForm;
  errors: CardErrors;
  brand: CardBrand;
  status: CheckoutStatus;
  outcome: CheckoutOutcome | null;
  onField: (field: keyof CardForm, value: string) => void;
  onSubmit: () => void;
  onSimulateFailure: () => void;
  onBack: () => void;
  onDismiss: () => void;
  onRetry: () => void;
  onContinue: () => void;
};

const STEP_LABEL = { done: "Completed", active: "Active Now", todo: "Final Step" } as const;

function CheckoutComponent({
  target, card, errors, brand, status, outcome,
  onField, onSubmit, onSimulateFailure, onBack, onDismiss, onRetry, onContinue,
}: Props) {
  const money = (amount: number) => `${target.currency} ${formatAmount(amount)}`;
  const processing = status === "processing";

  const steps = [
    { n: "01", state: "done", title: "Application Submitted", text: `${target.applicationRef} • ${target.itemType}` },
    { n: "02", state: "active", title: "Payment & Card Details", text: "Order Summary + Secure Sandbox Gateway" },
    { n: "03", state: "todo", title: "Confirmation & Enrollment", text: "Receipt & Immediate Workspace Access" },
  ] as const;

  const bind =
    (field: keyof CardForm) => (e: ChangeEvent<HTMLInputElement>) => onField(field, e.target.value);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="checkout">
      <Breadcrumb
        items={[
          { label: "Student Workspace", to: "/profile" },
          { label: "Payments" },
          { label: target.applicationRef },
          { label: "Checkout" },
        ]}
      />

      <div>
        <button type="button" className="portal-ui_btn portal-ui_btn--outline portal-ui_btn--sm" onClick={onBack}>
          <span className="material-symbols-outlined icon-dir">arrow_back</span>
          Back to Payments
        </button>
      </div>

      {/* Progress */}
      <ol className="portal-ui_card checkout_steps" aria-label="Checkout progress">
        {steps.map((s) => (
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
              <span className="portal-ui_pill portal-ui_pill--warning">
                <span className="checkout_dot" /> Awaiting Payment
              </span>
              <span className="checkout_ref">REF: {target.applicationRef}</span>
            </div>
            <h2 className="checkout_program">{target.title}</h2>
            <p className="checkout_muted">{`${target.itemType} application`}</p>

            {(target.scheduleLabel || target.startDate) && (
              <ul className="checkout_facts">
                {target.scheduleLabel && (
                  <li>
                    <span className="material-symbols-outlined">location_on</span>
                    <div><strong>{target.scheduleLabel}</strong><span>Selected schedule</span></div>
                  </li>
                )}
                {target.startDate && (
                  <li>
                    <span className="material-symbols-outlined">calendar_month</span>
                    <div><strong>Starts {target.startDate}</strong><span>First session</span></div>
                  </li>
                )}
              </ul>
            )}
          </article>

          <article className="portal-ui_card checkout_panel">
            <div className="checkout_row-between checkout_panel-head">
              <h3><span className="material-symbols-outlined">receipt_long</span> Order Summary</h3>
              <span className="portal-ui_pill portal-ui_pill--muted">One-time payment</span>
            </div>

            <ul className="checkout_lines">
              <li>
                <div><strong>{target.title}</strong><span>{`${target.itemType} tuition`}</span></div>
                <b>{money(target.amount)}</b>
              </li>
            </ul>

            <div className="checkout_total">
              <div>
                <span className="checkout_total-label">Total Due Now</span>
                <span className="checkout_muted">{`Tuition as published for this ${target.itemType.toLowerCase()}`}</span>
              </div>
              <div className="checkout_total-amount">
                <strong>{money(target.amount)}</strong>
                <span>{target.currency}</span>
              </div>
            </div>

            <p className="checkout_guarantee">
              <span className="material-symbols-outlined">verified</span>
              Your enrollment is created as soon as the payment is confirmed.
            </p>
          </article>
        </section>

        {/* Right: card form */}
        <section className="portal-ui_card checkout_panel checkout_pay">
          <div className="checkout_sandbox" role="note">
            <span className="material-symbols-outlined">science</span>
            <div>
              <strong>Sandbox Payment Gateway</strong>
              <p>
                Card details are checked in your browser only. No card number or CVV is sent to
                the server or stored; only the payment result is recorded.
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
                  placeholder="Name as printed on the card" value={card.name} onChange={bind("name")}
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
                <strong>Notice:</strong> No account password is required for card checkout. With a
                live 3-D Secure gateway, your issuing bank would send a one-time OTP to your
                registered mobile device.
              </p>
            </div>

            <button type="submit" className="portal-ui_btn portal-ui_btn--primary checkout_submit" disabled={processing}>
              <span className={`material-symbols-outlined${processing ? " checkout_spin" : ""}`}>
                {processing ? "progress_activity" : "verified"}
              </span>
              {processing ? "Processing with Banking Gateway..." : `Confirm Payment (${money(target.amount)})`}
            </button>
            <button type="button" className="portal-ui_btn portal-ui_btn--outline checkout_fail"
              onClick={onSimulateFailure} disabled={processing}>
              <span className="material-symbols-outlined">bug_report</span>
              Simulate Gateway Failure (Sandbox Test)
            </button>
          </form>
        </section>
      </div>

      {/* Outcome dialogs */}
      {outcome?.kind === "success" && (
        <Dialog
          icon="check_circle"
          title="Payment Confirmed!"
          subtitle="Your payment was recorded and your enrollment is confirmed."
          onClose={onDismiss}
          footer={
            <>
              <button type="button" className="portal-ui_btn portal-ui_btn--outline" onClick={onDismiss}>
                Back to Payments
              </button>
              <button type="button" className="portal-ui_btn portal-ui_btn--primary" onClick={onContinue}>
                <span className="material-symbols-outlined">school</span>
                Go to My Enrollments (الانتقال إلى تسجيلاتي)
              </button>
            </>
          }
        >
          <dl className="checkout_receipt">
            <div><dt>Transaction Ref</dt><dd className="checkout_mono">{outcome.receipt.reference}</dd></div>
            <div><dt>Application</dt><dd className="checkout_mono">{outcome.receipt.applicationRef}</dd></div>
            <div><dt>Course / Program</dt><dd>{outcome.receipt.program}</dd></div>
            <div><dt>Schedule</dt><dd>{outcome.receipt.cohort}</dd></div>
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
          title="Payment Not Completed"
          subtitle={`Error code: ${outcome.failure.code}`}
          onClose={onDismiss}
          footer={
            <>
              <a className="portal-ui_btn portal-ui_btn--outline" href={`tel:${SUPPORT_PHONE.replace(/[^\d+]/g, "")}`}>
                <span className="material-symbols-outlined">support_agent</span>
                Contact Campus Bursar • <bdi dir="ltr">{SUPPORT_PHONE}</bdi>
              </a>
              <button type="button" className="portal-ui_btn portal-ui_btn--primary" onClick={onRetry}>
                <span className="material-symbols-outlined">refresh</span>
                Try Again
              </button>
            </>
          }
        >
          <div className="checkout_failure">
            <span className="material-symbols-outlined">warning</span>
            <div>
              <strong>Reason:</strong>
              <p>{outcome.failure.reason}</p>
              <small>Payment reference: <span className="checkout_mono">{outcome.failure.traceId}</span></small>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}

export default memo(CheckoutComponent);
