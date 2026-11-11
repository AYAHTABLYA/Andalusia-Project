import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import useSessionUser from "../../hooks/portalHooks/useSessionUser";
import useToast from "../../hooks/portalHooks/useToast";
import usePayments from "../../hooks/portalHooks/usePayments";
import { clearSession } from "../../utils/session";
import { logoutRequest } from "../../apis/portalApi";
import { getUnreadMessageCount } from "../../apis/messagesApi";
import { initials, resolveAssetUrl } from "../../utils/format";
import type { PortalOutletContext } from "../../Types/PortalContext";
import { STUDENT_TABS } from "./constants";
import StaffSearch from "../Staff/StaffSearch";
import Toast from "../Portal/Shared/Toast";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { ThemeSwitcher } from "../ThemeSwitcher";
import { NotificationBell } from "../NotificationBell";
import logo from "../../assets/andalusia-logo.png";
import "../Academy/theme.css";
import "../Portal/theme.css";
import "../Staff/style.css";
import "./style.css";

const currentLang = () =>
  typeof document === "undefined" ? "en" : document.documentElement.lang;

const cairoTime = (lang: string) =>
  new Intl.DateTimeFormat(lang === "ar" ? "ar-EG-u-nu-latn" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Cairo",
  }).format(new Date());

const UNREAD_REFRESH_MS = 60_000;

// Student dashboard shell: the same sidebar + top bar as the Admin / Coordinator / Instructor dashboards
// (it reuses their .staff-* styles). Everything a learner opens lives inside it: the workspace pages
// (/workspace/*) and the account pages (enrollments, applications, payments, profile).
function StudentLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = useSessionUser();
  const { toast, showToast, closeToast } = useToast();
  const payments = usePayments();
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState(currentLang);
  const [time, setTime] = useState(() => cairoTime(currentLang()));
  const [unread, setUnread] = useState(0);

  // Applications that still have to be paid -> "N" badge on Payments (same data as the Payments page).
  const dueCount = payments.payable.length;
  const context: PortalOutletContext = { showToast, payments };

  // Unread direct messages -> badge on Messages. Best effort; refreshed on every navigation and every minute.
  useEffect(() => {
    const controller = new AbortController();
    const load = () =>
      getUnreadMessageCount(controller.signal)
        .then(setUnread)
        .catch(() => undefined);
    load();
    const id = window.setInterval(load, UNREAD_REFRESH_MS);
    return () => {
      controller.abort();
      window.clearInterval(id);
    };
  }, [pathname]);

  const badges: Record<string, number | undefined> = {
    "/workspace/messages": unread,
    "/payments": dueCount,
  };

  // Follow the LanguageSwitcher: it sets <html lang="ar|en">.
  useEffect(() => {
    const observer = new MutationObserver(() => setLang(currentLang()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setTime(cairoTime(lang));
    const id = window.setInterval(() => setTime(cairoTime(lang)), 30_000);
    return () => window.clearInterval(id);
  }, [lang]);
  useEffect(() => setOpen(false), [pathname]);

  // Mobile drawer: close on Escape and keep the page behind it from scrolling.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  // The overview page is exact-match only; every other page also stays highlighted on its sub-pages.
  const isActive = (to: string) =>
    to === "/workspace"
      ? pathname === to
      : pathname === to || pathname.startsWith(`${to}/`);

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
  const name = user?.name || "Student";
  const sections = [
    { key: "learning", label: "Student workspace" },
    { key: "account", label: "My account" },
  ] as const;

  return (
    <div className="portal staff-shell">
      <aside className={`staff-side${open ? " staff-side--open" : ""}`} aria-label="Student workspace">
        <button
          type="button"
          className="staff-side_close"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        <Link to="/" className="staff-side_logo" aria-label="Andalusia Academy">
          <img src={logo} alt="Andalusia Academy" width={1125} height={290} />
        </Link>
        {sections.map((section) => (
          <div key={section.key} className="staff-side_group">
            <p className="staff-side_label">{section.label}</p>
            <nav className="staff-side_nav" aria-label={section.label}>
              {STUDENT_TABS.filter((tab) => tab.section === section.key).map((tab) => (
                <Link
                  key={tab.to}
                  to={tab.to}
                  className={`staff-side_link${isActive(tab.to) ? " staff-side_link--active" : ""}`}
                  aria-current={isActive(tab.to) ? "page" : undefined}
                >
                  <span className="material-symbols-outlined">{tab.icon}</span>
                  {tab.label}
                  {badges[tab.to] ? <span className="staff-side_badge">{badges[tab.to]}</span> : null}
                </Link>
              ))}
            </nav>
          </div>
        ))}
        <div className="staff-side_help">
          <span className="material-symbols-outlined">auto_awesome</span>
          <strong>Need a hand?</strong>
          <p>Our academy support team is here for you.</p>
          <a href="mailto:support@andalusia.academy">Talk to support</a>
        </div>
        <div className="staff-side_user">
          {photo ? (
            <img className="staff-avatar" src={photo} alt="" />
          ) : (
            <span className="staff-avatar">{initials(name)}</span>
          )}
          <div>
            <strong>{name}</strong>
            <span>Student</span>
          </div>
          <button type="button" onClick={logout} aria-label="Sign out" title="Sign out">
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </aside>
      {open && (
        <button
          type="button"
          className="staff-scrim"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="staff-content">
        <header className="staff-topbar">
          <button
            type="button"
            className="staff-topbar_menu"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <Link to="/" className="staff-back-home">
            <span className="material-symbols-outlined icon-dir">arrow_back</span>
            Back to Home
          </Link>
          <StaffSearch tabs={STUDENT_TABS} />
          <div className="staff-topbar_actions">
            <LanguageSwitcher />
            <ThemeSwitcher />
            <NotificationBell />
            <Link to="/courses" className="staff-quick-add">
              <span className="material-symbols-outlined">explore</span> Browse courses
            </Link>
            <div className="staff-clock">
              <span className="material-symbols-outlined">schedule</span>
              <strong>{time}</strong>
              <small>Cairo time</small>
            </div>
          </div>
        </header>
        <main className="staff-main" key={pathname}>
          <Outlet context={context} />
        </main>
      </div>
      <Toast visible={toast.visible} message={toast.message} onClose={closeToast} />
    </div>
  );
}

export default StudentLayout;
