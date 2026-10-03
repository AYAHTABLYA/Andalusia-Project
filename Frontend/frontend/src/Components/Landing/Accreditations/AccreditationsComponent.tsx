import { memo } from "react";
import type { Accreditation } from "../../../types/Accreditation";
import "./style.css";

function AccreditationsComponent({
  accreditations,
}: {
  accreditations: Accreditation[];
}) {
  return (
    <section
      className="accreditations"
      data-purpose="partners-and-accreditation"
      id="accreditations"
    >
      <div className="section-wrap">
        <div className="accreditations_head">
          <span className="eyebrow">About Andalusia Academy</span>
          <h2 className="heading-serif accreditations_title">
            Accreditation &amp; Strategic Industry Alliances
          </h2>
          <p>
            Graduates receive dual certifications stamped with internationally
            recognized credentialing bodies.
          </p>
        </div>

        <div className="accreditations_grid">
          {accreditations.map((item) => (
            <div key={item.id} className="accreditations_badge">
              <span className="accreditations_name">{item.name}</span>
              <span className="accreditations_label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(AccreditationsComponent);
