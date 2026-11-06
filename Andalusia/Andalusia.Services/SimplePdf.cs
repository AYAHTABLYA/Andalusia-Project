using System.Text;

namespace AndalusiaApp.Services;

/// <summary>Minimal dependency-free text PDF writer (Helvetica, Latin-1 text only).</summary>
public static class SimplePdf
{
    private const int PageW = 595, PageH = 842, Margin = 56, LineH = 16, MaxChars = 88;

    public static byte[] Build(string title, IEnumerable<string> lines)
    {
        var all = new List<(string Text, bool Bold)> { (title, true), ("", false) };
        foreach (var raw in lines)
        {
            var isHeading = raw.StartsWith("# ");
            var text = isHeading ? raw[2..] : raw;
            foreach (var l in Wrap(text)) all.Add((l, isHeading));
        }

        int perPage = (PageH - 2 * Margin) / LineH;
        var pages = new List<List<(string Text, bool Bold)>>();
        for (int i = 0; i < all.Count; i += perPage)
            pages.Add(all.Skip(i).Take(perPage).ToList());
        if (pages.Count == 0) pages.Add(new());

        // objects: 1 catalog, 2 pages, 3 font, 4 bold font, then (page, content) pairs
        var objs = new List<string>();
        var kids = new StringBuilder();
        for (int p = 0; p < pages.Count; p++) kids.Append($"{5 + p * 2} 0 R ");
        objs.Add("<< /Type /Catalog /Pages 2 0 R >>");
        objs.Add($"<< /Type /Pages /Kids [{kids}] /Count {pages.Count} >>");
        objs.Add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
        objs.Add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
        for (int p = 0; p < pages.Count; p++)
        {
            var sb = new StringBuilder();
            int y = PageH - Margin;
            foreach (var (text, bold) in pages[p])
            {
                if (text.Length > 0)
                    sb.Append($"BT /{(bold ? "F2" : "F1")} {(bold ? 13 : 11)} Tf {Margin} {y} Td ({Escape(text)}) Tj ET\n");
                y -= LineH;
            }
            sb.Append($"BT /F1 9 Tf {PageW / 2 - 20} 28 Td (Page {p + 1} of {pages.Count}) Tj ET\n");
            var content = sb.ToString();
            objs.Add($"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {PageW} {PageH}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents {6 + p * 2} 0 R >>");
            objs.Add($"<< /Length {Encoding.Latin1.GetByteCount(content)} >>\nstream\n{content}endstream");
        }

        var enc = Encoding.Latin1;
        using var ms = new MemoryStream();
        void W(string s) { var b = enc.GetBytes(s); ms.Write(b, 0, b.Length); }
        W("%PDF-1.4\n");
        var offsets = new List<long>();
        for (int i = 0; i < objs.Count; i++)
        {
            offsets.Add(ms.Position);
            W($"{i + 1} 0 obj\n{objs[i]}\nendobj\n");
        }
        var xref = ms.Position;
        W($"xref\n0 {objs.Count + 1}\n0000000000 65535 f \n");
        foreach (var o in offsets) W($"{o:D10} 00000 n \n");
        W($"trailer\n<< /Size {objs.Count + 1} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF");
        return ms.ToArray();
    }

    private static string Escape(string s)
    {
        var sb = new StringBuilder();
        foreach (var ch in s)
        {
            var c = ch > 255 || (ch < 32 && ch != '\t') ? '?' : ch;
            if (c is '(' or ')' or '\\') sb.Append('\\');
            sb.Append(c == '\t' ? ' ' : c);
        }
        return sb.ToString();
    }

    private static IEnumerable<string> Wrap(string text)
    {
        if (string.IsNullOrEmpty(text)) { yield return ""; yield break; }
        var cur = new StringBuilder();
        foreach (var word in text.Replace("\r", "").Replace("\n", " ").Split(' ', StringSplitOptions.RemoveEmptyEntries))
        {
            if (cur.Length > 0 && cur.Length + 1 + word.Length > MaxChars) { yield return cur.ToString(); cur.Clear(); }
            if (cur.Length > 0) cur.Append(' ');
            cur.Append(word);
        }
        if (cur.Length > 0) yield return cur.ToString();
    }
}
