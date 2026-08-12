import { Link } from "react-router-dom";
import { ArrowRight, Users } from "lucide-react";
import { DeckTile } from "@/components/DeckTile";
import { PlayCard } from "@/components/PlayCard";
import { useAllDecks } from "@/lib/useDecks";
import { useSeenCards } from "@/lib/storage";
import { TOTAL_CARDS } from "@/data/decks";

const STEPS = [
  { n: "01", title: "Pick a deck", body: "Ten of them, from easy openers to the questions people avoid." },
  { n: "02", title: "Deal a card", body: "One question at a time. Pass the phone, or put it on a screen." },
  { n: "03", title: "Talk", body: "No timer, no scoring, no right answer. Keep the ones worth returning to." },
];

export default function HomePage() {
  const decks = useAllDecks();
  const { seenIn } = useSeenCards();

  // Three real cards, fanned, as the hero. The product is the picture.
  const showcase = decks.slice(0, 3).map(deck => ({ deck, card: deck.cards[0] })).filter(x => x.card);

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8">
      {/* Hero */}
      <section className="grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
        <div className="animate-fade-up">
          <p className="label-eyebrow text-ink-faint">Conversation cards</p>
          <h1 className="mt-4 font-serif text-[42px] font-medium leading-[1.02] tracking-[-0.025em] text-balance sm:text-[58px]">
            The questions that get people actually talking.
          </h1>
          <p className="mt-5 max-w-md text-[17px] leading-relaxed text-ink-soft text-pretty">
            {TOTAL_CARDS} cards across {decks.length} decks, for any group of two or more.
            Around a table, on a couch, in a classroom, or on a call.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/group" className="btn btn-lg btn-primary">
              <Users className="h-[18px] w-[18px]" /> Start a group
            </Link>
            <a href="#decks" className="btn btn-lg btn-quiet">
              Browse the decks <ArrowRight className="h-[18px] w-[18px]" />
            </a>
          </div>

          <p className="mt-5 text-[13px] text-ink-faint">
            No account. Nothing to install. Free.
          </p>
        </div>

        {/* The fan. Decorative, so it is hidden from assistive tech and from
            small screens where it would only crowd the words. The spread is
            wider than the card so all three read as separate cards rather than
            one card with a shadow. */}
        <div className="relative hidden h-[420px] lg:block" aria-hidden>
          {showcase.map(({ deck, card }, i) => (
            /* Two elements on purpose. The deal-in animation ends on a transform
               of its own, and with fill-mode both it would otherwise overwrite
               the transform that places the card in the fan. */
            <div
              key={deck.slug}
              className="absolute left-1/2 top-1/2 w-[218px]"
              style={{
                transform: `translate(-50%, -50%) translateX(${(i - 1) * 152}px) translateY(${Math.abs(i - 1) * 18}px) rotate(${(i - 1) * 9}deg)`,
                zIndex: i === 1 ? 3 : 2 - Math.abs(i - 1),
              }}
            >
              <div className="animate-deal-in" style={{ animationDelay: `${i * 90}ms` }}>
                <PlayCard card={card} deck={deck} size="sm" className="shadow-lift" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="grid gap-6 border-y border-line py-10 sm:grid-cols-3 sm:py-12">
        {STEPS.map(step => (
          <div key={step.n} className="animate-fade-up">
            <span className="label-eyebrow text-ink-faint">{step.n}</span>
            <h2 className="mt-2 font-serif text-xl font-medium tracking-[-0.01em]">{step.title}</h2>
            <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-soft text-pretty">{step.body}</p>
          </div>
        ))}
      </section>

      {/* The shelf */}
      <section id="decks" className="scroll-mt-20 py-14 sm:py-16">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-[28px] font-medium tracking-[-0.02em]">The decks</h2>
            <p className="mt-1 text-[14.5px] text-ink-soft">Tap one to read through it on your own, or take it to a group.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5">
          {decks.map((deck, i) => (
            <DeckTile
              key={deck.slug}
              deck={deck}
              seenCount={seenIn(deck.slug).length}
              style={{ animationDelay: `${Math.min(i, 10) * 35}ms` }}
            />
          ))}
        </div>
      </section>

      {/* Closing prompt */}
      <section className="panel mb-6 flex flex-col items-start justify-between gap-5 p-7 sm:flex-row sm:items-center sm:p-9">
        <div>
          <h2 className="font-serif text-[24px] font-medium tracking-[-0.015em]">Got a group in the room?</h2>
          <p className="mt-1.5 max-w-lg text-[14.5px] leading-relaxed text-ink-soft text-pretty">
            Add everyone's name and IMPACTx deals the cards around the circle, so nobody
            is left out and nobody has to run it.
          </p>
        </div>
        <Link to="/group" className="btn btn-lg btn-primary shrink-0">
          <Users className="h-[18px] w-[18px]" /> Set it up
        </Link>
      </section>
    </div>
  );
}
