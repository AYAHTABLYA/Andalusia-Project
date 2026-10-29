function escapeCell(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

// Builds a CSV in the browser and triggers a download.
// The BOM makes Excel read the file as UTF-8, so Arabic names are not garbled.
function downloadCsv(fileName: string, rows: (string | number)[][]): void {
  const csv = rows.map((row) => row.map(escapeCell).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export { downloadCsv };
