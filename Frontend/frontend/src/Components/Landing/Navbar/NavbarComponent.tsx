import logo from "../../../assets/andalusia-logo.png";
import { Link } from "react-router-dom";
import { LanguageSwitcher } from "../../LanguageSwitcher";
import "./style.css";

type Props = {
  signedIn: boolean;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
};

function NavbarComponent({ signedIn, menuOpen, onToggleMenu, onCloseMenu }: Props) {
  return (
    <header className="navbar" data-purpose="site-navigation">
      <div className="navbar_inner">
        <Link className="navbar_brand" to="/" onClick={onCloseMenu}>
          <img className="navbar_logo-img" src={logo} alt="Andalusia Academy" />
        </Link>

        <nav className="navbar_links">
          <Link to="/programs">Programs</Link>
          <Link to="/courses">Courses</Link>
          <Link to="/career-paths">Career Paths</Link>
          <a href="#accreditations">Accreditations</a>
          <a href="#contact-campus">Contact Us</a>
          <a href="#about-us">About Us</a>
        </nav>

        <div className="navbar_actions">
          <LanguageSwitcher />
          <Link className="btn btn-outline navbar_signin" to={signedIn ? "/profile" : "/login"}>
            My Portal
          </Link>
          <Link className="btn btn-primary navbar_apply" to="/register">
            Apply Now
          </Link>
          <button
            type="button"
            className="navbar_menu-btn"
            onClick={onToggleMenu}
            aria-expanded={menuOpen}
            aria-controls="navbar-drawer"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div id="navbar-drawer" className="navbar_drawer">
          <Link to="/programs" onClick={onCloseMenu}>
            Programs
          </Link>
          <Link to="/courses" onClick={onCloseMenu}>
            Courses
          </Link>
          <Link to="/career-paths" onClick={onCloseMenu}>
            Career Paths
          </Link>
          <a href="#accreditations" onClick={onCloseMenu}>
            Accreditations
          </a>
          <a href="#contact-campus" onClick={onCloseMenu}>
            Contact Us
          </a>
          <a href="#about-us" onClick={onCloseMenu}>
            About Us
          </a>
          <div className="navbar_drawer-cta">
            <Link className="btn btn-outline" to={signedIn ? "/profile" : "/login"} onClick={onCloseMenu}>
              My Portal
            </Link>
            <Link
              className="btn btn-primary"
              to="/register"
              onClick={onCloseMenu}
            >
              Apply Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default NavbarComponent;
