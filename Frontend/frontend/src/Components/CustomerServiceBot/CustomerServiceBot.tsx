import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RiCustomerService2Fill } from "react-icons/ri";
import { IoClose } from "react-icons/io5";
import rawBotDataAr from "../../data/botData.json";
import rawBotDataEn from "../../data/botDataen.json";
import { useSiteLanguage } from "../LanguageSwitcher";
import "./CustomerServiceBot.css";

type BotQuestion = {
  id: number;
  question: string;
  answerPoints: string[];
  visualization?: { type?: string; steps: { step: string; title: string }[] };
  topicPath?: string;
  topicLabel?: string;
};

type BotTopic = {
  id: string;
  badgeColor: string;
  title: string;
  questions: BotQuestion[];
};

type BotData = {
  title: string;
  welcomeMessage: string;
  contactUs: { whatsappNumber: string; defaultMessage: string; label: string };
  topics: BotTopic[];
  ui: {
    close: string;
    back: string;
    defaultLink: string;
    closeBot: string;
    open: string;
  };
};

const botDataByLang: Record<"ar" | "en", BotData> = {
  ar: rawBotDataAr as BotData,
  en: rawBotDataEn as BotData,
};

function CustomerServiceBot() {
  const navigate = useNavigate();
  const language = useSiteLanguage();
  const botData = botDataByLang[language];
  const isRtl = language === "ar";
  const { ui } = botData;
  const [isOpen, setIsOpen] = useState(false);
  const [topic, setTopic] = useState<BotTopic | null>(null);
  const [question, setQuestion] = useState<BotQuestion | null>(null);
  const answerRef = useRef<HTMLDivElement>(null);

  // Topic/question objects are language-specific, so reset when the site language changes
  useEffect(() => {
    setTopic(null);
    setQuestion(null);
  }, [language]);

  // Close with Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  // Bring the answer into view when a question is picked
  useEffect(() => {
    if (question)
      answerRef.current?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
  }, [question]);

  const openWhatsApp = () => {
    const { whatsappNumber, defaultMessage } = botData.contactUs;
    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const pickTopic = (t: BotTopic) => {
    setTopic(t);
    setQuestion(null);
  };

  const backToTopics = () => {
    setTopic(null);
    setQuestion(null);
  };

  const goTo = (path: string) => {
    if (/^https?:\/\//i.test(path)) {
      window.open(path, "_blank", "noopener,noreferrer");
    } else {
      navigate(path);
      setIsOpen(false);
    }
  };

  return (
    <div
      className="bot-wrapper"
      dir={isRtl ? "rtl" : "ltr"}
      lang={language}
      data-no-translate
    >
      {isOpen && (
        <div className="bot-container" role="dialog" aria-label={botData.title}>
          <div className="bot-header">
            <h4>{botData.title}</h4>
            <button
              type="button"
              className="bot-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label={ui.close}
            >
              <IoClose size={20} />
            </button>
          </div>

          <div className="bot-body">
            <p className="bot-welcome">{botData.welcomeMessage}</p>

            {topic && (
              <button
                type="button"
                className="bot-back-btn"
                onClick={backToTopics}
              >
                {isRtl ? "→" : "←"} {ui.back}
              </button>
            )}

            <div className="bot-questions-list">
              {!topic &&
                botData.topics.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className="bot-topic-btn"
                    style={
                      { "--accent-color": t.badgeColor } as React.CSSProperties
                    }
                    onClick={() => pickTopic(t)}
                  >
                    <span
                      className="topic-indicator"
                      style={{ backgroundColor: t.badgeColor }}
                    />
                    {t.title}
                  </button>
                ))}

              {topic &&
                topic.questions.map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    className={`bot-q-btn ${question?.id === q.id ? "active" : ""}`}
                    onClick={() => setQuestion(q)}
                  >
                    {q.question}
                  </button>
                ))}
            </div>

            {question && (
              <div className="bot-answer-box" ref={answerRef}>
                <ul className="bot-points-list">
                  {question.answerPoints.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>

                {question.visualization && (
                  <div className="bot-visualization-stepper">
                    {question.visualization.steps.map((s, i) => (
                      <div className="viz-step-item" key={i}>
                        <div
                          className="viz-step-num"
                          style={{ backgroundColor: topic?.badgeColor }}
                        >
                          {s.step}
                        </div>
                        <div className="viz-step-title">{s.title}</div>
                      </div>
                    ))}
                  </div>
                )}

                {question.topicPath && (
                  <button
                    type="button"
                    className="bot-topic-link"
                    onClick={() => goTo(question.topicPath!)}
                  >
                    {question.topicLabel ?? ui.defaultLink} {isRtl ? "←" : "→"}
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="bot-footer">
            <button
              type="button"
              className="bot-whatsapp-btn"
              onClick={openWhatsApp}
            >
              {botData.contactUs.label}
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        className="bot-toggle-btn"
        onClick={() => setIsOpen((o) => !o)}
        aria-label={isOpen ? ui.closeBot : ui.open}
        aria-expanded={isOpen}
      >
        {isOpen ? <IoClose size={26} /> : <RiCustomerService2Fill size={28} />}
      </button>
    </div>
  );
}

export default CustomerServiceBot;
