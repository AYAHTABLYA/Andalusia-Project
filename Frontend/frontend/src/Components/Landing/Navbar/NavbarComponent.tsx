import { Link } from "react-router-dom";
import "./style.css";

function NavbarComponent() {
  return (
    <header className="navbar" data-purpose="site-navigation">
      <div className="navbar_inner">
        <Link className="navbar_brand" to="/">
          <span className="navbar_logo">A</span>
          <div className="navbar_brand-text">
            <strong>Andalusia Academy</strong>
            <small lang="ar">أكاديمية أندلسية</small>
          </div>
        </Link>

        <div className="navbar_search">
          <select
            aria-label="Course Category Filter"
            className="navbar_search-select"
          >
            <option>All Tracks</option>
            <option>Executive AI</option>
            <option>FinTech</option>
            <option>Product &amp; Tech</option>
            <option>Offline Labs</option>
          </select>
          <input
            className="navbar_search-input"
            placeholder="Search offline cohorts, certifications, diplomas..."
            type="search"
          />
        </div>

        <nav className="navbar_links">
          <a href="#programs-section">Programs</a>
          <a href="#offline-cohorts">
            Offline Courses <span className="navbar_pill">Alex Campus</span>
          </a>
          <a href="#career-tracks">Career Paths</a>
          <a href="#enterprise-section">For Business</a>
          <a href="#accreditations">Accreditations</a>
          <a href="#portal-preview-section">Campus Portals</a>
        </nav>

        <div className="navbar_actions">
          <Link className="btn btn-outline navbar_signin" to="/login">
            Sign In / Portal
          </Link>
          <Link className="btn btn-primary" to="/register">
            Apply Now
          </Link>
        </div>
      </div>
    </header>
  );
}

export default NavbarComponent;
