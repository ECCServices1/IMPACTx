import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { Bookmark, ChevronLeft, Maximize2, Minimize2, Share2, SkipForward, X } from "lucide-react";
import { clsx } from "clsx";
import { PlayCard } from "@/components/PlayCard";
import { Toast } from "@/components/Toast";
import { useToast } from "@/lib/useToast";
import { accentVars, findCard, type Deck } from "@/lib/deck";
import { useAllDecks } from "@/lib/useDecks";
import { useSavedCards, useSeenCards } from "@/lib/storage";
import { shareCard } from "@/lib/share";
import { advance, createSession, goBack, skip, toggleKeep, turnFor, type Session } from "@/lib/session";

/**
 * A group playing together. One screen, passed around or propped up, and the
 * app keeps track of whose turn it is so nobody has to run it.
 *
 * The setup lives in the URL, which means the whole session survives a refresh
 * and can be sent to the person holding the other phone.
 */
export default function GroupPlayPage() {
  const [params] = useSearchParams();
  const decks = useAllDecks();
  const { isSaved, toggle } = useSavedCards();
  const { markSeen } = useSeenCards();
  const { toast, show } = useToast();
  const [stage, setStage] = useState(false);

  const players = useMemo(() => (params.get("players") ?? "").split("~").filter(Boolean), [params]);
  const deckSlugs = useMemo(() => (params.get("decks") ?? "").split("~").filter(Boolean), [params]);
  const limit = Number(params.get("length")) || undefined;

  const [session, setSession] = useState<Session | null>(null);

  // Deal once. The dependency list is the URL's contents, so a refresh deals a
  // fresh run but simply re-rendering never reshuffles under the group.
  useEffect(() => {
    if (players.length < 2 || deckSlugs.length === 0 || decks.length === 0) return;
    setSession(createSession(decks, players, deckSlugs, limit));
  }, [decks, players, deckSlugs, limit]);

  const turn = useMemo(() => (session ? turnFor(session) : null), [session]);
  const found = useMemo(
    () => (turn?.card ? findCard(decks, turn.card.cardId) : null),
    [decks, turn],
  );

  // Everyone should get credit for the cards their group has been through.
  useEffect(() => {
    if (turn?.card) markSeen(turn.card.deckSlug, turn.card.cardId);
  }, [turn?.card, markSeen]);

  const onNext = useCallback(() => setSession(s => (s ? advance(s) : s)), []);
  const onBack = useCallback(() => setSession(s => (s ? goBack(s) : s)), []);
  const onSkip = useCallback(() => setSession(s => (s ? skip(s) : s)), []);

  const onKeep = useCallback(() => {
    if (!found) return;
    const nowSaved = toggle(found.card.id);
    setSession(s => (s ? toggleKeep(s, found.card.id) : s));
    show(nowSaved ? "Kept for later." : "Removed from saved.");
  }, [found, show, toggle]);

  const onShare = useCallback(async () => {
    if (!found) return;
    const result = await shareCard(found.deck, found.card);
    if (result === "copied") show("Card and link copied.");
    else if (result === "failed") show("Could not share that card.");
  }, [found, show]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); onNext(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); onBack(); }
      else if (e.key === "Escape") setStage(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onBack, onNext]);

  if (players.length < 2 || deckSlugs.length === 0) return <Navigate to="/group" replace />;
  if (!session || !turn) {
    return <div className="mx-auto max-w-lg px-5 py-24 text-center text-[14.5px] text-ink-soft">Dealing…</div>;
  }

  if (turn.finished) {
    return <SessionEnd session={session} decks={decks} />;
  }

  const deck = found?.deck;
  const card = found?.card;

  return (
    <div
      className={clsx("mx-auto px-5 py-6 sm:px-8", stage ? "max-w-5xl" : "max-w-2xl")}
      style={deck ? accentVars(deck.accent) : undefined}
    >
      <Toast message={toast} />

      {/* Whose turn. The largest promise this screen makes is that nobody gets
          skipped, so it goes above the card. */}
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="label-eyebrow text-ink-faint">Card {turn.position} of {turn.total}</p>
          <h1 className="mt-1 truncate font-serif text-[26px] font-medium leading-tight tracking-[-0.02em] sm:text-[30px]">
            <span style={{ color: "var(--accent-ink)" }}>{turn.player}</span>, this one is yours
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => setStage(v => !v)}
            aria-label={stage ? "Smaller card" : "Bigger card for the room"}
            title={stage ? "Smaller card" : "Bigger card for the room"}
            className="grid h-9 w-9 place-items-center rounded-full text-ink-faint transition-colors hover:bg-ink/[0.05] hover:text-ink"
          >
            {stage ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <Link
            to="/group"
            aria-label="End the session"
            title="End the session"
            className="grid h-9 w-9 place-items-center rounded-full text-ink-faint transition-colors hover:bg-ink/[0.05] hover:text-ink"
          >
            <X className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Progress through the run. */}
      <div className="mb-6 h-[3px] overflow-hidden rounded-full bg-line" aria-hidden>
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
          style={{ width: `${(turn.position / Math.max(1, turn.total)) * 100}%` }}
        />
      </div>

      {card && deck ? (
        <>
          <PlayCard
            key={card.id}
            card={card}
            deck={deck}
            size={stage ? "lg" : "md"}
            aspect={!stage}
            counter={`${turn.position} / ${turn.total}`}
            className={clsx("animate-deal-in", stage ? "min-h-[58vh]" : "mx-auto max-w-[420px]")}
          />

          {/* On a phone the handover is the thumb-sized thing and the rest is a
              compact row above it. On a wider screen they all sit in one line. */}
          <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-2.5">
            <div className="flex items-center justify-center gap-2 sm:gap-2.5">
              <button
                type="button"
                onClick={onBack}
                disabled={session.index === 0}
                aria-label="Back to the previous card"
                title="Back to the previous card"
                className="btn btn-md btn-quiet aspect-square px-0 sm:aspect-auto sm:px-5"
              >
                <ChevronLeft className="h-4 w-4" /> <span className="hidden sm:inline">Back</span>
              </button>
              <button type="button" onClick={onKeep} className="btn btn-md btn-quiet" aria-pressed={isSaved(card.id)}>
                <Bookmark className={isSaved(card.id) ? "h-4 w-4 fill-current" : "h-4 w-4"} />
                {isSaved(card.id) ? "Kept" : "Keep"}
              </button>
              <button type="button" onClick={onShare} className="btn btn-md btn-quiet">
                <Share2 className="h-4 w-4" /> Share
              </button>
              <button type="button" onClick={onSkip} className="btn btn-md btn-quiet" title="Not this one; stay on the same person">
                <SkipForward className="h-4 w-4" /> Pass
              </button>
            </div>
            <button type="button" onClick={onNext} className="btn btn-md btn-accent w-full sm:w-auto sm:min-w-[150px]">
              {turn.nextPlayer ? `Over to ${turn.nextPlayer}` : "Next"}
            </button>
          </div>

          <p className="mt-4 text-center text-[12.5px] text-ink-faint">
            Pass moves to a different question and keeps the turn. Arrow keys work too.
          </p>
        </>
      ) : (
        <div className="panel p-12 text-center text-[14.5px] text-ink-soft">No card here.</div>
      )}
    </div>
  );
}

function SessionEnd({ session, decks }: { session: Session; decks: Deck[] }) {
  const kept = session.kept.map(id => findCard(decks, id)).filter((x): x is { deck: Deck; card: NonNullable<ReturnType<typeof findCard>>["card"] } => !!x);

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
      <div className="panel p-10 text-center sm:p-12">
        <h1 className="font-serif text-[32px] font-medium tracking-[-0.02em]">That is the session</h1>
        <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-ink-soft text-pretty">
          {session.players.length} people, {session.queue.length} cards.
          {kept.length > 0 ? ` You kept ${kept.length} to come back to.` : " Nothing kept, which is fine too."}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-2.5">
          <Link to="/group" className="btn btn-md btn-quiet">Another round</Link>
          {kept.length > 0 && <Link to="/saved" className="btn btn-md btn-quiet">Your saved shelf</Link>}
          <Link to="/" className="btn btn-md btn-primary">Back to the decks</Link>
        </div>
      </div>

      {kept.length > 0 && (
        <section className="mt-12">
          <h2 className="label-eyebrow mb-4 text-ink-faint">What you kept</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {kept.map(({ deck, card }) => (
              <PlayCard key={card.id} card={card} deck={deck} size="sm" aspect={false} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
