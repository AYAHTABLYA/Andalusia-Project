import { memo } from "react";
import type { ValuePillar } from "../../../Types/ValuePillar";
import "./style.css";

function ValuePillarsComponent({ pillars }: { pillars: ValuePillar[] }) {
  return (
    <section className="value-pillars" data-purpose="value-proposition">
      <div className="section-wrap">
        <div className="value-pillars_grid">
          {pillars.map((pillar) => (
            <div key={pillar.id} className="value-pillars_item">
              <div className="value-pillars_icon" aria-hidden="true">
                {pillar.icon}
              </div>
              <h2 className="value-pillars_title">{pillar.title}</h2>
              <p>{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(ValuePillarsComponent);
