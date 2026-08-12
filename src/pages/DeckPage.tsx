import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Bookmark, Check, RotateCcw, Share2, Shuffle, Users } from "lucide-react";
import { CardStack } from "@/components/CardStack";
import { PlayCard } from "@/components/PlayCard";
import { Toast } from "@/components/Toast";
import { useToast } from "@/lib/useToast";
import { accentVars, shuffled, type Card } from "@/lib/deck";
import { useDeck } from "@/lib/useDecks";
import { useSavedCards, useSeenCards } from "@/lib/storage";
import { shareCard } from "@/lib/share";

/**
 * Reading a deck on your own. The queue picks up where the last visit left off,
 * and a shared link that names a card opens on that card.
 */
export default function DeckPage() {
  const { slug } = useParams<{ slug: string }>();
  const [params, setParams] = useSearchParams();
  const deck = useDeck(slug);
  const { isSaved, toggle } = useSavedCards();
  const { seenIn, markSeen, resetDeck } = useSeenCards();
  const { toast, show } = useToast();

  const [queue, setQueue] = useState<Card[]>([]);
  const [index, setIndex] = useState(0);
  const builtFor = useRef<string | null>(null);
  const requestedCard = params.get("card");

  // Build the run once per deck: whatever has not been read yet, or the whole
  // deck again once it has. A link to a specific card wins over both.
  useEffect(() => {
    if (!deck || builtFor.current === deck.slug) return;
    builtFor.current = deck.slug;

    if (requestedCard && deck.cards.some(c => c.id === requestedCard)) {
      const start = deck.cards.findIndex(c => c.id === requestedCard);
      setQueue(deck.cards);
      setIndex(start);
      return;
    }
    const seen = new Set(seenIn(deck.slug));
    const unread = deck.cards.filter(c => !seen.has(c.id));
    setQueue(unread.length > 0 ? unread : deck.cards);
    setIndex(0);
  }, [deck, requestedCard, seenIn]);

  const advance = useCallback((card: Card, keep: boolean) => {
    if (!deck) return;
    markSeen(deck.slug, card.id);
    if (keep && !isSaved(card.id)) {
      toggle(card.id);
      show("Kept. It is on your saved shelf.");
    }
    // A deep link has done its job once the reader moves on.
    if (requestedCard) setParams({}, { replace: true });
    setIndex(i => i + 1);
  }, [deck, isSaved, markSeen, requestedCard, setParams, show, toggle]);

  const current = queue[index] ?? null;
  const finished = queue.length > 0 && index >= queue.length;
  const remaining = Math.max(0, queue.length - index);

  const savedFromRun = useMemo(
    () => queue.slice(0, index).filter(c => isSaved(c.id)),
    [queue, index, isSaved],
  );

  if (!deck) {
    return (
      <div className="mx-auto max-w-lg px-5 py-24 text-center">
        <div className="panel p-10">
          <h1 className="font-serif text-2xl font-medium">No deck here</h1>
          <p className="mt-2 text-[14.5px] text-ink-soft">That link may be out of date.</p>
          <Link to="/" className="btn btn-md btn-primary mt-6">
            <ArrowLeft className="h-4 w-4" /> All decks
          </Link>
        </div>
      </div>
    );
  }

  const startOver = () => {
    resetDeck(deck.slug);
    setQueue(shuffled(deck.cards));
    setIndex(0);
    show("Shuffled and reset.");
  };

  const shuffleRest = () => {
    if (remaining <= 1) return;
    setQueue(shuffled(queue.slice(index)));
    setIndex(0);
    show("Shuffled.");
  };

  const onShare = async () => {
    if (!current) return;
    const result = await shareCard(deck, current);
    if (result === "copied") show("Card and link copied.");
    else if (result === "failed") show("Could not share that card.");
  };

  const onSave = () => {
    if (!current) return;
    const nowSaved = toggle(current.id);
    show(nowSaved ? "Saved." : "Removed from saved.");
  };

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-12" style={accentVars(deck.accent)}>
      <Toast message={toast} />

      <div className="mb-7 flex items-start justify-between gap-4">
        <div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-[13px] text-ink-soft transition-colors hover:text-ink">
            <ArrowLeft className="h-4 w-4" /> Decks
          </Link>
          <h1 className="mt-2.5 font-serif text-[30px] font-medium leading-tight tracking-[-0.02em]">{deck.title}</h1>
          <p className="mt-1.5 max-w-xl text-[14.5px] leading-relaxed text-ink-soft text-pretty">{deck.blurb}</p>
          <p className="mt-2 text-[12.5px] text-ink-faint">Best with {deck.bestWith.toLowerCase()}</p>
        </div>

        <div className="hidden shrink-0 gap-2 sm:flex">
          <button type="button" onClick={shuffleRest} disabled={remaining <= 1} className="btn btn-sm btn-quiet">
            <Shuffle className="h-4 w-4" /> Shuffle
          </button>
          <Link to={`/group?deck=${deck.slug}`} className="btn btn-sm btn-quiet">
            <Users className="h-4 w-4" /> Play as a group
          </Link>
        </div>
      </div>

      {finished ? (
        <FinishedPanel
          deck={deck}
          saved={savedFromRun}
          onStartOver={startOver}
        />
      ) : current ? (
        <div className="flex flex-col items-center">
          <CardStack deck={deck} cards={queue} index={index} onAdvance={advance} isSaved={isSaved} />

          <div className="mt-7 flex items-center gap-2.5">
            <button type="button" onClick={onSave} className="btn btn-md btn-quiet" aria-pressed={isSaved(current.id)}>
              <Bookmark className={isSaved(current.id) ? "h-4 w-4 fill-current" : "h-4 w-4"} />
              {isSaved(current.id) ? "Saved" : "Save"}
            </button>
            <button type="button" onClick={onShare} className="btn btn-md btn-quiet">
              <Share2 className="h-4 w-4" /> Share
            </button>
            <button
              type="button"
              onClick={() => advance(current, false)}
              className="btn btn-md btn-accent min-w-[128px]"
            >
              Next card
            </button>
          </div>

          <p className="mt-4 text-center text-[12.5px] text-ink-faint">
            {remaining} to go · swipe, or use the arrow keys
          </p>
        </div>
      ) : (
        <div className="panel p-12 text-center text-[14.5px] text-ink-soft">This deck has no cards yet.</div>
      )}
    </div>
  );
}

