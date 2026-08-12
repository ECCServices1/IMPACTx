import { useCallback, useEffect, useRef, useState } from "react";

/**
 * A single line of feedback at the foot of the screen. One at a time, gone in a
 * moment, and it never blocks anything.
 */
export function useToast() {
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  const show = useCallback((message: string) => {
    setToast(message);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  return { toast, show };
}
