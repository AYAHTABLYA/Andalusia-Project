import "./Style.css";

function TopBarComponent() {
  return (
    <aside className="top-bar" data-purpose="site-announcement">
      <div className="top-bar_inner">
        <div className="top-bar_welcome">
          <span className="top-bar_dot" aria-hidden="true" />
          <span className="top-bar_welcome-text">
            Welcome to Andalusia Academy
          </span>
        </div>

        <div className="top-bar_notice">
          Alexandria Executive Campus • Fall 2024 / Spring 2025 Admissions Open
        </div>
      </div>
    </aside>
  );
}

export default TopBarComponent;
