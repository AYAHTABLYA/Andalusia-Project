import { useState } from "react";
import { downloadCsv } from "../../utils/csv";

// Search + CSV export for a table page.
// items -> (optional keep filter) -> search box -> visible items; `rows` are the visible items as text cells.
function useStaffTable<T>(items: T[], toRow: (item: T) => string[], keep: (item: T) => boolean = () => true) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const visible = items.filter((item) => keep(item) && (!needle || toRow(item).join(" ").toLowerCase().includes(needle)));
  const rows = visible.map(toRow);

  // Returns false when there is nothing to export.
  const exportCsv = (fileName: string, columns: string[]): boolean => {
    if (!rows.length) return false;
    downloadCsv(fileName, [columns, ...rows]);
    return true;
  };

  return { query, setQuery, visible, rows, exportCsv };
}

export default useStaffTable;
