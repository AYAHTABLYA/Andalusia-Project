import { useEffect, useMemo, useState } from "react";
import { getStaffPayouts } from "../../../apis/staffApi";
import type { StaffPayoutDto } from "../../../apis/staffApi";
import { downloadCsv } from "../../../utils/csv";
import "../style.css";

const ago = (v: string) => {
  const m = Math.max(0, Math.round((Date.now() - new Date(v).getTime()) / 60000));
  if (m < 60) return `${m || 1} min ago`;
  if (m < 1440) return `${Math.round(m / 60)} hours ago`;
  return `${Math.round(m / 1440)} days ago`;
};

// Instructor earnings (AHA design): this month's total with a monthly bar chart + recent approved items.
export default function InstructorEarnings() {
  const [payouts, setPayouts] = useState<StaffPayoutDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const c = new AbortController();
    getStaffPayouts(c.signal)
      .then((p) => !c.signal.aborted && setPayouts(p))
      .catch((e: unknown) => !c.signal.aborted && setError(e instanceof Error ? e.message : "Could not load earnings."))
      .finally(() => !c.signal.aborted && setLoading(false));
    return () => c.abort();
  }, []);

  const currency = payouts[0]?.currency ?? "EGP";
  const view = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 8 }, (_, i) => new Date(now.getFullYear(), now.getMonth() - (7 - i), 1));
    const totals = months.map((m) =>
      payouts.filter((p) => { const d = new Date(p.createdAt); return d.getFullYear() === m.getFullYear() && d.getMonth() === m.getMonth(); })
        .reduce((s, p) => s + p.amount, 0));
    const max = Math.max(...totals, 1);
    const recent = [...payouts].sort((a, b) => +new Date(b.paidAt ?? b.createdAt) - +new Date(a.paidAt ?? a.createdAt)).slice(0, 6);
    return { months, totals, max, thisMonth: totals[7], recent };
  }, [payouts]);

  const exportReport = () =>
    downloadCsv("my-earnings.csv", [
      ["Date", "Item", "Amount", "Currency", "Status"],
      ...payouts.map((p) => [new Date(p.createdAt).toLocaleDateString("en-CA"), p.scheduleId ? `Schedule #${p.scheduleId}` : p.notes || "—", p.amount, p.currency, String(p.status)]),
    ]);

  return (
    <div className="staff-dashboard staff-workspace-page">
      <header className="staff-page_head">
        <div>
          <div className="staff-eyebrow">AHA ACADEMY</div>
          <h1 className="staff-page_title">Instructor earnings</h1>
          <p className="staff-page_sub">A transparent view of approved and pending compensation.</p>
        </div>
        <button className="staff-workspace-primary" onClick={exportReport} disabled={!payouts.length}>Export report</button>
      </header>
      {error && <p className="staff-workspace-notice" role="alert">Could not load live data: {error}</p>}
      <div className="ins-earn">
        <section className="staff-card">
          <span className="ins-earn_icon material-symbols-outlined">account_balance_wallet</span>
          <small className="ins-earn_label">Earned this month</small>
          <strong className="ins-earn_total">{loading ? "…" : `${view.thisMonth.toLocaleString("en-US")} ${currency}`}</strong>
          <div className="ins-bars" role="img" aria-label="Earnings for the last 8 months">
            {view.totals.map((t, i) => (
              <span key={i} className="ins-bar" style={{ height: `${Math.max(8, (t / view.max) * 100)}%` }}
                title={`${new Intl.DateTimeFormat("en-US", { month: "short" }).format(view.months[i])}: ${t.toLocaleString("en-US")} ${currency}`} />
            ))}
          </div>
        </section>
        <section className="staff-card">
          <div className="staff-card_head"><h2>Recent items</h2></div>
          {view.recent.length ? view.recent.map((p) => (
            <div className="ins-item" key={p.id}>
              <span className="ins-item_check material-symbols-outlined">check</span>
              <span className="ins-item_main">
                <strong>{p.scheduleId ? `Schedule #${p.scheduleId}` : p.notes || "Payout"}</strong>
                <small>Updated {ago(p.paidAt ?? p.createdAt)} · {p.amount.toLocaleString("en-US")} {p.currency}</small>
              </span>
              <span className={`staff-pill${String(p.status) === "Cancelled" ? " staff-pill--off" : ""}`}>
                {String(p.status) === "Paid" ? "Approved" : String(p.status) === "Pending" ? "Active" : String(p.status)}
              </span>
            </div>
          )) : <p className="staff-empty">{loading ? "Loading…" : "No earnings items yet."}</p>}
        </section>
      </div>
    </div>
  );
}
