// Minimal dependency-free text PDF generator (Helvetica, Latin-1 text) + download helper.
const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN = 56;
const LINE_H = 16;
const MAX_CHARS = 88;

type Line = { text: string; bold: boolean };

function escapePdf(s: string): string {
  let out = "";
  for (const ch of s) {
    const code = ch.codePointAt(0) ?? 63;
    const c = code > 255 || code < 32 ? "?" : ch;
    out += c === "(" || c === ")" || c === "\\" ? `\\${c}` : c;
  }
  return out;
}

function wrap(text: string): string[] {
  if (!text) return [""];
  const out: string[] = [];
  let cur = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    if (cur && cur.length + 1 + word.length > MAX_CHARS) {
      out.push(cur);
      cur = "";
    }
    cur = cur ? `${cur} ${word}` : word;
  }
  if (cur) out.push(cur);
  return out;
}

function toBytes(s: string): Uint8Array {
  const b = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i) & 255;
  return b;
}

// Lines starting with "# " are rendered as bold headings.
function buildPdf(title: string, rawLines: string[]): Blob {
  const all: Line[] = [{ text: title, bold: true }, { text: "", bold: false }];
  for (const raw of rawLines) {
    const heading = raw.startsWith("# ");
    for (const l of wrap(heading ? raw.slice(2) : raw)) all.push({ text: l, bold: heading });
  }
  const perPage = Math.floor((PAGE_H - 2 * MARGIN) / LINE_H);
  const pages: Line[][] = [];
  for (let i = 0; i < all.length; i += perPage) pages.push(all.slice(i, i + perPage));

  const objs: string[] = [];
  objs.push("<< /Type /Catalog /Pages 2 0 R >>");
  objs.push(`<< /Type /Pages /Kids [${pages.map((_, p) => `${5 + p * 2} 0 R`).join(" ")}] /Count ${pages.length} >>`);
  objs.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  objs.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
  pages.forEach((pg, p) => {
    let content = "";
    let y = PAGE_H - MARGIN;
    for (const { text, bold } of pg) {
      if (text) content += `BT /${bold ? "F2" : "F1"} ${bold ? 13 : 11} Tf ${MARGIN} ${y} Td (${escapePdf(text)}) Tj ET\n`;
      y -= LINE_H;
    }
    content += `BT /F1 9 Tf ${PAGE_W / 2 - 20} 28 Td (Page ${p + 1} of ${pages.length}) Tj ET\n`;
    objs.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${6 + p * 2} 0 R >>`,
    );
    objs.push(`<< /Length ${content.length} >>\nstream\n${content}endstream`);
  });

  let body = "%PDF-1.4\n";
  const offsets: number[] = [];
  objs.forEach((o, i) => {
    offsets.push(body.length);
    body += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = body.length;
  body += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  for (const o of offsets) body += `${String(o).padStart(10, "0")} 00000 n \n`;
  body += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([toBytes(body) as BlobPart], { type: "application/pdf" });
}

function downloadPdf(fileName: string, title: string, lines: string[]): void {
  const url = URL.createObjectURL(buildPdf(title, lines));
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export { downloadPdf };
