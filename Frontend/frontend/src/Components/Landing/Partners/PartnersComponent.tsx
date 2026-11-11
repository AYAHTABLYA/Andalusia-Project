import { memo } from "react";
import type { PartnerDto } from "../../../Types/AcademyApi";
import "./style.css";

function PartnersComponent({ partners }: { partners: PartnerDto[] }) {
  return (
    <section className="partners" data-purpose="success-partners" id="partners">
      <div className="section-wrap">
        <div className="partners_head">
          <span className="eyebrow">Industry Network</span>
          <h2 className="heading-serif partners_title">Our Success Partners</h2>
          <p>Organizations that hire, mentor and collaborate with Andalusia Academy graduates.</p>
        </div>

        <ul className="partners_grid">
          {partners.map((partner) => (
            <li key={partner.partnerId} className="partners_item card">
              {partner.logoUrl && (
                <img
                  className="partners_logo"
                  src={partner.logoUrl}
                  alt=""
                  loading="lazy"
                  onError={(e) => {
                    // Logo file missing: fall back to the name only.
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
              <span className="partners_name">{partner.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default memo(PartnersComponent);
