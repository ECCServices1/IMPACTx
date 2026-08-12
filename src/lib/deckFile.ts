import { ACCENTS, ICONS, slugify, type AccentKey, type Card, type Deck, type Depth, type IconKey } from "@/lib/deck";

/**
 * Reading and writing deck files.
 *
 * An imported file comes from outside the app, so nothing in it is trusted:
 * every field is checked and coerced, unknown colours and symbols fall back to
 * known ones, and anything without a question is dropped. A malformed file
 * should produce a clear message, never a broken deck.
 */

export const DECK_FILE_VERSION = 1;

export type DeckFile = { version: number; decks: Deck[] };

export function serialiseDecks(decks: readonly Deck[]): string {
  return JSON.stringify({ version: DECK_FILE_VERSION, decks }, null, 2);
}

const DEPTHS = new Set<Depth>(["warm", "deep", "wild"]);

function str(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function coerceCard(raw: unknown, deckSlug: string, position: number): Card | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const prompt = str(r.prompt, 400);
  if (!prompt) return null;

  const depth = DEPTHS.has(r.depth as Depth) ? (r.depth as Depth) : "warm";
  const followUp = str(r.followUp, 300);
  const scripture = str(r.scripture, 60);

  return {
    id: str(r.id, 80) || `${deckSlug}-${position}`,
    prompt,
    ...(followUp ? { followUp } : {}),
    ...(scripture ? { scripture } : {}),
    depth,
  };
}

function coerceDeck(raw: unknown): Deck | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  const title = str(r.title, 60);
  if (!title) return null;
  const slug = slugify(str(r.slug, 60) || title);
  if (!slug) return null;

  const cards: Card[] = [];
  const rawCards = Array.isArray(r.cards) ? r.cards : [];
  const usedIds = new Set<string>();
  rawCards.forEach((rawCard, i) => {
    const card = coerceCard(rawCard, slug, i + 1);
    if (!card) return;
    // Duplicate ids would make saved cards and share links ambiguous.
    let id = card.id;
    let n = 1;
    while (usedIds.has(id)) id = `${card.id}-${++n}`;
    usedIds.add(id);
    cards.push({ ...card, id });
  });

  return {
    slug,
    title,
    subtitle: str(r.subtitle, 80),
    blurb: str(r.blurb, 400),
    bestWith: str(r.bestWith, 60) || "Two and up",
    accent: (str(r.accent, 20) in ACCENTS ? r.accent : "teal") as AccentKey,
    icon: (str(r.icon, 20) in ICONS ? r.icon : "sparkles") as IconKey,
    cards,
  };
}

export type ParseResult =
  | { ok: true; decks: Deck[] }
  | { ok: false; error: string };

export function parseDeckFile(text: string): ParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: "That file is not readable JSON." };
  }

  // Accept either a whole file or a bare array of decks, since people will
  // hand-edit these and a bare array is the obvious thing to write.
  const rawDecks = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === "object" && Array.isArray((parsed as DeckFile).decks)
      ? (parsed as DeckFile).decks
      : null;

  if (!rawDecks) return { ok: false, error: "No decks found in that file." };

  const decks = rawDecks.map(coerceDeck).filter((d): d is Deck => !!d);
  if (decks.length === 0) return { ok: false, error: "No deck in that file had a title and any cards." };

  return { ok: true, decks };
}

/** One question per line. A vertical bar splits off a follow-up and a reference. */
export function parseBulk(text: string): { prompt: string; followUp?: string; scripture?: string }[] {
  return text
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [prompt, followUp, scripture] = line.split("|").map(p => p.trim());
      return {
        prompt: prompt.replace(/^[-*\d.)\s]+/, "").trim(),
        ...(followUp ? { followUp } : {}),
        ...(scripture ? { scripture } : {}),
      };
    })
    .filter(c => c.prompt.length > 0);
}
