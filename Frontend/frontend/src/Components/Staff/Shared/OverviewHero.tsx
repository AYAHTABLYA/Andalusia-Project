import { Link } from "react-router-dom";
import { initials } from "../../../utils/format";

type Tile = { label: string; value?: string | number };

const greeting = () => {
  const h = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: "Africa/Cairo" }).format(new Date())) % 24;
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
};
const dateLine = () =>
  new Intl.DateTimeFormat("en-US", { weekday: "long", day: "numeric", month: "long", timeZone: "Africa/Cairo" })
    .format(new Date()).replace(",", " ·").toUpperCase();

type HeroProps = {
  workspace: string; // "ADMIN WORKSPACE"
  name: string;
  subtitle: string;
  pulse?: string; // one real, computed sentence ("1 live lecture today")
  cta?: { label: string; to: string };
};

// Top banner shared by every staff overview.
function OverviewHero({ workspace, name, subtitle, pulse, cta }: HeroProps) {
  return (
    <section className="ov-hero">
      <p className="ov-hero_eyebrow">{workspace} · {dateLine()}</p>
      <h1>{greeting()}, {name.split(/\s+/)[0] || "there"} <span aria-hidden="true">✷</span></h1>
      <p className="ov-hero_sub">{subtitle}</p>
      <div className="ov-hero_foot">
        {pulse && <span className="ov-hero_pulse"><i />{pulse}</span>}
        {cta && <Link to={cta.to} className="ov-hero_cta">{cta.label} <span className="material-symbols-outlined">chevron_right</span></Link>}
      </div>
    </section>
  );
}

type ProfileProps = { name: string; email?: string; role: string; photoUrl?: string | null; tiles: Tile[]; loading?: boolean };

// "Who am I" card next to the banner. Tiles are real figures supplied by each dashboard.
function OverviewProfile({ name, email, role, photoUrl, tiles, loading }: ProfileProps) {
  return (
    <section className="ov-profile">
      <div className="ov-profile_top">
        {photoUrl ? <img className="ov-profile_avatar" src={photoUrl} alt="" /> : <span className="ov-profile_avatar">{initials(name || "?")}</span>}
        <div>
          <strong>{name || "—"}</strong>
          {email && <small>{email}</small>}
        </div>
        <span className="ov-profile_role">{role.replace(/_/g, " ")}</span>
      </div>
      <div className="ov-profile_tiles">
        {tiles.map((t) => (
          <div key={t.label}>
            <strong>{loading ? "…" : t.value ?? "—"}</strong>
            <small>{t.label}</small>
          </div>
        ))}
      </div>
    </section>
  );
}

export type { Tile };
export { OverviewHero, OverviewProfile };
