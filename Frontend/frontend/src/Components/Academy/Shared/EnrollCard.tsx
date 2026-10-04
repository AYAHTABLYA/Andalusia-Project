import "./style.css";

type Props = {
  label: string;
  price: string;
  note: string;
  primaryText: string;
  primaryMsg: string;
  secondaryText: string;
  secondaryMsg: string;
  bullets: string[];
};

function EnrollCard({ label, price, note, primaryText, primaryMsg, secondaryText, secondaryMsg, bullets }: Props) {
  return (
    <div className="enroll-card_box-1">
      <div className="enroll-card_box-2">
        <div>
          <span className="enroll-card_text-1">{label}</span>
          <div className="enroll-card_box-3">{price}</div>
          <p className="enroll-card_text-2">{note}</p>
        </div>
        <div className="enroll-card_box-4">
          <button onClick={() => alert(primaryMsg)} className="enroll-card_btn-1">
            {primaryText}
          </button>
          <button onClick={() => alert(secondaryMsg)} className="enroll-card_btn-2">
            <span className="enroll-card_text-3 material-symbols-outlined">download</span>
            <span>{secondaryText}</span>
          </button>
        </div>
        <div className="enroll-card_box-5">
          {bullets.map((b) => <div key={b}>• {b}</div>)}
        </div>
      </div>
    </div>
  );
}

export default EnrollCard;
