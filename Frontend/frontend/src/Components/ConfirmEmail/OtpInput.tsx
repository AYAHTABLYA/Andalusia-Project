import { useRef } from "react";
import type {
  ChangeEvent,
  ClipboardEvent,
  FocusEvent,
  KeyboardEvent,
} from "react";
import "./otp-input.css";

export type OtpStatus = "idle" | "error" | "success";

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  /** Fired once, from user input, when every box is filled. */
  onComplete?: (value: string) => void;
  length?: number;
  disabled?: boolean;
  status?: OtpStatus;
  autoFocus?: boolean;
  /** id of the visible label, for screen readers. */
  labelledBy?: string;
};

const onlyDigits = (s: string) => s.replace(/\D/g, "");

// Six separate boxes that behave like one field: auto-advance, backspace to the
// previous box, arrow keys, paste a whole code, and one-time-code autofill.
function OtpInput({
  value,
  onChange,
  onComplete,
  length = 6,
  disabled = false,
  status = "idle",
  autoFocus = false,
  labelledBy,
}: OtpInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  const focusBox = (i: number) => {
    const box = refs.current[Math.max(0, Math.min(length - 1, i))];
    box?.focus();
    box?.select();
  };

  const commit = (next: string, focusIndex: number) => {
    const clean = onlyDigits(next).slice(0, length);
    onChange(clean);
    if (clean.length === length) {
      refs.current[length - 1]?.blur();
      onComplete?.(clean);
    } else {
      focusBox(focusIndex);
    }
  };

  // Typing, or a browser/OS autofill dropping several digits into one box.
  const handleChange = (i: number, e: ChangeEvent<HTMLInputElement>) => {
    const typed = onlyDigits(e.target.value);
    if (!typed) {
      // Box was cleared (e.g. selected and deleted).
      onChange(value.slice(0, i) + value.slice(i + 1));
      return;
    }
    const before = value.slice(0, i);
    const after = value.slice(i + 1);
    // A box that already held a digit now shows two: keep only the new one.
    // Three or more at once means autofill / a multi-digit insert: keep them all.
    const incoming =
      typed.length === 2 && digits[i]
        ? typed.replace(digits[i], "").slice(-1) || digits[i]
        : typed;
    commit(before + incoming + after, i + incoming.length);
  };

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "Backspace":
        e.preventDefault();
        if (digits[i]) {
          onChange(value.slice(0, i) + value.slice(i + 1));
        } else if (i > 0) {
          onChange(value.slice(0, i - 1) + value.slice(i));
          focusBox(i - 1);
        }
        break;
      case "Delete":
        e.preventDefault();
        onChange(value.slice(0, i) + value.slice(i + 1));
        break;
      case "ArrowLeft":
        e.preventDefault();
        focusBox(i - 1);
        break;
      case "ArrowRight":
        e.preventDefault();
        focusBox(i + 1);
        break;
      case "Home":
        e.preventDefault();
        focusBox(0);
        break;
      case "End":
        e.preventDefault();
        focusBox(length - 1);
        break;
    }
  };

  const handlePaste = (i: number, e: ClipboardEvent<HTMLInputElement>) => {
    const pasted = onlyDigits(e.clipboardData.getData("text"));
    if (!pasted) return;
    e.preventDefault();
    // A full 6-digit paste replaces everything; a partial one fills from this box.
    const start = pasted.length >= length ? 0 : i;
    commit(value.slice(0, start) + pasted, start + pasted.length);
  };

  // Never leave a gap: typing always lands in the first empty box.
  const handleFocus = (i: number, e: FocusEvent<HTMLInputElement>) => {
    const firstEmpty = Math.min(value.length, length - 1);
    if (i > firstEmpty) focusBox(firstEmpty);
    else e.target.select();
  };

  return (
    <div
      className={`otp otp--${status}${disabled ? " is-disabled" : ""}`}
      role="group"
      aria-labelledby={labelledBy}
      dir="ltr"
    >
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className={`otp_box${digit ? " is-filled" : ""}`}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          autoFocus={autoFocus && i === 0}
          aria-label={`Digit ${i + 1} of ${length}`}
          aria-invalid={status === "error" || undefined}
          disabled={disabled}
          value={digit}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={(e) => handlePaste(i, e)}
          onFocus={(e) => handleFocus(i, e)}
        />
      ))}
    </div>
  );
}

export default OtpInput;
