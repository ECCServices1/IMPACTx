import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Anchor, Book, Compass, Feather, Gift, Heart, Landmark, Leaf, MessagesSquare,
  Mountain, Music, Puzzle, Rocket, Shuffle, Sparkles, Sun, Users, Zap,
} from "lucide-react";

/** How much a card asks of the room. */
export type Depth = "warm" | "deep" | "wild";

export type Card = {
  /** Stable across releases: it appears in saved cards and in shared links. */
  id: string;
  prompt: string;
  followUp?: string;
  scripture?: string;
  depth: Depth;
};

export type Deck = {
  slug: string;
  title: string;
  subtitle: string;
  blurb: string;
  accent: AccentKey;
  icon: IconKey;
  /** Shown on the deck so a pair knows before they start whether it suits two. */
  bestWith: string;
  cards: Card[];
};

export const DEPTHS: Record<Depth, { label: string; blurb: string }> = {
  warm: { label: "Warm", blurb: "Easy to answer, good anywhere." },
  deep: { label: "Deep", blurb: "Needs trust and a bit of time." },
  wild: { label: "Wild", blurb: "Fast, loud and funny." },
};

// ── Colour ────────────────────────────────────────────────────────────────
// One colour per deck, given three jobs: the deck's own colour, a darker tone
// that stays readable as text, and a wash pale enough to sit under ink. Rich
// rather than neon, because the paper is what makes the app feel bright.
export type AccentKey =
  | "ember" | "plum" | "indigo" | "saffron" | "rose"
  | "crimson" | "teal" | "olive" | "ocean" | "clay";

export type Accent = { key: AccentKey; label: string; base: string; ink: string; wash: string };

export const ACCENTS: Record<AccentKey, Accent> = {
  ember:   { key: "ember",   label: "Ember",   base: "#D2542F", ink: "#7A2A11", wash: "#FCF0EA" },
  plum:    { key: "plum",    label: "Plum",    base: "#6D4AA8", ink: "#3F2769", wash: "#F3F0FB" },
  indigo:  { key: "indigo",  label: "Indigo",  base: "#3A55B4", ink: "#21336D", wash: "#EDF1FC" },
  saffron: { key: "saffron", label: "Saffron", base: "#CE9012", ink: "#6F4C06", wash: "#FCF4E4" },
  rose:    { key: "rose",    label: "Rose",    base: "#C24F79", ink: "#752C48", wash: "#FCEEF3" },
  crimson: { key: "crimson", label: "Crimson", base: "#B03448", ink: "#6B1E2B", wash: "#FBECEE" },
  teal:    { key: "teal",    label: "Teal",    base: "#14807A", ink: "#0A4A46", wash: "#E7F5F4" },
  olive:   { key: "olive",   label: "Olive",   base: "#6B8739", ink: "#3C4D20", wash: "#F0F5E7" },
  ocean:   { key: "ocean",   label: "Ocean",   base: "#2A79A6", ink: "#164964", wash: "#EAF3F9" },
  clay:    { key: "clay",    label: "Clay",    base: "#9E6446", ink: "#5B3726", wash: "#F7EFEA" },
};

export const ACCENT_KEYS = Object.keys(ACCENTS) as AccentKey[];

export function accentFor(key: string | undefined | null): Accent {
  return ACCENTS[key as AccentKey] ?? ACCENTS.ember;
}

/** CSS custom properties for a deck, spread onto any element's style. */
export function accentVars(key: string | undefined | null): CSSProperties {
  const a = accentFor(key);
  return { "--accent": a.base, "--accent-ink": a.ink, "--accent-wash": a.wash } as CSSProperties;
}

// ── Motifs ────────────────────────────────────────────────────────────────
export type IconKey =
  | "compass" | "message" | "feather" | "shuffle" | "heart" | "zap" | "users"
  | "book" | "rocket" | "gift" | "sparkles" | "sun" | "leaf" | "mountain"
  | "music" | "puzzle" | "anchor" | "landmark";

export const ICONS: Record<IconKey, LucideIcon> = {
  compass: Compass, message: MessagesSquare, feather: Feather, shuffle: Shuffle,
  heart: Heart, zap: Zap, users: Users, book: Book, rocket: Rocket, gift: Gift,
  sparkles: Sparkles, sun: Sun, leaf: Leaf, mountain: Mountain, music: Music,
  puzzle: Puzzle, anchor: Anchor, landmark: Landmark,
};

export const ICON_KEYS = Object.keys(ICONS) as IconKey[];

export function iconFor(key: string | undefined | null): LucideIcon {
  return ICONS[key as IconKey] ?? Sparkles;
}

// ── Helpers ───────────────────────────────────────────────────────────────
/** Fisher-Yates, so a shuffle does not favour the cards it started with. */
export function shuffled<T>(items: readonly T[]): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function findCard(decks: readonly Deck[], cardId: string): { deck: Deck; card: Card } | null {
  for (const deck of decks) {
    const card = deck.cards.find(c => c.id === cardId);
    if (card) return { deck, card };
  }
  return null;
}

/** Deck title to url slug. Used when someone builds a deck in the studio. */
export function slugify(title: string): string {
  return title.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}
