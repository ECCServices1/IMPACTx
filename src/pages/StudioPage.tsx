import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Copy, Download, FileUp, Pencil, Plus, Trash2 } from "lucide-react";
import { DeckEditor } from "@/components/DeckEditor";
import { Toast } from "@/components/Toast";
import { useToast } from "@/lib/useToast";
import { accentFor, iconFor, slugify, type Deck } from "@/lib/deck";
import { DECKS } from "@/data/decks";
import { useCustomDecks } from "@/lib/storage";
import { parseDeckFile, serialiseDecks } from "@/lib/deckFile";

/**
 * Build your own decks.
 *
 * Nothing is uploaded: a deck made here lives on this device. Export writes a
 * file you can keep, send to whoever else is running a group, or open a pull
 * request with to make it part of the app for everyone.
 */
export default function StudioPage() {
  const { customDecks, setCustomDecks } = useCustomDecks();
  const { toast, show } = useToast();
  const [editing, setEditing] = useState<Deck | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const blank = (): Deck => ({
    slug: "", title: "", subtitle: "", blurb: "", bestWith: "Two and up",
    accent: "teal", icon: "sparkles", cards: [],
  });

  const copyOf = (deck: Deck): Deck => {
    const title = `${deck.title} (my version)`;
    return { ...deck, title, slug: slugify(title), cards: deck.cards.map(c => ({ ...c })) };
  };

  const save = (deck: Deck) => {
    const slug = deck.slug || slugify(deck.title);
    const withSlug = { ...deck, slug };
    setCustomDecks(prev => {
      const at = prev.findIndex(d => d.slug === editing?.slug || d.slug === slug);
      if (at === -1) return [...prev, withSlug];
      const next = prev.slice();
      next[at] = withSlug;
      return next;
    });
    setEditing(null);
    show("Deck saved to this device.");
  };

  const remove = (deck: Deck) => {
    if (!window.confirm(`Delete "${deck.title}"? This cannot be undone.`)) return;
    setCustomDecks(prev => prev.filter(d => d.slug !== deck.slug));
    show("Deck deleted.");
  };

  const exportAll = () => {
    if (customDecks.length === 0) return;
    const blob = new Blob([serialiseDecks(customDecks)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "impactx-decks.json";
    a.click();
    URL.revokeObjectURL(url);
    show("Exported.");
  };

  const importFile = async (file: File) => {
    const result = parseDeckFile(await file.text());
    if (!result.ok) return show(result.error);
    setCustomDecks(prev => {
      const bySlug = new Map(prev.map(d => [d.slug, d]));
      for (const deck of result.decks) bySlug.set(deck.slug, deck);
      return [...bySlug.values()];
    });
    show(`Imported ${result.decks.length} deck${result.decks.length === 1 ? "" : "s"}.`);
  };

  if (editing) {
    return <DeckEditor initial={editing} onCancel={() => setEditing(null)} onSave={save} />;
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
      <Toast message={toast} />

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-[34px] font-medium leading-tight tracking-[-0.025em]">Studio</h1>
          <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-ink-soft text-pretty">
            Write your own deck for your group, your classroom or your team. It stays on this
            device until you export it.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) importFile(file);
              e.target.value = "";
            }}
          />
          <button type="button" onClick={() => fileRef.current?.click()} className="btn btn-sm btn-quiet">
            <FileUp className="h-4 w-4" /> Import
          </button>
          <button type="button" onClick={exportAll} disabled={customDecks.length === 0} className="btn btn-sm btn-quiet">
            <Download className="h-4 w-4" /> Export
          </button>
          <button type="button" onClick={() => setEditing(blank())} className="btn btn-sm btn-primary">
            <Plus className="h-4 w-4" /> New deck
          </button>
        </div>
      </header>

      <section className="mt-9">
        <h2 className="label-eyebrow text-ink-faint">Your decks</h2>
        {customDecks.length === 0 ? (
          <div className="panel mt-4 p-10 text-center">
            <h3 className="font-serif text-[22px] font-medium">Nothing here yet</h3>
            <p className="mx-auto mt-1.5 max-w-md text-[14.5px] leading-relaxed text-ink-soft">
              Start from scratch, or take a copy of a deck below and make it yours.
            </p>
            <button type="button" onClick={() => setEditing(blank())} className="btn btn-md btn-primary mt-6">
              <Plus className="h-4 w-4" /> Write a deck
            </button>
          </div>
        ) : (
          <ul className="mt-4 space-y-2.5">
            {customDecks.map(deck => (
              <DeckRow
                key={deck.slug}
                deck={deck}
                actions={
                  <>
                    <Link to={`/deck/${deck.slug}`} className="btn btn-sm btn-ghost">Open</Link>
                    <button type="button" onClick={() => setEditing(deck)} className="btn btn-sm btn-ghost">
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button type="button" onClick={() => remove(deck)} className="btn btn-sm btn-ghost" aria-label={`Delete ${deck.title}`}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                }
              />
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="label-eyebrow text-ink-faint">Start from one of ours</h2>
        <p className="mt-1.5 text-[14px] text-ink-soft">
          Taking a copy leaves the original alone. Give the copy the same web address as a
          shipped deck and it replaces it, just for you.
        </p>
        <ul className="mt-4 space-y-2.5">
          {DECKS.map(deck => (
            <DeckRow
              key={deck.slug}
              deck={deck}
              actions={
                <button type="button" onClick={() => setEditing(copyOf(deck))} className="btn btn-sm btn-ghost">
                  <Copy className="h-3.5 w-3.5" /> Take a copy
                </button>
              }
            />
          ))}
        </ul>
      </section>
    </div>
  );
}

function DeckRow({ deck, actions }: { deck: Deck; actions: React.ReactNode }) {
  const accent = accentFor(deck.accent);
  const Icon = iconFor(deck.icon);
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-line bg-card p-3">
      <span
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white"
        style={{ backgroundImage: `linear-gradient(150deg, ${accent.base}, ${accent.ink})` }}
      >
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14.5px] font-medium">{deck.title || "Untitled deck"}</span>
        <span className="block truncate text-[12.5px] text-ink-faint">
          {deck.cards.length} card{deck.cards.length === 1 ? "" : "s"}
          {deck.subtitle ? ` · ${deck.subtitle}` : ""}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-0.5">{actions}</span>
    </li>
  );
}
