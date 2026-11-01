import "./style.css";

function EnterpriseComponent() {
  return (
    <section
      className="enterprise"
      data-purpose="corporate-academy"
      id="enterprise-section"
    >
      <div className="section-wrap enterprise_grid">
        <div className="enterprise_content">
          <span className="enterprise_tag">
            Andalusia for Enterprise &amp; Banks
          </span>
          <h2 className="heading-serif enterprise_title">
            Bespoke Workforce Upskilling for Financial &amp; Tech Leaders
          </h2>
          <p className="enterprise_description">
            We design and execute custom cohort bootcamps directly aligned with
            your engineering roadmap. Deliver in-person sessions at our
            Alexandria campus or on-site at your headquarters with real-time
            competency analytics.
          </p>

          <ul className="enterprise_features">
            <li>
              <span className="enterprise_check">✓</span>
              Dedicated Enterprise Portal with real-time attendance and
              assessment tracking
            </li>
            <li>
              <span className="enterprise_check">✓</span>
              Private offline labs &amp; tailored problem statements tailored to
              company datasets
            </li>
            <li>
              <span className="enterprise_check">✓</span>
              Dual certification with CPD Standards &amp; ISO 21001 educational
              compliance
            </li>
          </ul>

          <div className="enterprise_cta">
            <a className="btn btn-primary" href="#contact-campus">
              Request Corporate Proposal
            </a>
            <span>Response within 24 business hours</span>
          </div>
        </div>

        <div className="enterprise_dashboard card">
          <div className="enterprise_dashboard-head">
            <div>
              <h4>What Your Organization Gets</h4>
              <p>
                A dedicated enterprise workspace for every cohort you sponsor
              </p>
            </div>
          </div>

          <div className="enterprise_capabilities">
            <div className="enterprise_capability">
              <span className="enterprise_capability-icon">📊</span>
              <div>
                <strong>Attendance &amp; Assessment Tracking</strong>
                <p>Follow your team's progress through every session and lab</p>
              </div>
            </div>
            <div className="enterprise_capability">
              <span className="enterprise_capability-icon">🧩</span>
              <div>
                <strong>Custom Lab Scenarios</strong>
                <p>Problem statements built around your own systems and data</p>
              </div>
            </div>
            <div className="enterprise_capability">
              <span className="enterprise_capability-icon">📈</span>
              <div>
                <strong>Skill Growth Reporting</strong>
                <p>
                  Clear, milestone-based reporting shared with your team leads
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default EnterpriseComponent;
