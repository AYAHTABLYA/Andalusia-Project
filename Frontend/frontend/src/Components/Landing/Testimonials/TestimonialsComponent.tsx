import { memo } from "react";
import type { Testimonial } from "../../../Types/Testimonial";
import "./style.css";

const STARS = [1, 2, 3, 4, 5];

function StarIcon() {
  return (
    <svg className="testimonials_star" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function TestimonialsComponent({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  return (
    <section className="testimonials" data-purpose="testimonials">
      <div className="section-wrap">
        <div className="testimonials_head">
          <span className="eyebrow">Testimonials &amp; Success Stories</span>
          <h2 className="heading-serif testimonials_title">
            What Our Learners Say
          </h2>
          <p>
            Feedback and career milestones from technology leaders and
            engineers across our executive cohorts.
          </p>
        </div>

        <div className="testimonials_grid">
          {testimonials.map((item) => (
            <article key={item.id} className="testimonials_card">
              <div className="testimonials_body">
                <div className="testimonials_stars" aria-label="5 out of 5 stars">
                  {STARS.map((star) => (
                    <StarIcon key={star} />
                  ))}
                </div>
                <p className="testimonials_quote">“{item.quote}”</p>
              </div>

              <div className="testimonials_author">
                <div
                  className={`testimonials_avatar testimonials_avatar--${item.tone}`}
                  aria-hidden="true"
                >
                  {item.initials}
                </div>
                <div>
                  <p className="testimonials_name">{item.name}</p>
                  <span className="testimonials_track">{item.track}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(TestimonialsComponent);
