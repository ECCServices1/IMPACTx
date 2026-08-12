import type { ReactNode } from "react";
import { clsx } from "clsx";
import { DEPTHS, accentVars, iconFor, type Card, type Deck } from "@/lib/deck";

/**
 * The card.
 *
 * Everything here is in service of one thing: that this reads as a printed card
 * and not a coloured rectangle. Card proportions, a hairline edge, real margins,
 * a serif question, a rule at the foot, the deck's colour used only as a mark
 * and a band, a card number where a card number belongs, and a grain over the
 * whole face so it has the texture of stock rather than the flatness of screen.
 */

const SIZES = {
  /** Saved shelf and session summaries. */
  sm: {
    frame: "rounded-[16px]",
    pad: "px-5 py-5",
    prompt: "text-[17px] sm:text-lg leading-[1.32]",
    follow: "text-[13px]",
    meta: "text-[10px]",
  },
  /** The card you are playing. */
  md: {
    frame: "rounded-card",
    pad: "px-7 py-7 sm:px-9 sm:py-9",
    prompt: "text-[26px] sm:text-[32px] leading-[1.22]",
    follow: "text-[15px]",
    meta: "text-[11px]",
  },
  /** A card up on a screen for a room to read. */
  lg: {
    frame: "rounded-[28px]",
    pad: "px-10 py-10 sm:px-14 sm:py-14",
    prompt: "text-[34px] sm:text-[52px] leading-[1.14]",
    follow: "text-lg sm:text-2xl",
    meta: "text-xs",
  },
} as const;

export type PlayCardProps = {
  card: Card;
  deck: Pick<Deck, "title" | "accent" | "icon">;
  size?: keyof typeof SIZES;
  /** "3 of 8", printed small at the foot like a real deck. */
  counter?: string;
  /** Keeps card proportions. Turn off where the card sits in a list. */
  aspect?: boolean;
  className?: string;
  children?: ReactNode;
};

export function PlayCard({
  card, deck, size = "md", counter, aspect = true, className, children,
}: PlayCardProps) {
  const s = SIZES[size];
  const Icon = iconFor(deck.icon);

  return (
    <article
      style={accentVars(deck.accent)}
      className={clsx(
        "card-stock grain flex flex-col overflow-hidden text-left",
        s.frame,
        aspect && "aspect-[5/7]",
        className,
      )}
    >
      {/* The colour band across the head of the card, as a printed deck has. */}
      <div className="absolute inset-x-0 top-0 h-[5px] bg-accent" aria-hidden />

      {/* The deck's motif, embossed rather than drawn: barely there, and it
          gives the lower half of the card something to hold. */}
      <Icon
        className="pointer-events-none absolute -bottom-8 -right-6 h-40 w-40 text-accent opacity-[0.06]"
        strokeWidth={1}
        aria-hidden
      />

      <div className={clsx("relative flex flex-1 flex-col", s.pad)}>
        <header className="flex items-center justify-between gap-3">
          <span className={clsx("label-eyebrow text-accent-ink", s.meta)}>{deck.title}</span>
          <span className={clsx("font-medium uppercase tracking-[0.12em] text-ink-faint", s.meta)}>
            {DEPTHS[card.depth]?.label ?? "Warm"}
          </span>
        </header>

        <div className="flex flex-1 flex-col justify-center py-7">
          <p className={clsx("font-serif font-medium text-balance text-ink", s.prompt)}>
            {card.prompt}
          </p>
          {card.followUp && (
            <p className={clsx("mt-4 max-w-[36ch] text-pretty leading-relaxed text-ink-soft", s.follow)}>
              {card.followUp}
            </p>
          )}
        </div>

        <footer className="mt-auto">
          {card.scripture && (
            <p
              className={clsx(
                "mb-3 inline-block rounded-full px-2.5 py-1 font-medium text-accent-ink",
                s.meta,
              )}
              style={{ background: "var(--accent-wash)" }}
            >
              {card.scripture}
            </p>
          )}
          <div className="flex items-end justify-between gap-3 border-t border-line pt-3">
            {/* Not uppercased: the lowercase x is the mark. */}
            <span className={clsx("font-semibold tracking-[0.12em] text-ink-faint", s.meta)}>
              IMPACT<span className="text-accent">x</span>
            </span>
            {counter && (
              <span className={clsx("tabular-nums text-ink-faint", s.meta)}>{counter}</span>
            )}
          </div>
        </footer>
      </div>

      {children}
    </article>
  );
}
