import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Share2, Trash2 } from "lucide-react";
import { clsx } from "clsx";
import { PlayCard } from "@/components/PlayCard";
import { Toast } from "@/components/Toast";
import { useToast } from "@/lib/useToast";
import { findCard, type Card, type Deck } from "@/lib/deck";
import { useAllDecks } from "@/lib/useDecks";
import { useSavedCards } from "@/lib/storage";
import { shareCard } from "@/lib/share";

/** The shelf: cards someone wanted to come back to. */
export default function SavedPage() {
  const decks = useAllDecks();
  const { saved, toggle, clear } = useSavedCards();
  const { toast, show } = useToast();
  const [filter, setFilter] = useState<string | null>(null);

  const cards = useMemo(
    () => saved.map(id => findCard(decks, id)).filter((x): x is { deck: Deck; card: Card } => !!x),
    [decks, saved],
  );

  const deckList = useMemo(() => {
    const seen = new Map<string, Deck>();
    for (const { deck } of cards) seen.set(deck.slug, deck);
    return [...seen.values()];
  }, [cards]);

  const shown = filter ? cards.filter(c => c.deck.slug === filter) : cards;

  const onShare = async (deck: Deck, card: Card) => {
    const result = await shareCard(deck, card);
    if (result === "copied") show("Card and link copied.");
    else if (result === "failed") show("Could not share that card.");
  };

  const onRemove = (card: Card) => {
    toggle(card.id);
    show("Removed from saved.");
  };

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
      <Toast message={toast} />

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-[34px] font-medium leading-tight tracking-[-0.025em]">Saved</h1>
          <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-ink-soft text-pretty">
            The cards you kept. Bring them to a group, a mentor, a long drive, or a late night
            with someone you trust.
          </p>
        </div>
        {cards.length > 0 && (
          <button
            type="button"
            onClick={() => { clear(); show("Shelf cleared."); }}
            className="btn btn-sm btn-ghost"
          >
            <Trash2 className="h-4 w-4" /> Clear the shelf
          </button>
        )}
      </header>

      {deckList.length > 1 && (
        <div className="mt-7 flex flex-wrap gap-2">
          <Chip active={filter === null} onClick={() => setFilter(null)}>All {cards.length}</Chip>
          {deckList.map(deck => (
            <Chip key={deck.slug} active={filter === deck.slug} onClick={() => setFilter(deck.slug)}>
              {deck.title}
            </Chip>
          ))}
        </div>
      )}

      {cards.length === 0 ? (
        <div className="panel mt-10 p-12 text-center">
          <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-ink/[0.05] text-ink-soft">
            <Bookmark className="h-5 w-5" />
          </span>
          <h2 className="mt-4 font-serif text-[22px] font-medium">Nothing saved yet</h2>
          <p className="mx-auto mt-1.5 max-w-sm text-[14.5px] leading-relaxed text-ink-soft">
            While you read a deck, swipe a card to the right or press Save, and it lands here.
          </p>
          <Link to="/" className="btn btn-md btn-primary mt-6">Pick a deck</Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map(({ deck, card }) => (
            <div key={card.id} className="group relative animate-fade-up">
              <PlayCard card={card} deck={deck} size="sm" aspect={false} className="h-full" />
              <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity duration-200 focus-within:opacity-100 group-hover:opacity-100">
                <IconButton label="Share this card" onClick={() => onShare(deck, card)}>
                  <Share2 className="h-3.5 w-3.5" />
                </IconButton>
                <IconButton label="Remove from saved" onClick={() => onRemove(card)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </IconButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        "h-8 rounded-full border px-3.5 text-[13px] font-medium transition-colors",
        active ? "border-transparent bg-ink text-paper" : "border-line bg-card text-ink-soft hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid h-8 w-8 place-items-center rounded-full border border-line bg-card text-ink-soft shadow-card transition-colors hover:text-ink"
    >
      {children}
    </button>
  );
}
