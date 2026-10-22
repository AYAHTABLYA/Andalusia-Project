import { useCallback, useEffect, useRef, useState } from "react";

type ToastState = { visible: boolean; message: string };

const HIDDEN: ToastState = { visible: false, message: "" };

function useToast(duration = 3800) {
  const [toast, setToast] = useState<ToastState>(HIDDEN);
  const timer = useRef<number | undefined>(undefined);

  const closeToast = useCallback(() => {
    window.clearTimeout(timer.current);
    setToast(HIDDEN);
  }, []);

  const showToast = useCallback(
    (message: string) => {
      window.clearTimeout(timer.current);
      setToast({ visible: true, message });
      timer.current = window.setTimeout(() => setToast(HIDDEN), duration);
    },
    [duration],
  );

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return { toast, showToast, closeToast };
}

export default useToast;
