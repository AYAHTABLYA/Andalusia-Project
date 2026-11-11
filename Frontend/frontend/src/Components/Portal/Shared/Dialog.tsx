import { useEffect } from "react";
import type { ReactNode } from "react";
import "./style.css";

type Props = {
  icon: string;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

// Modal shell shared by the Edit Profile and Transaction dialogs.
function Dialog({ icon, title, subtitle, onClose, children, footer }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="portal-ui_overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="portal-ui_dialog" role="dialog" aria-modal="true" aria-label={title}>
        <div className="portal-ui_dialog-head">
          <div className="portal-ui_dialog-title">
            <span className="portal-ui_dialog-icon">
              <span className="material-symbols-outlined">{icon}</span>
            </span>
            <div>
              <h2>{title}</h2>
              {subtitle && <p>{subtitle}</p>}
            </div>
          </div>
          <button type="button" className="portal-ui_dialog-close" aria-label="Close" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="portal-ui_dialog-body">{children}</div>
        {footer && <div className="portal-ui_dialog-foot">{footer}</div>}
      </div>
    </div>
  );
}

export default Dialog;
