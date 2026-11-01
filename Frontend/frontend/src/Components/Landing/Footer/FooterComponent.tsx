import { Link } from "react-router-dom";
import logo from "../../../assets/andalusia-logo.png";
import "./style.css";

function FooterComponent() {
  return (
    <footer id="about-us" className="landing-footer" data-purpose="site-footer">
      <div className="section-wrap">
        <div className="landing-footer_grid">
          <div className="landing-footer_brand">
            <div className="landing-footer_brand-row">
              <img
                className="landing-footer_logo"
                src={logo}
                alt="Andalusia Academy"
              />
            </div>
            <p>
              Empowering professionals across Egypt and the MENA region with
              industry-vetted diplomas, hands-on offline labs, and CPD-certified
              executive credentials.
            </p>
            <div className="landing-footer_meta">
              Committed to Pearson Higher Learning Standards.
            </div>

            <div className="landing-footer_touch">
              <h4>Keep In Touch</h4>
              <a
                className="landing-footer_social landing-footer_social--linkedin"
                href="https://www.linkedin.com/company/andalusia-academy/posts/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Andalusia Academy on LinkedIn"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4>Academic Tracks</h4>
            <ul>
              <li>
                <a href="#">Generative AI Engineering</a>
              </li>
              <li>
                <a href="#">FinTech &amp; Open Banking</a>
              </li>
              <li>
                <a href="#">Cloud &amp; Zero Trust</a>
              </li>
              <li>
                <a href="#">Full Stack Engineering</a>
              </li>
              <li>
                <a href="#">Executive Product Strategy</a>
              </li>
            </ul>
          </div>

          <div>
            <h4>Campus &amp; Portals</h4>
            <ul>
              <li>
                <Link to="/login">Student Portal</Link>
              </li>
              <li>
                <Link to="/login">Instructor Portal</Link>
              </li>
              <li>
                <Link to="/login">Coordinator Portal</Link>
              </li>
              <li>
                <Link to="/login">Admin Portal</Link>
              </li>
              <li>
                <a href="#">Alexandria Campus Facilities</a>
              </li>
            </ul>
          </div>

          <div>
            <h4>Governance</h4>
            <ul>
              <li>
                <a href="#">Academic Charter</a>
              </li>
              <li>
                <a href="#">Refund &amp; Transfer Policy</a>
              </li>
              <li>
                <a href="#">CPD Verification Registry</a>
              </li>
              <li>
                <a href="#">Privacy Notice</a>
              </li>
              <li>
                <a href="#">Code of Conduct</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="landing-footer_bottom">
          <div>
            © 2025 Andalusia Academy for Advanced Studies. All rights reserved.
            Registered Educational Provider.
          </div>
          <div className="landing-footer_bottom-links">
            <a href="#">Terms of Service</a>
            <a href="#">Security Architecture</a>
            <a href="#">Alexandria Campus</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default FooterComponent;
