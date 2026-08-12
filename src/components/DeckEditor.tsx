import { useState } from "react";
import { ArrowLeft, ChevronDown, ChevronUp, ListPlus, Plus, Trash2 } from "lucide-react";
import { clsx } from "clsx";
import { PlayCard } from "@/components/PlayCard";
import {
  ACCENTS, ACCENT_KEYS, ICON_KEYS, accentFor, iconFor, slugify,
  type AccentKey, type Card, type Deck, type Depth, type IconKey,
} from "@/lib/deck";
import { parseBulk } from "@/lib/deckFile";

/** Short, unique enough within a deck, and stable once written. */
function cardId(slug: string): string {
  return `${slug || "card"}-${Math.random().toString(36).slice(2, 8)}`;
}

export function DeckEditor({ initial, onCancel, onSave }: {
  initial: Deck; onCancel: () => void; onSave: (deck: Deck) => void;
}) {
  const [deck, setDeck] = useState<Deck>(initial);
  const [slugTouched, setSlugTouched] = useState(!!initial.slug);
  const [bulk, setBulk] = useState("");
  const [showBulk, setShowBulk] = useState(false);

  const slug = slugTouched ? deck.slug : slugify(deck.title);
  const set = <K extends keyof Deck>(key: K, value: Deck[K]) => setDeck(d => ({ ...d, [key]: value }));

  const setCard = (i: number, patch: Partial<Card>) =>
    setDeck(d => ({ ...d, cards: d.cards.map((c, j) => (j === i ? { ...c, ...patch } : c)) }));

  const addCard = () =>
    setDeck(d => ({ ...d, cards: [...d.cards, { id: cardId(slug), prompt: "", depth: "warm" }] }));

  const removeCard = (i: number) =>
    setDeck(d => ({ ...d, cards: d.cards.filter((_, j) => j !== i) }));

  const moveCard = (i: number, delta: number) =>
    setDeck(d => {
      const next = d.cards.slice();
      const to = i + delta;
      if (to < 0 || to >= next.length) return d;
      [next[i], next[to]] = [next[to], next[i]];
      return { ...d, cards: next };
    });

  const addBulk = () => {
    const rows = parseBulk(bulk);
    if (rows.length === 0) return;
    setDeck(d => ({
      ...d,
      cards: [...d.cards, ...rows.map(r => ({ id: cardId(slug), depth: "warm" as Depth, ...r }))],
    }));
    setBulk("");
    setShowBulk(false);
  };

  const canSave = deck.title.trim().length > 0 && deck.cards.some(c => c.prompt.trim());
  const preview = deck.cards.find(c => c.prompt.trim()) ?? {
    id: "preview", prompt: "Your question goes here", depth: "warm" as Depth,
  };

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
      <button type="button" onClick={onCancel} className="inline-flex items-center gap-1.5 text-[13px] text-ink-soft transition-colors hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Studio
      </button>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-serif text-[30px] font-medium leading-tight tracking-[-0.02em]">
          {initial.slug ? "Edit deck" : "New deck"}
        </h1>
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="btn btn-md btn-ghost">Cancel</button>
          <button
            type="button"
            disabled={!canSave}
            onClick={() => onSave({ ...deck, slug: slug || slugify(deck.title) })}
            className="btn btn-md btn-primary"
          >
            Save deck
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_270px]">
        <div className="order-2 space-y-8 lg:order-1">
          {/* Deck details */}
          <section className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Title">
                <input value={deck.title} onChange={e => set("title", e.target.value)} placeholder="Real Talk" className={inputClass} maxLength={60} />
              </Field>
              <Field label="Subtitle">
                <input value={deck.subtitle} onChange={e => set("subtitle", e.target.value)} placeholder="Say the true thing" className={inputClass} maxLength={80} />
              </Field>
            </div>

            <Field label="Web address">
              <div className="flex items-center gap-1.5">
                <span className="shrink-0 text-[13px] text-ink-faint">/deck/</span>
                <input
                  value={slug}
                  onChange={e => { setSlugTouched(true); set("slug", slugify(e.target.value)); }}
                  placeholder="real-talk"
                  className={inputClass}
                />
              </div>
            </Field>

            <Field label="What this deck is for">
              <textarea value={deck.blurb} onChange={e => set("blurb", e.target.value)} rows={2} className={inputClass} maxLength={400} />
            </Field>

            <Field label="Best with">
              <input value={deck.bestWith} onChange={e => set("bestWith", e.target.value)} placeholder="Two to six" className={inputClass} maxLength={60} />
            </Field>

            <Field label="Colour">
              <div className="flex flex-wrap gap-2">
                {ACCENT_KEYS.map(key => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => set("accent", key as AccentKey)}
                    aria-label={ACCENTS[key].label}
                    aria-pressed={deck.accent === key}
                    title={ACCENTS[key].label}
                    className={clsx(
                      "h-9 w-9 rounded-xl transition-transform",
                      deck.accent === key ? "scale-105 ring-2 ring-ink ring-offset-2 ring-offset-paper" : "hover:scale-105",
                    )}
                    style={{ backgroundImage: `linear-gradient(150deg, ${ACCENTS[key].base}, ${ACCENTS[key].ink})` }}
                  />
                ))}
              </div>
            </Field>

            <Field label="Symbol">
              <div className="flex flex-wrap gap-1.5">
                {ICON_KEYS.map(key => {
                  const Icon = iconFor(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => set("icon", key as IconKey)}
                      aria-label={key}
                      aria-pressed={deck.icon === key}
                      className={clsx(
                        "grid h-9 w-9 place-items-center rounded-xl border transition-colors",
                        deck.icon === key ? "border-transparent bg-ink text-paper" : "border-line text-ink-soft hover:text-ink",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  );
                })}
              </div>
            </Field>
          </section>

          {/* Cards */}
          <section>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-serif text-xl font-medium">
                Cards <span className="text-ink-faint">({deck.cards.length})</span>
              </h2>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowBulk(v => !v)} className="btn btn-sm btn-quiet">
                  <ListPlus className="h-4 w-4" /> Paste many
                </button>
                <button type="button" onClick={addCard} className="btn btn-sm btn-primary">
                  <Plus className="h-4 w-4" /> Add card
                </button>
              </div>
            </div>

            {showBulk && (
              <div className="mt-4 rounded-2xl border border-line bg-card p-4">
                <p className="text-[13px] text-ink-soft">
                  One question per line. To add a follow-up or a reference, separate them with a vertical bar.
                </p>
                <textarea
                  value={bulk}
                  onChange={e => setBulk(e.target.value)}
                  rows={6}
                  placeholder={"What are you most proud of this year?\nWho do you go to when it falls apart? | What makes them the one?"}
                  className={clsx(inputClass, "mt-3 font-mono text-[13px]")}
                />
                <div className="mt-3 flex items-center gap-2">
                  <button type="button" onClick={addBulk} disabled={parseBulk(bulk).length === 0} className="btn btn-sm btn-primary">
                    Add {parseBulk(bulk).length || ""}
                  </button>
                  <button type="button" onClick={() => { setBulk(""); setShowBulk(false); }} className="btn btn-sm btn-ghost">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {deck.cards.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-line p-10 text-center text-[14px] text-ink-soft">
                No cards yet. Add one, or paste a whole list.
              </div>
            ) : (
              <ul className="mt-4 space-y-3">
                {deck.cards.map((card, i) => (
                  <li key={card.id} className="rounded-2xl border border-line bg-card p-4">
                    <div className="flex items-start gap-3">
                      <span className="w-5 pt-2.5 text-[12.5px] tabular-nums text-ink-faint">{i + 1}</span>
                      <div className="min-w-0 flex-1 space-y-2.5">
                        <textarea
                          value={card.prompt}
                          onChange={e => setCard(i, { prompt: e.target.value })}
                          rows={2}
                          placeholder="The question"
                          className={inputClass}
                          maxLength={400}
                        />
                        <div className="grid gap-2.5 sm:grid-cols-3">
                          <input
                            value={card.followUp ?? ""}
                            onChange={e => setCard(i, { followUp: e.target.value || undefined })}
                            placeholder="Follow-up (optional)"
                            className={inputClass}
                            maxLength={300}
                          />
                          <input
                            value={card.scripture ?? ""}
                            onChange={e => setCard(i, { scripture: e.target.value || undefined })}
                            placeholder="Reference (optional)"
                            className={inputClass}
                            maxLength={60}
                          />
                          <select
                            value={card.depth}
                            onChange={e => setCard(i, { depth: e.target.value as Depth })}
                            aria-label={`Depth of card ${i + 1}`}
                            className={inputClass}
                          >
                            <option value="warm">Warm</option>
                            <option value="deep">Deep</option>
                            <option value="wild">Wild</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col gap-0.5">
                        <IconBtn label="Move up" onClick={() => moveCard(i, -1)} disabled={i === 0}>
                          <ChevronUp className="h-3.5 w-3.5" />
                        </IconBtn>
                        <IconBtn label="Move down" onClick={() => moveCard(i, 1)} disabled={i === deck.cards.length - 1}>
                          <ChevronDown className="h-3.5 w-3.5" />
                        </IconBtn>
                        <IconBtn label={`Delete card ${i + 1}`} onClick={() => removeCard(i)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </IconBtn>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Live preview */}
        <aside className="order-1 lg:order-2">
          <p className="label-eyebrow mb-3 text-ink-faint">Preview</p>
          <div className="lg:sticky lg:top-20">
            <PlayCard
              card={preview}
              deck={{ title: deck.title || "Your deck", accent: deck.accent, icon: deck.icon }}
              size="sm"
            />
            <p className="mt-3 text-[12.5px] leading-relaxed text-ink-faint">
              {accentFor(deck.accent).label} · {deck.cards.length} card{deck.cards.length === 1 ? "" : "s"}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-line bg-card px-3.5 py-2.5 text-[14.5px] outline-none transition-colors placeholder:text-ink-faint focus:border-ink/30";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-ink-soft">{label}</span>
      {children}
    </label>
  );
}

function IconBtn({ label, onClick, disabled, children }: {
  label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="grid h-7 w-7 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-ink/[0.05] hover:text-ink disabled:pointer-events-none disabled:opacity-25"
    >
      {children}
    </button>
  );
}
