import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Play, Plus, X } from "lucide-react";
import { clsx } from "clsx";
import { accentFor, iconFor } from "@/lib/deck";
import { useAllDecks } from "@/lib/useDecks";
import { useRememberedPlayers } from "@/lib/storage";
import { MIN_PLAYERS, MAX_PLAYERS, normalisePlayers } from "@/lib/session";

const LENGTHS = [
  { cards: 10, label: "Short", blurb: "About 15 minutes" },
  { cards: 20, label: "Standard", blurb: "About half an hour" },
  { cards: 0, label: "Everything", blurb: "Every card in the decks you picked" },
];

/**
 * Setting up a session for a group in a room. Names, decks, and how long you
 * have. Nothing is sent anywhere; the session lives in this tab.
 */
export default function GroupSetupPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const decks = useAllDecks();
  const [remembered, setRemembered] = useRememberedPlayers();

  const [names, setNames] = useState<string[]>(() =>
    remembered.length >= MIN_PLAYERS ? remembered : ["", ""],
  );
  const [picked, setPicked] = useState<string[]>(() => {
    const fromLink = params.get("deck");
    return fromLink ? [fromLink] : [];
  });
  const [length, setLength] = useState(20);

  // If the app is opened straight on this page, start with a sensible deck.
  useEffect(() => {
    if (picked.length === 0 && decks.length > 0 && !params.get("deck")) {
      setPicked([decks[0].slug]);
    }
  }, [decks, picked.length, params]);

  const players = useMemo(() => normalisePlayers(names), [names]);
  const ready = players.length >= MIN_PLAYERS && picked.length > 0;
  const availableCards = useMemo(
    () => decks.filter(d => picked.includes(d.slug)).reduce((n, d) => n + d.cards.length, 0),
    [decks, picked],
  );

  const setName = (i: number, value: string) =>
    setNames(prev => prev.map((n, j) => (j === i ? value : n)));

  const addName = () => setNames(prev => (prev.length >= MAX_PLAYERS ? prev : [...prev, ""]));

  const removeName = (i: number) =>
    setNames(prev => (prev.length <= MIN_PLAYERS ? prev : prev.filter((_, j) => j !== i)));

  const toggleDeck = (slug: string) =>
    setPicked(prev => (prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]));

  const start = () => {
    if (!ready) return;
    setRemembered(players);
    const search = new URLSearchParams({
      players: players.join("~"),
      decks: picked.join("~"),
      ...(length > 0 ? { length: String(length) } : {}),
    });
    navigate(`/group/play?${search.toString()}`);
  };

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-12">
      <Link to="/" className="inline-flex items-center gap-1.5 text-[13px] text-ink-soft transition-colors hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Decks
      </Link>

      <h1 className="mt-3 font-serif text-[34px] font-medium leading-tight tracking-[-0.025em]">
        Set up the circle
      </h1>
      <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-ink-soft text-pretty">
        Add everyone who is playing and IMPACTx deals the cards around the group in turn.
        Two people is enough.
      </p>

      {/* Players */}
      <section className="mt-9">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-serif text-xl font-medium">Who is here</h2>
          <span className="text-[13px] text-ink-faint">{players.length} of {MAX_PLAYERS}</span>
        </div>

        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {names.map((name, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-5 shrink-0 text-[13px] tabular-nums text-ink-faint">{i + 1}</span>
              <input
                value={name}
                onChange={e => setName(i, e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && i === names.length - 1) addName(); }}
                placeholder={i === 0 ? "First name" : "Add a name"}
                maxLength={24}
                aria-label={`Player ${i + 1}`}
                className="h-11 w-full rounded-xl border border-line bg-card px-3.5 text-[15px] outline-none transition-colors placeholder:text-ink-faint focus:border-ink/30"
              />
              <button
                type="button"
                onClick={() => removeName(i)}
                disabled={names.length <= MIN_PLAYERS}
                aria-label={`Remove player ${i + 1}`}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-faint transition-colors hover:bg-ink/[0.05] hover:text-ink disabled:pointer-events-none disabled:opacity-25"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {names.length < MAX_PLAYERS && (
          <button type="button" onClick={addName} className="btn btn-sm btn-ghost mt-3">
            <Plus className="h-4 w-4" /> Add someone
          </button>
        )}
      </section>

      {/* Decks */}
      <section className="mt-10">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-serif text-xl font-medium">Which decks</h2>
          <span className="text-[13px] text-ink-faint">
            {picked.length === 0 ? "Pick at least one" : `${availableCards} cards available`}
          </span>
        </div>

        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {decks.map(deck => {
            const on = picked.includes(deck.slug);
            const accent = accentFor(deck.accent);
            const Icon = iconFor(deck.icon);
            return (
              <button
                key={deck.slug}
                type="button"
                onClick={() => toggleDeck(deck.slug)}
                aria-pressed={on}
                className={clsx(
                  "flex items-center gap-3 rounded-2xl border p-3 text-left transition-all duration-200",
                  on ? "border-ink/25 bg-card shadow-card" : "border-line bg-card/50 hover:border-ink/15",
                )}
              >
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white"
                  style={{ backgroundImage: `linear-gradient(150deg, ${accent.base}, ${accent.ink})` }}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14.5px] font-medium">{deck.title}</span>
                  <span className="block truncate text-[12.5px] text-ink-faint">{deck.bestWith}</span>
                </span>
                <span
                  className={clsx(
                    "grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors",
                    on ? "border-transparent bg-ink text-paper" : "border-line",
                  )}
                  aria-hidden
                >
                  {on && <Play className="h-2.5 w-2.5 fill-current" />}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Length */}
      <section className="mt-10">
        <h2 className="font-serif text-xl font-medium">How long have you got</h2>
        <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
          {LENGTHS.map(option => {
            const on = length === option.cards;
            return (
              <button
                key={option.label}
                type="button"
                onClick={() => setLength(option.cards)}
                aria-pressed={on}
                className={clsx(
                  "rounded-2xl border p-4 text-left transition-all duration-200",
                  on ? "border-ink/25 bg-card shadow-card" : "border-line bg-card/50 hover:border-ink/15",
                )}
              >
                <span className="block text-[14.5px] font-medium">{option.label}</span>
                <span className="mt-0.5 block text-[12.5px] text-ink-faint">{option.blurb}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* What actually makes one of these work. Short, because nobody reads a
          manual with a room waiting on them. */}
      <section className="panel mt-10 p-6">
        <h2 className="font-serif text-xl font-medium">A few things that help</h2>
        <ul className="mt-3 space-y-2.5 text-[14.5px] leading-relaxed text-ink-soft">
          <li className="flex gap-2.5">
            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
            Anyone can pass on a question. Say that out loud before you start and mean it.
          </li>
          <li className="flex gap-2.5">
            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
            Whoever goes first sets the depth, so go first yourself if you want honesty.
          </li>
          <li className="flex gap-2.5">
            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
            Leave the silence alone. The good answer usually arrives after it.
          </li>
          <li className="flex gap-2.5">
            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
            What is said here stays here, unless someone is unsafe. Then it goes to someone
            who can help.
          </li>
        </ul>
      </section>

      {/* Start */}
      <div className="sticky bottom-5 z-30 mt-10">
        <div className="panel flex items-center justify-between gap-4 p-3 pl-5 shadow-lift">
          <p className="text-[13.5px] text-ink-soft">
            {ready
              ? `${players.length} playing · ${picked.length} deck${picked.length === 1 ? "" : "s"}`
              : players.length < MIN_PLAYERS
                ? "Two names to get started"
                : "Pick at least one deck"}
          </p>
          <button type="button" onClick={start} disabled={!ready} className="btn btn-md btn-primary">
            <Play className="h-4 w-4" /> Deal the first card
          </button>
        </div>
      </div>
    </div>
  );
}
