import "./style.css";

type Props = { visible: boolean; message: string; onClose: () => void };

function Toast({ visible, message, onClose }: Props) {
  if (!visible) return null;

  return (
    <div className="portal-ui_toast" role="status" aria-live="polite">
      <span className="portal-ui_toast-icon material-symbols-outlined">check_circle</span>
      <span>{message}</span>
      <button type="button" className="portal-ui_toast-close" aria-label="Dismiss" onClick={onClose}>
        <span className="material-symbols-outlined">close</span>
      </button>
    </div>
  );
}

export default Toast;
