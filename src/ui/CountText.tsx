import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'react-native-reanimated';

/** Counts a money amount from its old value to the new one so changes feel like something happened. Renders through `children`. */
export function CountText({ cents, ms = 700, children }: { cents: number; ms?: number; children: (shown: number) => React.ReactNode }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? cents : 0);
  const from = useRef(reduce ? cents : 0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    if (reduce) {
      setShown(cents);
      from.current = cents;
      return;
    }
    const a = from.current;
    const b = cents;
    if (a === b) return;
    const t0 = Date.now();
    const step = () => {
      const k = Math.min(1, (Date.now() - t0) / ms);
      const e = 1 - Math.pow(1 - k, 3);
      const v = Math.round(a + (b - a) * e);
      setShown(v);
      from.current = v;
      if (k < 1) raf.current = requestAnimationFrame(step);
      else from.current = b;
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current != null) cancelAnimationFrame(raf.current);
    };
  }, [cents, reduce]);
  return <>{children(shown)}</>;
}
