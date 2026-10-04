import { memo } from "react";
import type { CareerStep } from "../../../Types/CareerStep";
import "./style.css";

function CareerPathComponent({ steps }: { steps: CareerStep[] }) {
  return (
    <section className="career-path" data-purpose="career-discovery-roadmap" id="career-tracks">
      <div className="section-wrap">
        <div className="career-path_head">
          <div>
            <span className="eyebrow">Architected For Career Acceleration</span>
            <h2 className="heading-serif career-path_title">
              Structured Executive Career Tracks
            </h2>
          </div>
          <p className="career-path_intro">
            Our multi-tier learning roadmap transitions practitioners from
            technical competency to high-impact boardroom authority.
          </p>
        </div>

        <div className="career-path_panel card">
          <div className="career-path_panel-head">
            <div className="career-path_pathway">
              <span>Selected Pathway:</span>
              <span className="career-path_pathway-badge">
                Enterprise AI &amp; Cloud Architect
              </span>
            </div>
            <div className="career-path_switcher">
              <button type="button">FinTech Engineering</button>
              <button type="button">Product Strategy</button>
            </div>
          </div>

          <div className="career-path_steps">
            {steps.map((step) => (
              <div
                key={step.id}
                className={
                  "career-path_step" +
                  (step.highlighted ? " career-path_step--highlight" : "")
                }
              >
                <div className="career-path_step-number">{step.order}</div>
                <span className="career-path_step-phase">{step.phase}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                <div className="career-path_step-footer">
                  <span>{step.footerLeft}</span>
                  <span>{step.footerRight}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="career-path_cta card">
            <div className="career-path_cta-left">
              <div className="career-path_cta-icon">⚡</div>
              <p>
                Not sure where your background fits? Book an evaluation
                with our <strong>Academic Dean in Alexandria</strong>.
              </p>
            </div>
            <a href="#contact-campus">Schedule Track Counseling →</a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(CareerPathComponent);
