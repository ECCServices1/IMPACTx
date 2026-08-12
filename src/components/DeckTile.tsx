import { Link } from "react-router-dom";
import { clsx } from "clsx";
import { accentFor, accentVars, iconFor, type Deck } from "@/lib/deck";

/**
 * A deck on the shelf, drawn as a small stack of cards rather than a tile: two
 * cards peeking out behind a coloured cover. Real decks have coloured backs and
 * plain faces, and keeping that split is what makes the shelf read as a shelf
 * and the play screen read as a card in your hand.
 */
export function DeckTile({ deck, seenCount = 0, style }: {
  deck: Deck; seenCount?: number; style?: React.CSSProperties;
}) {
  const accent = accentFor(deck.accent);
  const Icon = iconFor(deck.icon);
  const total = deck.cards.length;
  const done = total > 0 && seenCount >= total;
  const pct = total === 0 ? 0 : Math.min(100, Math.round((seenCount / total) * 100));

  return (
    <Link
      to={`/deck/${deck.slug}`}
      aria-label={`${deck.title}. ${deck.subtitle}. ${total} cards.`}
      className="group relative block animate-fade-up"
      style={{ ...accentVars(deck.accent), ...style }}
    >
      {/* The cards underneath. Fanned a touch so the stack has depth, and
          fanned a touch further on hover. Rotation stays in utility classes
          rather than an inline transform, which would win over the hover. */}
      <div
        className="absolute inset-0 origin-bottom -rotate-3 rounded-card bg-card stack-shadow transition-transform duration-300 ease-out group-hover:-rotate-[5deg]"
        aria-hidden
      />
      <div
        className="absolute inset-0 origin-bottom rotate-[1.5deg] rounded-card bg-card stack-shadow transition-transform duration-300 ease-out group-hover:rotate-[3.5deg]"
        aria-hidden
      />

      {/* The cover. */}
      <div
        className={clsx(
          "card-stock grain relative flex aspect-[5/7] flex-col overflow-hidden p-5 text-white",
          "transition-all duration-300 ease-out group-hover:-translate-y-1.5 group-hover:shadow-lift",
        )}
        style={{
          backgroundImage: `linear-gradient(155deg, ${accent.base} 0%, ${accent.ink} 118%)`,
          borderColor: "rgba(0,0,0,0.10)",
        }}
      >
        {/* A frame, the way a printed card back has one. */}
        <div className="pointer-events-none absolute inset-[9px] rounded-[13px] border border-white/25" aria-hidden />
        <Icon
          className="pointer-events-none absolute -bottom-7 -right-6 h-36 w-36 text-white opacity-[0.14] transition-transform duration-500 ease-out group-hover:scale-105"
          strokeWidth={1}
          aria-hidden
        />

        <div className="relative mt-1">
          <h3 className="font-serif text-[21px] font-medium leading-[1.12] tracking-[-0.01em] text-balance">
            {deck.title}
          </h3>
          <p className="mt-1.5 text-[12.5px] leading-snug text-white/75">{deck.subtitle}</p>
        </div>

        <div className="relative mt-auto">
          <div className="flex items-center justify-between text-[11px] font-medium text-white/80">
            <span>{total} cards</span>
            {done ? <span>Played</span> : seenCount > 0 ? <span className="tabular-nums">{pct}%</span> : null}
          </div>
          {seenCount > 0 && (
            <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-white/25" aria-hidden>
              <div
                className="h-full rounded-full bg-white/90 transition-[width] duration-500 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
