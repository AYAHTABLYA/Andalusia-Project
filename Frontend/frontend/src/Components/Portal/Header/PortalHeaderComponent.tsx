import { memo } from "react";
import { Link } from "react-router-dom";
import type { HeaderLink } from "./constants";
import { SUPPORT_PHONE } from "../../Academy/Navbar/constants";
import { initials } from "../../../utils/format";
import { homeForRole } from "../../../utils/roles";
import logo from "../../../assets/andalusia-logo.png";
import { LanguageSwitcher } from "../../LanguageSwitcher";
import { NotificationBell } from "../../NotificationBell";
import "./style.css";

type Props = {
  links: HeaderLink[];
  name: string;
  role: string;
  photoUrl?: string | null;
  onLogout: () => void;
};

function PortalHeaderComponent({ links, name, role, photoUrl, onLogout }: Props) {
  return (
    <header className="portal-header">
      <div className="portal-header_inner">
        <Link to={homeForRole(role)} className="portal-header_brand">
          <img className="portal-header_logo" src={logo} alt="Andalusia Academy" />
        </Link>

        <nav className="portal-header_links" aria-label="Academy">
          {links.map((link) => (
            <Link key={link.to} to={link.to} className="portal-header_link">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="portal-header_actions">
          <LanguageSwitcher />
          <NotificationBell />
          <a href={`tel:${SUPPORT_PHONE.replace(/[^+\d]/g, "")}`} className="portal-header_phone">
            <span className="material-symbols-outlined">support_agent</span>
            <span>{SUPPORT_PHONE}</span>
          </a>
          <button type="button" className="portal-header_logout" onClick={onLogout}>
            <span className="material-symbols-outlined">logout</span>
            <span>Log out</span>
          </button>
          <Link to="/profile" className="portal-header_user">
            <span className="portal-header_avatar">
              {photoUrl ? <img src={photoUrl} alt="" /> : initials(name)}
            </span>
            <span className="portal-header_user-text">
              <strong>{name}</strong>
              <small>{role}</small>
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default memo(PortalHeaderComponent);
