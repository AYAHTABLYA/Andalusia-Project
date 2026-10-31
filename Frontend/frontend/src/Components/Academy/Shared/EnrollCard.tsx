import "./style.css";

type Props = {
  label: string;
  price: string;
  note: string;
  primaryText: string;
  onPrimary: () => void;
  secondaryText: string;
  onSecondary: () => void;
  secondaryBusy?: boolean;
  feedback?: { kind: "success" | "error"; text: string } | null;
  bullets: string[];
};

function EnrollCard({
  label, price, note, primaryText, onPrimary, secondaryText, onSecondary, secondaryBusy = false, feedback, bullets,
}: Props) {
  return (
    <div className="enroll-card_box-1">
      <div className="enroll-card_box-2">
        <div>
          <span className="enroll-card_text-1">{label}</span>
          <div className="enroll-card_box-3">{price}</div>
          {note && <p className="enroll-card_text-2">{note}</p>}
        </div>
        <div className="enroll-card_box-4">
          <button type="button" onClick={onPrimary} className="enroll-card_btn-1">
            {primaryText}
          </button>
          <button type="button" onClick={onSecondary} disabled={secondaryBusy} className="enroll-card_btn-2">
            <span className="enroll-card_text-3 material-symbols-outlined">download</span>
            <span>{secondaryBusy ? "Preparing…" : secondaryText}</span>
          </button>
          {feedback && (
            <p
              role={feedback.kind === "error" ? "alert" : "status"}
              className={`enroll-card_feedback enroll-card_feedback--${feedback.kind}`}
            >
              {feedback.text}
            </p>
          )}
        </div>
        {bullets.length > 0 && (
          <div className="enroll-card_box-5">
            {bullets.map((b) => <div key={b}>• {b}</div>)}
          </div>
        )}
      </div>
    </div>
  );
}

export default EnrollCard;