function FinishedPanel({ deck, saved, onStartOver }: {
  deck: NonNullable<ReturnType<typeof useDeck>>; saved: Card[]; onStartOver: () => void;
}) {
  return (
    <div className="animate-fade-up">
      <div className="panel flex flex-col items-center p-10 text-center sm:p-12">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-accent text-white">
          <Check className="h-5 w-5" strokeWidth={2.5} />
        </span>
        <h2 className="mt-4 font-serif text-[26px] font-medium tracking-[-0.015em]">That is the deck</h2>
        <p className="mt-1.5 max-w-sm text-[14.5px] leading-relaxed text-ink-soft">
          {saved.length > 0
            ? `You kept ${saved.length} card${saved.length === 1 ? "" : "s"}. They are on your saved shelf.`
            : "Nothing kept this time. The deck is here whenever you want it again."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          <button type="button" onClick={onStartOver} className="btn btn-md btn-quiet">
            <RotateCcw className="h-4 w-4" /> Go again
          </button>
          <Link to={`/group?deck=${deck.slug}`} className="btn btn-md btn-quiet">
            <Users className="h-4 w-4" /> Play it with a group
          </Link>
          <Link to="/" className="btn btn-md btn-primary">Another deck</Link>
        </div>
      </div>

      {saved.length > 0 && (
        <div className="mt-10">
          <h3 className="label-eyebrow mb-4 text-ink-faint">Cards you kept</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {saved.map(card => (
              <PlayCard key={card.id} card={card} deck={deck} size="sm" aspect={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
