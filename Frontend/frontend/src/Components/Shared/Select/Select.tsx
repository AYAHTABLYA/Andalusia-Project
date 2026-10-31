import {
  Children,
  Fragment,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import "./select.css";

/**
 * Drop-in replacement for the native select element.
 * Same props (value / onChange(e) / name / id / required / disabled / className)
 * and the same <option> children, but the list is drawn with the same look as
 * the LanguageSwitcher dropdown instead of the browser's default list.
 */

type Opt = { value: string; label: string; disabled: boolean };

type SelectProps = {
  id?: string;
  name?: string;
  value?: string | number | null;
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  title?: string;
  "aria-label"?: string;
  children?: ReactNode;
};

function textOf(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement(node)) {
    return textOf((node.props as { children?: ReactNode }).children);
  }
  return "";
}

function collect(children: ReactNode, out: Opt[]) {
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const props = child.props as {
      value?: string | number;
      disabled?: boolean;
      children?: ReactNode;
    };
    if (child.type === Fragment) {
      collect(props.children, out);
      return;
    }
    if (child.type === "option") {
      const label = textOf(props.children).replace(/\s+/g, " ").trim();
      out.push({
        value: props.value !== undefined ? String(props.value) : label,
        label,
        disabled: Boolean(props.disabled),
      });
    }
  });
}

type Pos = { top?: number; bottom?: number; left: number; width: number; maxHeight: number };

const MENU_MIN_WIDTH = 180;
const GAP = 6;

export function Select({
  id,
  name,
  value,
  onChange,
  className = "",
  disabled,
  required,
  title,
  children,
  "aria-label": ariaLabel,
}: SelectProps) {
  const options = useMemo(() => {
    const out: Opt[] = [];
    collect(children, out);
    return out;
  }, [children]);

  const current = value === null || value === undefined ? "" : String(value);
  const selected = options.find((o) => o.value === current) ?? options[0];

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [pos, setPos] = useState<Pos | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const uid = useId();
  const listId = `${uid}-list`;

  const place = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const rtl = document.documentElement.dir === "rtl";
    const width = Math.max(rect.width, MENU_MIN_WIDTH);
    let left = rtl ? rect.right - width : rect.left;
    left = Math.min(Math.max(8, left), window.innerWidth - width - 8);
    const below = window.innerHeight - rect.bottom - GAP - 8;
    const above = rect.top - GAP - 8;
    const wanted = Math.min(280, options.length * 42 + 12);
    if (below < wanted && above > below) {
      setPos({
        bottom: window.innerHeight - rect.top + GAP,
        left,
        width,
        maxHeight: Math.min(280, above),
      });
    } else {
      setPos({
        top: rect.bottom + GAP,
        left,
        width,
        maxHeight: Math.min(280, Math.max(120, below)),
      });
    }
  }, [options.length]);

  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onScroll = (e: Event) => {
      if (menuRef.current && e.target instanceof Node && menuRef.current.contains(e.target)) return;
      place();
    };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, place]);

  // keep the highlighted row visible while using the keyboard
  useEffect(() => {
    if (!open || active < 0) return;
    menuRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const openMenu = () => {
    if (disabled) return;
    const idx = options.findIndex((o) => o.value === selected?.value);
    setActive(idx);
    setOpen(true);
  };

  const choose = (opt: Opt) => {
    if (opt.disabled) return;
    setOpen(false);
    triggerRef.current?.focus();
    if (opt.value === current) return;
    const target = { name: name ?? "", value: opt.value, id: id ?? "" };
    onChange?.({
      target,
      currentTarget: target,
      type: "change",
      preventDefault() {},
      stopPropagation() {},
    } as unknown as ChangeEvent<HTMLSelectElement>);
  };

  const move = (dir: 1 | -1) => {
    if (!options.length) return;
    let i = active;
    for (let n = 0; n < options.length; n++) {
      i = (i + dir + options.length) % options.length;
      if (!options[i].disabled) break;
    }
    setActive(i);
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openMenu();
      }
      return;
    }
    if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
    else if (e.key === "Home") { e.preventDefault(); setActive(0); }
    else if (e.key === "End") { e.preventDefault(); setActive(options.length - 1); }
    else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (options[active]) choose(options[active]);
    } else if (e.key === "Escape" || e.key === "Tab") {
      if (e.key === "Escape") e.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div className={`ui-select${open ? " is-open" : ""}`}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        className={`ui-select_trigger ${className}`.trim()}
        disabled={disabled}
        title={title}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open && active >= 0 ? `${uid}-opt-${active}` : undefined}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKeyDown}
      >
        <span className="ui-select_value">{selected?.label ?? ""}</span>
        <svg className="ui-select_chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {(required || name) && (
        <input
          className="ui-select_native"
          tabIndex={-1}
          aria-hidden="true"
          name={name}
          required={required}
          value={current}
          onChange={() => undefined}
        />
      )}

      {open &&
        pos &&
        createPortal(
          <div
            ref={menuRef}
            id={listId}
            role="listbox"
            className="ui-select_menu"
            style={{
              top: pos.top,
              bottom: pos.bottom,
              left: pos.left,
              minWidth: pos.width,
              maxHeight: pos.maxHeight,
            }}
          >
            {options.map((opt, i) => {
              const isSel = opt.value === selected?.value;
              return (
                <button
                  key={`${opt.value}-${i}`}
                  id={`${uid}-opt-${i}`}
                  data-index={i}
                  type="button"
                  role="option"
                  aria-selected={isSel}
                  disabled={opt.disabled}
                  className={`ui-select_option${isSel ? " is-selected" : ""}${i === active ? " is-active" : ""}`}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(opt)}
                >
                  <span className="ui-select_option-label">{opt.label}</span>
                  {isSel && <span className="ui-select_check">✓</span>}
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </div>
  );
}

export default Select;
