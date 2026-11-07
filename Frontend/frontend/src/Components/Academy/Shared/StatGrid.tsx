import "./style.css";

function StatGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="stat-grid_box-1">
      {items.map((s) => (
        <div key={s.label} className="stat-grid_box-2">
          <span className="stat-grid_text-1">{s.label}</span>
          <span className="stat-grid_text-2">{s.value}</span>
        </div>
      ))}
    </div>
  );
}

export default StatGrid;
