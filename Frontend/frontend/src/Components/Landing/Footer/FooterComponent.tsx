import "./style.css";

function FooterComponent() {
  return (
    <footer className="landing-footer" data-purpose="site-footer">
      <div className="section-wrap">
        <div className="landing-footer_grid">
          <div className="landing-footer_brand">
            <div className="landing-footer_brand-row">
              <span className="heading-serif landing-footer_brand-name">
                ANDALUSIA ACADEMY
              </span>
            </div>
            <p>
              Empowering professionals across Egypt and the MENA region with
              industry-vetted diplomas, hands-on offline labs, and CPD-certified
              executive credentials.
            </p>
            <div className="landing-footer_meta">
              Committed to Pearson Higher Learning Standards.
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
                <a href="#portal-preview-section">Student Portal</a>
              </li>
              <li>
                <a href="#portal-preview-section">Instructor Portal</a>
              </li>
              <li>
                <a href="#portal-preview-section">Coordinator Portal</a>
              </li>
              <li>
                <a href="#portal-preview-section">Admin Portal</a>
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
