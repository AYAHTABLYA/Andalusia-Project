import "./style.css";

function HeroComponent() {
  return (
    <section className="hero" data-purpose="hero-overview">
      <div className="section-wrap hero_grid">
        <div className="hero_content">
          <div className="hero_kicker">
            <span className="hero_kicker-dot" />
            <span className="hero_kicker-strong">
              Welcome to Andalusia Academy
            </span>
          </div>

          <h1 className="hero_title heading-serif">
            Shape Your Future with{" "}
            <span className="hero_title-accent">Industry-Certified</span>{" "}
            Mastery &amp;{" "}
            <span className="hero_title-accent">Offline Cohorts</span>
          </h1>

          <p className="hero_description">
            Andalusia Academy bridges executive acumen with rigorous hands-on
            technical bootcamps. Access accredited blended programs, peer-driven
            offline studios at Alexandria Campus, and mentor-verified
            portfolios.
          </p>

          <div className="hero_finder card">
            <div className="hero_finder-head">
              <span>Fast-Track Program Finder</span>
            </div>
            <div className="hero_finder-row">
              <select aria-label="Select Discipline">
                <option>Executive AI &amp; ML</option>
                <option>FinTech Architecture</option>
                <option>Full-Stack Engineering</option>
                <option>Corporate Governance</option>
              </select>
              <select aria-label="Select Study Mode">
                <option>Offline Campus (Alex)</option>
                <option>Executive Weekend Blended</option>
                <option>Self-Paced + Live Lab</option>
              </select>
              <button type="button" className="hero_finder-btn">
                Filter Cohorts →
              </button>
            </div>
          </div>

          <div className="hero_ctas">
            <a className="btn btn-primary" href="#featured-courses">
              Explore Our Programs
            </a>
            <a className="btn btn-outline" href="#enterprise-section">
              Upskill Your Team (B2B)
            </a>
          </div>
        </div>

        <div className="hero_side">
          <div className="hero_session-card card">
            <div className="hero_session-head">
              <div className="hero_session-avatar">AA</div>
              <div>
                <h3>Upcoming In-Person Lecture</h3>
                <p>Alexandria Executive Campus • Hall B</p>
              </div>
              <span className="hero_badge-confirmed">Confirmed</span>
            </div>

            <div className="hero_session-body">
              <div className="hero_session-meta">
                <span className="hero_session-cohort">
                  AI &amp; Fintech Diploma Cohort
                </span>
                <span>Starts Sat, 10:00 AM</span>
              </div>
              <h4>
                Enterprise Generative AI &amp; Regulatory Compliance in Banking
              </h4>
              <div className="hero_session-mentor">
                Dr. Tarek Mansour (Lead Architect)
              </div>
            </div>

            <div className="hero_perks">
              <div className="hero_perk">
                <strong>CPD Accredited</strong>
                <span>Global transcript badge</span>
              </div>
              <div className="hero_perk">
                <strong>Offline Lab Access</strong>
                <span>Gleem, Alexandria</span>
              </div>
            </div>

            <button type="button" className="hero_download-btn">
              Download Campus Syllabus &amp; Cohort Schedule (PDF)
            </button>
          </div>
        </div>
      </div>

      <div className="section-wrap hero_metrics-wrap">
        <div className="hero_metrics card">
          <div className="hero_metric">
            <span className="hero_metric-icon">🎓</span>
            <div className="hero_metric-label">
              Industry-Certified Curriculum
            </div>
            <p>Programs mapped to CPD and Pearson standards</p>
          </div>
          <div className="hero_metric">
            <span className="hero_metric-icon">🧑‍🏫</span>
            <div className="hero_metric-label">Expert Industry Mentors</div>
            <p>Learn from senior practitioners in tech and banking</p>
          </div>
          <div className="hero_metric">
            <span className="hero_metric-icon">🛠️</span>
            <div className="hero_metric-label">Hands-On Offline Labs</div>
            <p>Peer-driven studios at the Alexandria Campus</p>
          </div>
          <div className="hero_metric">
            <span className="hero_metric-icon">🌍</span>
            <div className="hero_metric-label">
              Globally Recognized Credentials
            </div>
            <p>Dual certification with international accreditation bodies</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroComponent;
