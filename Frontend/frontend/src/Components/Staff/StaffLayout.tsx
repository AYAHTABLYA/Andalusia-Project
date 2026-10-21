import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import useSessionUser from "../../hooks/portalHooks/useSessionUser";
import { clearSession, hasPermission } from "../../utils/session";
import { logoutRequest } from "../../apis/portalApi";
import { initials, resolveAssetUrl } from "../../utils/format";
import { ROLES } from "../../utils/roles";
import { STAFF_TABS } from "./constants";
import StaffSearch from "./StaffSearch";
import logo from "../../assets/andalusia-logo.png";
import "../Academy/theme.css";
import "../Portal/theme.css";
import "./style.css";

const cairoTime = () =>
  new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Cairo" }).format(new Date());

// Sidebar shell shared by Admin / Manager / Content Manager / Instructor (AHA-style workspace).
function StaffLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = useSessionUser();
  const role = user?.role ?? "";
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState(cairoTime);

  useEffect(() => {
    const id = window.setInterval(() => setTime(cairoTime()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  useEffect(() => setOpen(false), [pathname]);

  const tabs = STAFF_TABS.filter(
    (tab) => tab.roles.includes(role) && (!tab.permission || hasPermission(tab.permission)),
  );
  const workspace = role === ROLES.instructor ? "Instructor workspace" : "Admin workspace";
  const isActive = (to: string) => (tab_isRoot(to) ? pathname === to : pathname === to || pathname.startsWith(`${to}/`));

  async function logout() {
    try {
      await logoutRequest();
    } catch {
      /* token already invalid / server unreachable: still sign out locally */
    } finally {
      clearSession();
      navigate("/login", { replace: true });
    }
  }

  const photo = resolveAssetUrl(user?.photoUrl);

  return (
    <div className="portal staff-shell">
      <aside className={`staff-side${open ? " staff-side--open" : ""}`}>
        <Link to="/" className="staff-side_logo" aria-label="Andalusia Academy">
          <img src={logo} alt="Andalusia Academy" />
        </Link>
        <p className="staff-side_label">{workspace}</p>
        <nav className="staff-side_nav" aria-label={workspace}>
          {tabs.map((tab) => (
            <Link
              key={tab.to}
              to={tab.to}
              className={`staff-side_link${isActive(tab.to) ? " staff-side_link--active" : ""}`}
              aria-current={isActive(tab.to) ? "page" : undefined}
            >
              <span className="material-symbols-outlined">{tab.icon}</span>
              {tab.label}
            </Link>
          ))}
        </nav>
        <div className="staff-side_help">
          <span className="material-symbols-outlined">auto_awesome</span>
          <strong>Need a hand?</strong>
          <p>Our academy support team is here for you.</p>
          <a href="mailto:support@andalusia.academy">Talk to support</a>
        </div>
        <div className="staff-side_user">
          {photo ? <img className="staff-avatar" src={photo} alt="" /> : <span className="staff-avatar">{initials(user?.name || "?")}</span>}
          <div>
            <strong>{user?.name}</strong>
            <span>{role.replace("_", " ")}</span>
          </div>
          <button type="button" onClick={logout} aria-label="Sign out" title="Sign out">
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </aside>
      {open && <button type="button" className="staff-scrim" aria-label="Close menu" onClick={() => setOpen(false)} />}

      <div className="staff-content">
        <header className="staff-topbar">
          <button type="button" className="staff-topbar_menu" aria-label="Open menu" onClick={() => setOpen(true)}>
            <span className="material-symbols-outlined">menu</span>
          </button>
          <Link to="/" className="staff-back-home">
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Home
          </Link>
          <StaffSearch tabs={tabs} />
          <div className="staff-topbar_actions">
            <button type="button" className="staff-icon-button" aria-label="Notifications" title="Notifications">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            {role !== ROLES.instructor && (
              <Link to="/admin/users" className="staff-quick-add">
                <span className="material-symbols-outlined">add</span> Quick add
              </Link>
            )}
            <div className="staff-clock">
              <span className="material-symbols-outlined">schedule</span>
              <strong>{time}</strong>
              <small>Cairo time</small>
            </div>
          </div>
        </header>
        <main className="staff-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Overview pages (/admin, /instructor) must not stay highlighted on their sub-pages.
const tab_isRoot = (to: string) => to === "/admin" || to === "/instructor";

export default StaffLayout;
