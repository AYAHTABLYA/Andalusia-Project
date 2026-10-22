import "./style.css";

function TopBarComponent() {
  return (
    <aside className="top-bar" data-purpose="site-announcement">
      <div className="top-bar_inner">
        <div className="top-bar_welcome">
          <span className="top-bar_welcome-text">
            Welcome to Andalusia Academy
          </span>
        </div>

        <div className="top-bar_portals">
          <span className="top-bar_portals-label">Choose Your Portal:</span>
          <a href="#portal-preview-section">Student</a>
          <span>•</span>
          <a href="#portal-preview-section">Instructor</a>
          <span>•</span>
          <a href="#portal-preview-section">Coordinator</a>
          <span>•</span>
          <a href="#portal-preview-section">Admin</a>
        </div>
      </div>
    </aside>
  );
}

export default TopBarComponent;
