import { Fragment } from "react";
import type { CSSProperties, TouchEvent } from "react";
import { Link } from "react-router-dom";
import type { HeroSlide } from "../../../Types/HeroSlide";
import "./style.css";

type Props = {
  slides: HeroSlide[];
  current: number;
  playing: boolean;
  autoplayMs: number;
  onPrev: () => void;
  onNext: () => void;
  onGoTo: (index: number) => void;
  onTogglePlay: () => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
  onTouchStart: (e: TouchEvent) => void;
  onTouchEnd: (e: TouchEvent) => void;
};

function HeroComponent({
  slides,
  current,
  playing,
  autoplayMs,
  onPrev,
  onNext,
  onGoTo,
  onTogglePlay,
  onPointerEnter,
  onPointerLeave,
  onTouchStart,
  onTouchEnd,
}: Props) {
  return (
    <section
      className={`hero-slider${playing ? "" : " is-paused"}`}
      data-purpose="hero-overview"
      aria-roledescription="carousel"
      aria-label="Andalusia Academy highlights"
      style={{ "--hero-autoplay": `${autoplayMs}ms` } as CSSProperties}
      onMouseEnter={onPointerEnter}
      onMouseLeave={onPointerLeave}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {slides.map((slide, index) => {
        const active = index === current;
        // Only the visible slide owns the page <h1>.
        const Title = active ? "h1" : "p";
        return (
          <article
            key={slide.id}
            className={`hero-slide hero-slide--${slide.variant}${active ? " is-active" : ""}`}
            role="group"
            aria-roledescription="slide"
            aria-hidden={!active}
          >
            <div
              className="hero-slide_bg"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
            <div className="hero-slide_glass" />

            <div className="section-wrap hero-slide_wrap">
              <div className="hero_content">
                <div className="hero_kicker">
                  <span className="hero_kicker-dot" />
                  <span className="hero_kicker-strong">{slide.kicker}</span>
                </div>

                <Title
                  className="hero_title heading-serif"
                  aria-hidden={active ? undefined : true}
                >
                  {slide.title.map((part) => (
                    <Fragment key={part.text}>
                      {part.accent ? (
                        <span className="hero_title-accent">{part.text}</span>
                      ) : (
                        part.text
                      )}{" "}
                    </Fragment>
                  ))}
                </Title>

                <p className="hero_description">{slide.description}</p>

                {slide.cta &&
                  (slide.cta.to.startsWith("#") ? (
                    <a
                      className="btn btn-primary hero_cta"
                      href={slide.cta.to}
                      tabIndex={active ? 0 : -1}
                    >
                      {slide.cta.label}
                    </a>
                  ) : (
                    <Link
                      className="btn btn-primary hero_cta"
                      to={slide.cta.to}
                      tabIndex={active ? 0 : -1}
                    >
                      {slide.cta.label}
                    </Link>
                  ))}
              </div>
            </div>
          </article>
        );
      })}

      <div className="hero-slider_controls">
        <button
          type="button"
          className="hero-slider_arrow"
          onClick={onPrev}
          aria-label="Previous slide"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>

        <div className="hero-slider_pill">
          <button
            type="button"
            className="hero-slider_play"
            onClick={onTogglePlay}
            aria-label={playing ? "Pause slideshow" : "Play slideshow"}
          >
            {playing ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="5" y="4" width="5" height="16" rx="1" />
                <rect x="14" y="4" width="5" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M7 4l13 8-13 8z" />
              </svg>
            )}
          </button>

          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              className={`hero-slider_dot${index === current ? " is-active" : ""}`}
              onClick={() => onGoTo(index)}
              aria-label={`Slide ${index + 1}`}
              aria-current={index === current}
            />
          ))}
        </div>

        <button
          type="button"
          className="hero-slider_arrow"
          onClick={onNext}
          aria-label="Next slide"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </section>
  );
}

export default HeroComponent;
