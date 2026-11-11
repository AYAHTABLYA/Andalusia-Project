import { useState } from "react";
import { getAdminReports } from "../../../../apis/staffAdminApi";
import { getStaffAssignments, getStaffPayouts, getStaffSchedule } from "../../../../apis/staffApi";
import type { StaffAssignmentDto, StaffPayoutDto, StaffSessionDto } from "../../../../apis/staffApi";
import { BarChart, ChartCard, DonutChart } from "../../../Charts/Charts";
import { payoutSegments, submissionBars, weekBars } from "../../Shared/overviewData";
import type { AdminReportRecord, AdminReportsDto } from "../../../../apis/staffAdminApi";
import useDebouncedValue from "../../../../hooks/academyHooks/useDebouncedValue";
import useIsCoordinator from "../../../../hooks/staffHooks/useIsCoordinator";
import useStaffData from "../../../../hooks/staffHooks/useStaffData";
import useStaffTable from "../../../../hooks/staffHooks/useStaffTable";
import WorkspaceTableComponent from "../../Shared/WorkspaceTable/WorkspaceTableComponent";
import type { Action, Stat } from "../../Shared/WorkspaceTable/WorkspaceTableComponent";
import { cairoDate, TZ } from "../../time";
import Select from "../../../Shared/Select/Select";

const COLUMNS = ["Report", "Period", "Updated", "Status"];
const PERIODS = ["This week", "This month", "This year", "All time"];

const toRow = (r: AdminReportRecord) => [r.report, r.period, new Date(r.updated).toLocaleString(), r.status];

function rangeFor(period: string): { from: string; to: string } | undefined {
  const n = new Date();
  const y = n.getFullYear(), m = n.getMonth();
  const iso = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: TZ });
  if (period === "This week") {
    const mon = new Date(y, m, n.getDate() - ((n.getDay() + 6) % 7));
    return { from: iso(mon), to: iso(new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + 6)) };
  }
  if (period === "This month") return { from: iso(new Date(y, m, 1)), to: iso(new Date(y, m + 1, 0)) };
  if (period === "This year") return { from: `${y}-01-01`, to: `${y}-12-31` };
  if (period === "All time") return { from: "2000-01-01", to: cairoDate() };
  return undefined;
}

// /admin/reports and /coordinator/reports. A Coordinator never sees revenue or the financial report.
function ReportsContainer() {
  const isCoordinator = useIsCoordinator();
  const [period, setPeriod] = useState("This month");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search.trim(), 300);

  const { data, loading, error } = useStaffData<AdminReportsDto | null>(
    (signal) => {
      const range = rangeFor(period);
      return getAdminReports({ from: range?.from, to: range?.to, search: debounced || undefined }, signal);
    },
    null,
    "Could not load reports.",
    [period, debounced],
  );
  const table = useStaffTable(data?.records ?? [], toRow);

  // Charts use the same real endpoints as the overviews. Each one is independent: if one fails its card just shows empty.
  const sessions = useStaffData<StaffSessionDto[]>(
    (signal) => { const r = rangeFor(period); return getStaffSchedule({ from: r?.from, to: r?.to }, signal); },
    [], "Could not load sessions.", [period],
  );
  const assignments = useStaffData<StaffAssignmentDto[]>((signal) => getStaffAssignments(signal), [], "Could not load assignments.");
  const payouts = useStaffData<StaffPayoutDto[]>(
    (signal) => (isCoordinator ? Promise.resolve([]) : getStaffPayouts(signal)), [], "Could not load payouts.",
  );
  const bars = submissionBars(assignments.data);
  const onQueryChange = (value: string) => { table.setQuery(value); setSearch(value); };

  const stats: Stat[] = [
    { label: "Student growth", value: data?.studentGrowth, icon: "trending_up" },
    { label: "Sessions delivered", value: data?.sessionsDelivered, icon: "event_available" },
    ...(isCoordinator ? [] : [{ label: "Revenue", value: data?.revenue, icon: "payments" }]),
  ];
  const secondary: Action[] = [
    ...(isCoordinator ? [] : [{ label: "Financial report", onClick: () => onQueryChange("Financial report") }]),
    { label: "Export report", onClick: () => setNotice(table.exportCsv("academy-reports.csv", COLUMNS) ? "" : "Nothing to export yet.") },
  ];

  return (
    <WorkspaceTableComponent
      eyebrow="INSIGHTS"
      title="Academy reports"
      subtitle="Operational, learning, and financial performance in one place."
      icon="analytics"
      stats={stats}
      columns={COLUMNS}
      rows={table.rows}
      query={table.query}
      onQueryChange={onQueryChange}
      onReset={() => { onQueryChange(""); setPeriod("This month"); }}
      primaryAction={{ label: "Operational report", onClick: () => { setNotice(""); onQueryChange("Operational report"); } }}
      secondaryActions={secondary}
      headerExtras={
        <label className="staff-select-label">
          Period{" "}
          <Select className="staff-select" value={period} onChange={(e) => setPeriod(e.target.value)}>
            {PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}
          </Select>
        </label>
      }
      afterStats={
        <div className="ov-charts">
          <ChartCard title="Sessions by weekday" subtitle={`Delivered and scheduled, ${period.toLowerCase()}`} empty={!sessions.loading && sessions.data.length === 0 ? "No sessions in this period." : undefined}>
            <BarChart data={weekBars(sessions.data)} ariaLabel="Sessions per weekday in the selected period" />
          </ChartCard>
          <ChartCard title="Assignment submissions" subtitle="Busiest assignments" empty={!assignments.loading && bars.length === 0 ? "No submissions yet." : undefined}>
            <BarChart data={bars} ariaLabel="Submissions per assignment" />
          </ChartCard>
          {!isCoordinator && (
            <ChartCard title="Instructor payouts" subtitle="By status, all time" empty={!payouts.loading && payouts.data.length === 0 ? "No payouts recorded." : undefined}>
              <DonutChart segments={payoutSegments(payouts.data)} centerValue={payouts.data.length} centerLabel="payouts" ariaLabel="Payouts by status" />
            </ChartCard>
          )}
        </div>
      }
      footerExtra={<span>Period: {period}</span>}
      notice={notice}
      error={error}
      loading={loading}
      emptyNote="Reports are calculated from enrollments, completed sessions and successful payments for the selected period."
    />
  );
}

export default ReportsContainer;
