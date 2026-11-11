import { Link } from "react-router-dom";
import logo from "../../../assets/andalusia-logo.png";
import "./style.css";

const SOCIAL_LINKS = [
  {
    id: "facebook",
    label: "Andalusia Academy on Facebook",
    href: "https://www.facebook.com/Andalusia.Academyy/",
    path: "M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.026 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.971H15.83c-1.491 0-1.956.93-1.956 1.886v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z",
  },
  {
    id: "instagram",
    label: "Andalusia Academy on Instagram",
    href: "https://www.instagram.com/andalusia_academyy/",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z",
  },
  {
    id: "youtube",
    label: "Andalusia Conferences on YouTube",
    href: "https://www.youtube.com/@andalusia-Conferences",
    path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
  {
    id: "linkedin",
    label: "Andalusia Academy on LinkedIn",
    href: "https://www.linkedin.com/company/andalusia-academy/posts/",
    path: "M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z",
  },
];

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
                alt="Andalusia Academy" width={1125} height={290}
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
              <div className="landing-footer_socials">
                {SOCIAL_LINKS.map((item) => (
                  <a
                    key={item.id}
                    className={`landing-footer_social landing-footer_social--${item.id}`}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d={item.path} />
                    </svg>
                  </a>
                ))}
              </div>
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
