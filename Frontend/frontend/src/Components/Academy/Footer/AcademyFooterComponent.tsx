import { Link } from "react-router-dom";
import "./style.css";

function AcademyFooterComponent() {
  return (
    <footer className="academy-footer_footer-1">
      <div className="academy-footer_box-1">
        <div className="academy-footer_box-2">
          <div className="academy-footer_box-3">
            <span className="academy-footer_text-1 material-symbols-outlined">account_balance</span>
          </div>
          <span className="academy-footer_text-2">Andalusia Academy • Alexandria Executive Campus</span>
          <span>| © 2025 All rights reserved.</span>
        </div>
        <nav className="academy-footer_nav-1">
          <Link to="/" className="academy-footer_link-1">Home</Link>
          <Link to="/career-paths" className="academy-footer_link-1">Career Paths</Link>
          <Link to="/programs" className="academy-footer_link-1">Programs</Link>
          <Link to="/courses" className="academy-footer_link-1">Courses</Link>
        </nav>
      </div>
    </footer>
  );
}

export default AcademyFooterComponent;
