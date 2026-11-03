import { useCallback, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./constellation.css";

// One node of the scene. Everything shown must come from real data supplied by the dashboard.
export type SceneNode = {
  id: string;
  label: string;
  value?: number | string; // shown in the legend
  weight?: number; // 0..1 relative size of the node
  progress?: number; // 0..100: draws a progress ring around the node
  satellites?: number; // real count behind the node; drawn as a scaled cloud of small dots
  to?: string; // makes the node clickable
};

type Props = {
  title: string;
  subtitle?: string;
  centerLabel: string;
  centerValue?: number | string;
  nodes: SceneNode[];
  loading?: boolean;
  empty?: string;
  footnote?: string;
};

type Pt = { x: number; y: number; z: number };
type Model = {
  nodes: (Pt & { node: SceneNode; tone: number; r: number })[];
  sats: (Pt & { owner: number })[];
};

const CAM = 3.4; // camera distance (same perspective projection idea as the video's Constellation)
const MAX_SATS = 18;

// Small seeded RNG so the dots stay in the same place between renders.
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hash = (s: string) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0, 7);

function buildModel(nodes: SceneNode[]): Model {
  const n = nodes.length;
  const golden = Math.PI * (3 - Math.sqrt(5));
  const model: Model = { nodes: [], sats: [] };
  nodes.forEach((node, i) => {
    const y = n === 1 ? 0 : 1 - ((i + 0.5) * 2) / n;
    const ring = Math.sqrt(Math.max(0, 1 - y * y));
    const th = i * golden;
    const p = { x: Math.cos(th) * ring * 0.86, y: y * 0.78, z: Math.sin(th) * ring * 0.86 };
    model.nodes.push({ ...p, node, tone: i % 4, r: 0.35 + 0.65 * Math.max(0, Math.min(1, node.weight ?? 0.6)) });
    // Cloud size grows with the real total but is capped, so a big total does not flood the scene.
    const count = Math.min(MAX_SATS, Math.round(Math.sqrt(Math.max(0, node.satellites ?? 0)) * 2));
    const rand = rng(hash(node.id));
    for (let k = 0; k < count; k++) {
      const u = rand() * 2 - 1;
      const a = rand() * Math.PI * 2;
      const rr = Math.sqrt(1 - u * u);
      const d = 0.16 + rand() * 0.2;
      model.sats.push({ x: p.x + Math.cos(a) * rr * d, y: p.y + u * d, z: p.z + Math.sin(a) * rr * d, owner: i });
    }
  });
  return model;
}

