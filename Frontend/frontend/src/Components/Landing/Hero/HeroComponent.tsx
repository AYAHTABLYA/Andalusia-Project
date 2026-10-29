import "./style.css";

function HeroComponent() {
  return (
    <section className="hero" data-purpose="hero-overview">
      <div className="section-wrap">
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
        </div>
      </div>
    </section>
  );
}

export default HeroComponent;
