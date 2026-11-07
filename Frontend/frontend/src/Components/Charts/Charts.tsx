import type { ReactNode } from "react";
import "./charts.css";

// Dependency-free SVG charts shared by every dashboard. They only draw what they are given:
// no value is invented, and an all-zero / empty dataset shows the empty note instead of a fake chart.

type BarDatum = { label: string; value: number; highlight?: boolean };
type Segment = { label: string; value: number };

function BarChart({ data, ariaLabel, unit = "" }: { data: BarDatum[]; ariaLabel: string; unit?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const slot = 56;
  const width = Math.max(1, data.length) * slot;
  const top = 18; // room for the value label
  const base = 120; // baseline y
  return (
    <svg className="chart-bars" viewBox={`0 0 ${width} 148`} role="img" aria-label={ariaLabel} preserveAspectRatio="xMidYMid meet">
      <line x1="0" x2={width} y1={base} y2={base} className="chart-axis" />
      {data.map((d, i) => {
        const h = d.value > 0 ? Math.max(4, ((base - top) * d.value) / max) : 0;
        const x = i * slot + slot / 2;
        return (
          <g key={`${d.label}-${i}`}>
            <title>{`${d.label}: ${d.value}${unit}`}</title>
            <rect x={x - 14} y={base - h} width="28" height={h} rx="6" className={d.highlight ? "chart-bar chart-bar--hi" : "chart-bar"} />
            <text x={x} y={base - h - 6} textAnchor="middle" className="chart-val">{d.value}{unit}</text>
            <text x={x} y={base + 16} textAnchor="middle" className="chart-lbl">{d.label.length > 9 ? `${d.label.slice(0, 8)}…` : d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function DonutChart({ segments, centerValue, centerLabel, ariaLabel }: { segments: Segment[]; centerValue: string | number; centerLabel: string; ariaLabel: string }) {
  const total = segments.reduce((n, s) => n + s.value, 0);
  const r = 40;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="chart-donut">
      <svg viewBox="0 0 100 100" role="img" aria-label={ariaLabel}>
        <circle cx="50" cy="50" r={r} className="chart-ring" />
        {total > 0 &&
          segments.map((s, i) => {
            if (s.value <= 0) return null;
            const len = (s.value / total) * c;
            const el = (
              <circle
                key={s.label}
                cx="50" cy="50" r={r}
                className={`chart-seg chart-c${i % 5}`}
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
                transform="rotate(-90 50 50)"
              >
                <title>{`${s.label}: ${s.value}`}</title>
              </circle>
            );
            offset += len;
            return el;
          })}
        <text x="50" y="49" textAnchor="middle" className="chart-center">{centerValue}</text>
        <text x="50" y="62" textAnchor="middle" className="chart-center-sub">{centerLabel}</text>
      </svg>
      <ul className="chart-legend">
        {segments.map((s, i) => (
          <li key={s.label}><i className={`chart-dot chart-c${i % 5}`} />{s.label}<strong>{s.value}</strong></li>
        ))}
      </ul>
    </div>
  );
}

// Card around a chart. `empty` replaces the chart with a note when there is nothing to plot.
function ChartCard({ title, subtitle, empty, className = "staff-card", children }: { title: string; subtitle?: string; empty?: string; className?: string; children: ReactNode }) {
  return (
    <section className={`${className} chart-card`}>
      <header className="chart-card_head">
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </header>
      {empty ? <p className="chart-empty">{empty}</p> : children}
    </section>
  );
}

export type { BarDatum, Segment };
export { BarChart, DonutChart, ChartCard };
