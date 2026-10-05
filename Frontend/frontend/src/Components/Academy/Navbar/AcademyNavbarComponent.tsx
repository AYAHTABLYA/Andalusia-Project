import { memo } from "react";
import { Link } from "react-router-dom";
import { NAV_LINKS, SUPPORT_PHONE } from "./constants";
import logo from "../../../assets/andalusia-logo.png";
import "./style.css";

type Props = {
  currentPath: string;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
};

function AcademyNavbarComponent({ currentPath, menuOpen, onToggleMenu, onCloseMenu }: Props) {
  const isActive = (match?: string) => !!match && currentPath.includes(match);

  return (
    <header className="academy-navbar">
      <div className="academy-navbar_inner">
        <Link to="/" className="academy-navbar_brand" onClick={onCloseMenu}>
          <img
            className="academy-navbar_logo-img"
            src={logo}
            alt="Andalusia Academy"
          />
        </Link>

        <nav className="academy-navbar_links" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`academy-navbar_link${isActive(link.match) ? " academy-navbar_link--active" : ""}`}
            >
              <span className="material-symbols-outlined">{link.icon}</span>
              <span>{link.label}</span>
              {link.badge && <span className="academy-navbar_badge">{link.badge}</span>}
            </Link>
          ))}
        </nav>

        <div className="academy-navbar_actions">
          <a href={`tel:${SUPPORT_PHONE.replace(/[^+\d]/g, "")}`} className="academy-navbar_phone">
            <span className="material-symbols-outlined">support_agent</span>
            <span>{SUPPORT_PHONE}</span>
          </a>
          <Link to="/login" className="academy-navbar_portal">
            <span className="material-symbols-outlined">lock</span>
            <span>Unified Portal</span>
          </Link>
          <button type="button" className="academy-navbar_menu-btn" aria-label="Menu" aria-expanded={menuOpen} onClick={onToggleMenu}>
            <span className="material-symbols-outlined">{menuOpen ? "close" : "menu"}</span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="academy-navbar_drawer" aria-label="Mobile">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={onCloseMenu}
              className={`academy-navbar_drawer-link${isActive(link.match) ? " academy-navbar_drawer-link--active" : ""}`}
            >
              <span className="material-symbols-outlined">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export default memo(AcademyNavbarComponent);
