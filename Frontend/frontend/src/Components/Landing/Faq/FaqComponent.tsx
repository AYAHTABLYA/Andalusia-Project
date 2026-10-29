import { Fragment, memo } from "react";
import type { FaqItem } from "../../../Types/Faq";
import "./style.css";

type Props = {
  items: FaqItem[];
  loading: boolean;
  errorMessage?: string;
  onRetry: () => void;
};

function FaqComponent({ items, loading, errorMessage, onRetry }: Props) {
  return (
    <section className="faq" data-purpose="faq">
      <div className="faq_wrap">
        <div className="faq_head">
          <span className="eyebrow">Need Clarification?</span>
          <h2 className="heading-serif faq_title">Frequently Asked Questions</h2>
          <p>
            Find answers regarding cohort schedules, offline studio access,
            admissions, and dual certifications.
          </p>
        </div>

        {loading ? (
          <p className="faq_state" aria-busy="true">
            Loading questions…
          </p>
        ) : errorMessage ? (
          <p className="faq_state" role="alert">
            Could not load the FAQs. {errorMessage}{" "}
            <button type="button" className="faq_retry" onClick={onRetry}>
              Retry
            </button>
          </p>
        ) : items.length === 0 ? (
          <p className="faq_state">Frequently asked questions will appear here soon.</p>
        ) : (
          <div className="faq_list">
            {/* Native <details> keeps the accordion accessible without extra state */}
            {items.map((item, index) => (
              <details key={item.id} className="faq_item" open={index === 0}>
                <summary className="faq_question">
                  <span>{item.question}</span>
                  <span className="faq_icon" aria-hidden="true">
                    ↓
                  </span>
                </summary>
                <div className="faq_answer">
                  {item.answer.map((part, i) =>
                    part.bold ? (
                      <strong key={i}>{part.text}</strong>
                    ) : (
                      <Fragment key={i}>{part.text}</Fragment>
                    ),
                  )}
                </div>
              </details>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default memo(FaqComponent);
