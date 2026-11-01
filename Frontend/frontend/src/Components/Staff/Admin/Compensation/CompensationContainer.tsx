import { useState } from "react";
import { getStaffPayouts, updateStaffPayoutStatus } from "../../../../apis/staffApi";
import type { StaffPayoutDto } from "../../../../apis/staffApi";
import useStaffData from "../../../../hooks/staffHooks/useStaffData";
import useStaffTable from "../../../../hooks/staffHooks/useStaffTable";
import WorkspaceTableComponent from "../../Shared/WorkspaceTable/WorkspaceTableComponent";
import { isStatus, statusLabel } from "../../time";

const COLUMNS = ["Instructor", "Period", "Sessions", "Amount", "Approval status"];
const EMPTY: StaffPayoutDto[] = [];

const toRow = (r: StaffPayoutDto) => [
  r.instructorName,
  new Date(r.createdAt).toLocaleDateString(),
  r.scheduleId ? `Schedule #${r.scheduleId}` : "—",
  `${r.amount} ${r.currency}`,
  statusLabel(r.status),
];
const sameMonth = (value: string | null) => {
  if (!value) return false;
  const d = new Date(value), n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth();
};
const isPending = (p: StaffPayoutDto) => isStatus(p.status, "pending");

// /admin/compensation (Admin only): review instructor payouts, mark them paid or cancel them.
function CompensationContainer() {
  const [notice, setNotice] = useState("");
  const [pendingOnly, setPendingOnly] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  const { data, loading, error, reload } = useStaffData(
    (signal) => getStaffPayouts(signal),
    EMPTY,
    "Could not load payouts.",
  );
  const table = useStaffTable(data, toRow, (p) => !pendingOnly || isPending(p));

  const currency = data[0]?.currency ?? "EGP";
  const money = (list: StaffPayoutDto[]) => `${list.reduce((a, r) => a + r.amount, 0).toLocaleString("en-US")} ${currency}`;
  const ready = !loading && !error;

  async function changeStatus(payout: StaffPayoutDto, status: "Paid" | "Cancelled") {
    setBusyId(payout.id);
    setNotice("");
    try {
      await updateStaffPayoutStatus(payout.id, status);
      setNotice(`Payout #${payout.id} marked ${status.toLowerCase()}.`);
      reload();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Could not update this payout.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <WorkspaceTableComponent
      eyebrow="AHA ACADEMY"
      title="Compensation & payouts"
      subtitle="Review instructor earnings, approvals, and payout history."
      icon="payments"
      stats={[
        { label: "Pending payout", value: ready ? money(data.filter(isPending)) : undefined, icon: "pending_actions" },
        { label: "Paid this month", value: ready ? money(data.filter((r) => isStatus(r.status, "paid") && sameMonth(r.paidAt))) : undefined, icon: "task_alt" },
        { label: "Recent transactions", value: ready ? data.length : undefined, icon: "receipt_long" },
      ]}
      columns={COLUMNS}
      rows={table.rows}
      query={table.query}
      onQueryChange={table.setQuery}
      onReset={() => { table.setQuery(""); setPendingOnly(false); }}
      primaryAction={{ label: pendingOnly ? "Show all payouts" : "Review pending", onClick: () => { setNotice(""); setPendingOnly((p) => !p); } }}
      secondaryActions={[{ label: "Export transactions", onClick: () => setNotice(table.exportCsv("compensation.csv", COLUMNS) ? "" : "Nothing to export yet.") }]}
      notice={notice}
      error={error}
      loading={loading}
      emptyNote="Compensation data is intentionally separate from student payments and academy revenue."
      rowActions={(i) => {
        const payout = table.visible[i];
        if (!isPending(payout)) return "—";
        return (
          <span className="staff-row-actions">
            <button className="staff-workspace-secondary" disabled={busyId === payout.id} onClick={() => void changeStatus(payout, "Paid")}>Mark paid</button>
            <button className="staff-workspace-secondary" disabled={busyId === payout.id} onClick={() => void changeStatus(payout, "Cancelled")}>Cancel</button>
          </span>
        );
      }}
    />
  );
}

export default CompensationContainer;
