import { shuffled, type Deck } from "@/lib/deck";

/**
 * A group session: two or more people, one or more decks, taking turns.
 *
 * All of it is pure. The queue is dealt once when the session starts so the run
 * of cards is fixed for the whole session, which matters when a phone is being
 * passed around a circle and nobody wants the order to shift underneath them.
 */

export type SessionCard = { deckSlug: string; cardId: string };

export type Session = {
  players: string[];
  queue: SessionCard[];
  /** How far through the queue the group is. */
  index: number;
  /** Cards the group marked as worth coming back to. */
  kept: string[];
};

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 12;

/**
 * Clean up typed names: trim, drop blanks, drop duplicates case-insensitively,
 * and cap the list. Returns what is usable, which may be fewer than two; the
 * caller decides whether that is enough to start.
 */
export function normalisePlayers(names: readonly string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of names) {
    const name = raw.trim().replace(/\s+/g, " ").slice(0, 24);
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(name);
    if (out.length >= MAX_PLAYERS) break;
  }
  return out;
}

/**
 * Deal the run of cards.
 *
 * With more than one deck the decks are interleaved after shuffling, so a
 * session that mixes Know Me and Real Talk alternates between them instead of
 * playing one deck out before starting the next.
 */
export function buildQueue(decks: readonly Deck[], deckSlugs: readonly string[], limit?: number): SessionCard[] {
  const chosen = deckSlugs
    .map(slug => decks.find(d => d.slug === slug))
    .filter((d): d is Deck => !!d && d.cards.length > 0);
  if (chosen.length === 0) return [];

  const piles = chosen.map(deck =>
    shuffled(deck.cards).map(card => ({ deckSlug: deck.slug, cardId: card.id })),
  );

  const woven: SessionCard[] = [];
  const longest = Math.max(...piles.map(p => p.length));
  for (let row = 0; row < longest; row++) {
    for (const pile of piles) {
      if (row < pile.length) woven.push(pile[row]);
    }
  }

  if (limit === undefined) return woven;
  return woven.slice(0, Math.max(1, Math.min(limit, woven.length)));
}

export function createSession(
  decks: readonly Deck[],
  players: readonly string[],
  deckSlugs: readonly string[],
  limit?: number,
): Session {
  return { players: normalisePlayers(players), queue: buildQueue(decks, deckSlugs, limit), index: 0, kept: [] };
}

export type Turn = {
  player: string;
  playerIndex: number;
  card: SessionCard | null;
  /** One-based position in the run, for "card 3 of 20". */
  position: number;
  total: number;
  /** Whose turn comes next, for the "up next" line. */
  nextPlayer: string | null;
  finished: boolean;
};

/** Whose turn it is and what they are being asked. */
export function turnFor(session: Session): Turn {
  const total = session.queue.length;
  const finished = total === 0 || session.index >= total;
  const playerCount = session.players.length || 1;
  const playerIndex = finished ? 0 : session.index % playerCount;

  return {
    player: session.players[playerIndex] ?? "",
    playerIndex,
    card: finished ? null : session.queue[session.index],
    position: Math.min(session.index + 1, Math.max(total, 1)),
    total,
    nextPlayer: finished ? null : session.players[(session.index + 1) % playerCount] ?? null,
    finished,
  };
}

export function advance(session: Session): Session {
  if (session.index >= session.queue.length) return session;
  return { ...session, index: session.index + 1 };
}

export function goBack(session: Session): Session {
  if (session.index === 0) return session;
  return { ...session, index: session.index - 1 };
}

/** Mark the current card as one to come back to, or unmark it. */
export function toggleKeep(session: Session, cardId: string): Session {
  const kept = session.kept.includes(cardId)
    ? session.kept.filter(id => id !== cardId)
    : [...session.kept, cardId];
  return { ...session, kept };
}

/**
 * Drop the current card and everything like it is untouched: skipping moves on
 * without consuming the person's turn, so the next card still belongs to them.
 */
export function skip(session: Session): Session {
  if (session.index >= session.queue.length) return session;
  const queue = session.queue.slice();
  const [dropped] = queue.splice(session.index, 1);
  return {
    ...session,
    queue,
    kept: session.kept.filter(id => id !== dropped.cardId),
  };
}