const hexRgb = (hex: string) => {
  const h = hex.trim().replace("#", "");
  const f = h.length === 3 ? [...h].map((c) => c + c).join("") : h;
  const v = parseInt(f.padEnd(6, "0").slice(0, 6), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
};

function Constellation({ title, subtitle, centerLabel, centerValue, nodes, loading, empty, footnote }: Props) {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoverRef = useRef<string | null>(null);
  const redrawRef = useRef<() => void>(() => undefined);
  const model = useMemo(() => buildModel(nodes), [nodes]);
  const ready = !loading && nodes.length > 0;

  const setHover = useCallback((id: string | null) => {
    hoverRef.current = id;
    redrawRef.current();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !ready) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const style = getComputedStyle(canvas);
    const tones = [0, 1, 2, 3].map((i) => hexRgb(style.getPropertyValue(`--cs-t${i}`) || "#c2907b"));
    const ink = hexRgb(style.getPropertyValue("--cs-ink") || "#141b1d");
    const display = style.getPropertyValue("--font-display") || "serif";
    const body = style.getPropertyValue("--font-body") || "sans-serif";
    const rgba = (c: number[], a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

    let w = 0, h = 0, dpr = 1;
    let yaw = 0.6, pitch = 0.32, vel = 0.0016; // radians; vel is the idle spin per frame at 60fps
    let visible = true, raf = 0, last = 0;
    let drag: { x: number; y: number; moved: number } | null = null;
    let hits: { id: string; x: number; y: number; r: number; to?: string }[] = [];

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      draw();
    };

    function project(p: Pt, scale: number) {
      const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      const x1 = p.x * cy + p.z * sy;
      const z1 = -p.x * sy + p.z * cy;
      const y2 = p.y * cp - z1 * sp;
      const z2 = p.y * sp + z1 * cp;
      const k = CAM / (z2 + CAM);
      return { x: w / 2 + x1 * k * scale, y: h / 2 + y2 * k * scale, z: z2, k };
    }

    function draw() {
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, w, h);
      const scale = Math.min(w * 0.42, h * 0.62);
      const hover = hoverRef.current;
      hits = [];

      const items: { z: number; paint: () => void }[] = [];
      const c0 = project({ x: 0, y: 0, z: 0 }, scale);

      model.nodes.forEach((m, i) => {
        const p = project(m, scale);
        const col = tones[m.tone];
        const on = hover === m.node.id;
        const depth = 0.45 + 0.55 * ((1 - p.z / 0.9) / 2 + 0.25);
        const alpha = Math.max(0.35, Math.min(1, depth));
        const r = (6 + m.r * 9) * p.k * (on ? 1.18 : 1);

        // spoke to the centre
        items.push({ z: p.z - 0.01, paint: () => {
          ctx!.strokeStyle = rgba(col, (on ? 0.7 : 0.2) * alpha);
          ctx!.lineWidth = on ? 1.4 : 1;
          ctx!.beginPath(); ctx!.moveTo(c0.x, c0.y); ctx!.lineTo(p.x, p.y); ctx!.stroke();
        } });

        items.push({ z: p.z, paint: () => {
          const g = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3.2);
          g.addColorStop(0, rgba(col, (on ? 0.5 : 0.28) * alpha)); g.addColorStop(1, rgba(col, 0));
          ctx!.fillStyle = g; ctx!.beginPath(); ctx!.arc(p.x, p.y, r * 3.2, 0, Math.PI * 2); ctx!.fill();
          ctx!.fillStyle = rgba(col, alpha); ctx!.beginPath(); ctx!.arc(p.x, p.y, r, 0, Math.PI * 2); ctx!.fill();
          if (m.node.progress !== undefined) {
            const a0 = -Math.PI / 2, pr = Math.max(0, Math.min(100, m.node.progress)) / 100;
            ctx!.lineWidth = 2.5; ctx!.lineCap = "round";
            ctx!.strokeStyle = rgba(ink, 0.55); ctx!.beginPath(); ctx!.arc(p.x, p.y, r + 5, 0, Math.PI * 2); ctx!.stroke();
            ctx!.strokeStyle = rgba([255, 255, 255], 0.92 * alpha); ctx!.beginPath(); ctx!.arc(p.x, p.y, r + 5, a0, a0 + pr * Math.PI * 2); ctx!.stroke();
          }
          if (alpha > 0.55 || on) {
            ctx!.font = `600 ${on ? 13 : 12}px ${body}`; ctx!.textAlign = "center"; ctx!.textBaseline = "top";
            ctx!.fillStyle = `rgba(255,255,255,${on ? 1 : 0.82 * alpha})`;
            const t = m.node.label.length > 22 ? `${m.node.label.slice(0, 21)}…` : m.node.label;
            ctx!.fillText(t, p.x, p.y + r + (m.node.progress !== undefined ? 9 : 5));
          }
        } });
        hits.push({ id: m.node.id, x: p.x, y: p.y, r: Math.max(r + 8, 18), to: m.node.to });
        void i;
      });

      model.sats.forEach((s) => {
        const p = project(s, scale);
        const owner = model.nodes[s.owner];
        const col = tones[owner.tone];
        const on = hover === owner.node.id;
        const alpha = Math.max(0.2, Math.min(0.9, 0.4 + (0.9 - p.z) / 2));
        const o = project(owner, scale);
        items.push({ z: p.z, paint: () => {
          ctx!.strokeStyle = rgba(col, (on ? 0.3 : 0.1) * alpha);
          ctx!.lineWidth = 1; ctx!.beginPath(); ctx!.moveTo(o.x, o.y); ctx!.lineTo(p.x, p.y); ctx!.stroke();
          ctx!.fillStyle = rgba(col, (on ? 1 : 0.8) * alpha);
          ctx!.beginPath(); ctx!.arc(p.x, p.y, 2.2 * p.k, 0, Math.PI * 2); ctx!.fill();
        } });
      });

      items.push({ z: 0, paint: () => {
        const R = Math.min(w, h) * 0.13;
        const g = ctx!.createRadialGradient(c0.x, c0.y, 0, c0.x, c0.y, R * 2.4);
        g.addColorStop(0, "rgba(194,144,123,0.38)"); g.addColorStop(1, "rgba(194,144,123,0)");
        ctx!.fillStyle = g; ctx!.beginPath(); ctx!.arc(c0.x, c0.y, R * 2.4, 0, Math.PI * 2); ctx!.fill();
        ctx!.fillStyle = rgba(ink, 0.92); ctx!.strokeStyle = "rgba(228,201,187,0.7)"; ctx!.lineWidth = 1.5;
        ctx!.beginPath(); ctx!.arc(c0.x, c0.y, R, 0, Math.PI * 2); ctx!.fill(); ctx!.stroke();
        ctx!.textAlign = "center"; ctx!.textBaseline = "middle";
        ctx!.fillStyle = "#fff";
        if (centerValue !== undefined && centerValue !== "") {
          ctx!.font = `700 ${Math.round(R * 0.62)}px ${display}`; ctx!.fillText(String(centerValue), c0.x, c0.y - R * 0.12);
          ctx!.font = `500 ${Math.max(9, Math.round(R * 0.26))}px ${body}`; ctx!.fillStyle = "rgba(255,255,255,0.7)";
          ctx!.fillText(centerLabel, c0.x, c0.y + R * 0.42);
        } else {
          ctx!.font = `600 ${Math.max(10, Math.round(R * 0.3))}px ${body}`; ctx!.fillText(centerLabel, c0.x, c0.y);
        }
      } });

      items.sort((a, b) => b.z - a.z).forEach((it) => it.paint());
    }
    redrawRef.current = draw;

    const frame = (t: number) => {
      raf = 0;
      if (!visible || document.hidden) return;
      const dt = last ? Math.min(48, t - last) / 16.67 : 1;
      last = t;
      const hovering = hoverRef.current !== null;
      if (!drag) {
        const target = hovering ? 0 : 0.0016;
        vel += (target - vel) * 0.05 * dt;
        yaw += vel * dt;
      }
      draw();
      raf = requestAnimationFrame(frame);
    };
    const start = () => { if (!reduced && !raf && visible) { last = 0; raf = requestAnimationFrame(frame); } };

    const local = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const pick = (x: number, y: number) =>
      hits.filter((q) => Math.hypot(q.x - x, q.y - y) <= q.r).sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))[0];

    const onDown = (e: PointerEvent) => {
      drag = { x: e.clientX, y: e.clientY, moved: 0 };
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (drag) {
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        drag.moved += Math.abs(dx) + Math.abs(dy);
        drag.x = e.clientX; drag.y = e.clientY;
        yaw += dx * 0.008; vel = dx * 0.0008;
        pitch = Math.max(-0.9, Math.min(0.9, pitch + dy * 0.006));
        if (reduced) draw();
        return;
      }
      const { x, y } = local(e);
      const hit = pick(x, y);
      canvas.style.cursor = hit ? (hit.to ? "pointer" : "default") : "grab";
      if ((hit?.id ?? null) !== hoverRef.current) setHover(hit?.id ?? null);
    };
    const onUp = (e: PointerEvent) => {
      const wasClick = drag && drag.moved < 5;
      drag = null;
      if (wasClick) {
        const { x, y } = local(e);
        const hit = pick(x, y);
        if (hit?.to) navigate(hit.to);
      }
    };
    const onLeave = () => { if (!drag) setHover(null); };

    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) start(); }, { threshold: 0.05 });
    const ro = new ResizeObserver(resize);
    const onVis = () => { if (!document.hidden) start(); };

    io.observe(canvas); ro.observe(canvas);
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVis);
    resize();
    start();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVis);
      redrawRef.current = () => undefined;
    };
  }, [model, ready, centerLabel, centerValue, navigate, setHover]);

  return (
    <section className="cs-card" aria-label={title}>
      <header className="cs-head">
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </header>

      {ready ? (
        <canvas ref={canvasRef} className="cs-canvas" aria-hidden="true" />
      ) : (
        <p className="cs-empty">{loading ? "Loading…" : empty ?? "Nothing to show yet."}</p>
      )}

      {ready && (
        <ul className="cs-legend" aria-label={title}>
          {nodes.map((n, i) => {
            const body = (
              <>
                <i className={`cs-dot cs-dot--${i % 4}`} aria-hidden="true" />
                <span>{n.label}</span>
                {n.value !== undefined && <strong>{n.value}</strong>}
              </>
            );
            return (
              <li key={n.id} onMouseEnter={() => setHover(n.id)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(n.id)} onBlur={() => setHover(null)}>
                {n.to ? <Link to={n.to}>{body}</Link> : <span className="cs-static">{body}</span>}
              </li>
            );
          })}
        </ul>
      )}
      {ready && footnote && <p className="cs-foot">{footnote}</p>}
    </section>
  );
}

export default Constellation;
