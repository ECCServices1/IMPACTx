import { useCallback, useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import type { Card, Deck } from "@/lib/deck";
import { PlayCard } from "./PlayCard";

/**
 * A stack you can flick through. Dragging in either direction moves to the next
 * card; dragging right far enough also keeps it. Everything the gesture does,
 * the buttons under the stack do too, and so do the arrow keys.
 */

const COMMIT_PX = 88;
const EXIT_MS = 320;

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export type CardStackProps = {
  deck: Deck;
  cards: Card[];
  index: number;
  onAdvance: (card: Card, keep: boolean) => void;
  isSaved: (cardId: string) => boolean;
};

export function CardStack({ deck, cards, index, onAdvance, isSaved }: CardStackProps) {
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false });
  const [exit, setExit] = useState<"keep" | "next" | null>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const exitRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  const top = cards[index];
  const behind = cards.slice(index + 1, index + 3);

  useEffect(() => () => { if (timerRef.current) window.clearTimeout(timerRef.current); }, []);
  useEffect(() => { setDrag({ x: 0, y: 0, active: false }); }, [top?.id]);

  const commit = useCallback((mode: "keep" | "next") => {
    if (exitRef.current || !top) return;
    exitRef.current = true;
    setExit(mode);
    const finish = () => {
      onAdvance(top, mode === "keep");
      exitRef.current = false;
      setExit(null);
      setDrag({ x: 0, y: 0, active: false });
      timerRef.current = null;
    };
    if (reducedMotion()) finish();
    else timerRef.current = window.setTimeout(finish, EXIT_MS);
  }, [onAdvance, top]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (exitRef.current || !top) return;
    if ((e.target as HTMLElement).closest("button, a")) return;
    startRef.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ x: 0, y: 0, active: true });
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!startRef.current || exitRef.current) return;
    setDrag({ x: e.clientX - startRef.current.x, y: e.clientY - startRef.current.y, active: true });
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!startRef.current) return;
    const dx = e.clientX - startRef.current.x;
    startRef.current = null;
    if (dx >= COMMIT_PX) commit("keep");
    else if (dx <= -COMMIT_PX) commit("next");
    else setDrag({ x: 0, y: 0, active: false });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!top) return;
    if (e.key === "ArrowRight") { e.preventDefault(); commit("keep"); }
    else if (e.key === "ArrowLeft" || e.key === " ") { e.preventDefault(); commit("next"); }
  };

  if (!top) return null;

  const lean = exit === "keep" ? 1 : exit === "next" ? -1 : 0;
  const transform = exit
    ? `translate3d(${lean * 125}%, ${lean * 5}%, 0) rotate(${lean * 15}deg)`
    : `translate3d(${drag.x}px, ${drag.y * 0.3}px, 0) rotate(${drag.x / 26}deg)`;

  const keepHint = Math.min(1, Math.max(0, drag.x) / COMMIT_PX);
  const nextHint = Math.min(1, Math.max(0, -drag.x) / COMMIT_PX);

  return (
    <div
      tabIndex={0}
      onKeyDown={onKeyDown}
      aria-roledescription="Card deck"
      aria-label={`${deck.title}. Card ${index + 1} of ${cards.length}. Right arrow keeps this card, left arrow moves on.`}
      className="mx-auto w-full max-w-[380px] rounded-card outline-none"
    >
      <div className="relative aspect-[5/7]">
        {behind.map((card, i) => (
          <div
            key={card.id}
            className="absolute inset-0 transition-transform duration-300 ease-out"
            style={{
              transform: `translateY(${(i + 1) * 10}px) scale(${1 - (i + 1) * 0.035})`,
              zIndex: 10 - i,
              opacity: 1 - (i + 1) * 0.25,
            }}
            aria-hidden
          >
            <PlayCard card={card} deck={deck} className="h-full" />
          </div>
        ))}

        <div
          className={clsx("absolute inset-0 z-20 touch-none", exit ? "pointer-events-none" : "cursor-grab active:cursor-grabbing")}
          style={{
            transform,
            opacity: exit ? 0 : 1,
            transition: drag.active ? "none" : `transform ${EXIT_MS}ms cubic-bezier(0.22,1,0.36,1), opacity ${EXIT_MS}ms linear`,
            boxShadow: drag.active ? "0 30px 60px -24px rgba(23,19,16,0.28)" : undefined,
            borderRadius: "20px",
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <PlayCard
            card={top}
            deck={deck}
            counter={`${index + 1} of ${cards.length}`}
            className="h-full"
          >
            <Stamp label="Keep" side="left" opacity={keepHint} tone="accent" />
            <Stamp label="Next" side="right" opacity={nextHint} tone="ink" />
            {isSaved(top.id) && drag.x === 0 && !exit && (
              <span
                className="absolute right-5 top-5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-accent-ink"
                style={{ background: "var(--accent-wash)" }}
              >
                Saved
              </span>
            )}
          </PlayCard>
        </div>
      </div>
    </div>
  );
}

function Stamp({ label, side, opacity, tone }: {
  label: string; side: "left" | "right"; opacity: number; tone: "accent" | "ink";
}) {
  return (
    <span
      aria-hidden
      className={clsx(
        "pointer-events-none absolute top-16 rounded-lg border-2 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em]",
        side === "left" ? "left-6 -rotate-12" : "right-6 rotate-12",
        tone === "accent" ? "border-accent text-accent" : "border-ink/60 text-ink/70",
      )}
      style={{ opacity }}
    >
      {label}
    </span>
  );
}
