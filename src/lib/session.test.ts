import { describe, it, expect } from "vitest";
import {
  MAX_PLAYERS, advance, buildQueue, createSession, goBack, normalisePlayers, skip, toggleKeep, turnFor,
  type Session,
} from "./session";
import type { Deck } from "./deck";

const deck = (slug: string, count: number): Deck => ({
  slug, title: slug, subtitle: "", blurb: "", bestWith: "", accent: "teal", icon: "sparkles",
  cards: Array.from({ length: count }, (_, i) => ({ id: `${slug}-${i + 1}`, prompt: `Q${i + 1}`, depth: "warm" })),
});

const DECKS = [deck("a", 4), deck("b", 2), deck("empty", 0)];

describe("normalisePlayers", () => {
  it("trims, drops blanks and collapses inner spaces", () => {
    expect(normalisePlayers([" Sam ", "", "  ", "Ada  Lovelace"])).toEqual(["Sam", "Ada Lovelace"]);
  });

  it("drops duplicates regardless of case, keeping the first spelling", () => {
    expect(normalisePlayers(["Sam", "sam", "SAM", "Mei"])).toEqual(["Sam", "Mei"]);
  });

  it("caps the list", () => {
    const many = Array.from({ length: 30 }, (_, i) => `P${i}`);
    expect(normalisePlayers(many)).toHaveLength(MAX_PLAYERS);
  });

  it("truncates a very long name rather than rejecting it", () => {
    expect(normalisePlayers(["x".repeat(80)])[0]).toHaveLength(24);
  });
});

describe("buildQueue", () => {
  it("deals every card of a single deck", () => {
    const queue = buildQueue(DECKS, ["a"]);
    expect(queue).toHaveLength(4);
    expect(new Set(queue.map(c => c.cardId)).size).toBe(4);
  });

  it("interleaves decks instead of playing one out before the next", () => {
    const queue = buildQueue(DECKS, ["a", "b"]);
    expect(queue).toHaveLength(6);
    // b has two cards, so the first four alternate a, b, a, b.
    expect(queue.slice(0, 4).map(c => c.deckSlug)).toEqual(["a", "b", "a", "b"]);
    // Then a's remainder finishes out.
    expect(queue.slice(4).map(c => c.deckSlug)).toEqual(["a", "a"]);
  });

  it("ignores decks that do not exist or have no cards", () => {
    expect(buildQueue(DECKS, ["a", "nope", "empty"]).every(c => c.deckSlug === "a")).toBe(true);
    expect(buildQueue(DECKS, ["nope"])).toEqual([]);
  });

  it("honours a limit without ever dealing an empty run", () => {
    expect(buildQueue(DECKS, ["a"], 3)).toHaveLength(3);
    expect(buildQueue(DECKS, ["a"], 99)).toHaveLength(4);
    expect(buildQueue(DECKS, ["a"], 0)).toHaveLength(1);
  });
});

describe("turnFor", () => {
  const session = (over: Partial<Session> = {}): Session => ({
    players: ["Sam", "Mei", "Ada"],
    queue: [
      { deckSlug: "a", cardId: "a-1" },
      { deckSlug: "a", cardId: "a-2" },
      { deckSlug: "a", cardId: "a-3" },
      { deckSlug: "a", cardId: "a-4" },
    ],
    index: 0,
    kept: [],
    ...over,
  });

  it("goes around the circle in order", () => {
    expect(turnFor(session({ index: 0 })).player).toBe("Sam");
    expect(turnFor(session({ index: 1 })).player).toBe("Mei");
    expect(turnFor(session({ index: 2 })).player).toBe("Ada");
    expect(turnFor(session({ index: 3 })).player).toBe("Sam");
  });

  it("names who is up next", () => {
    expect(turnFor(session({ index: 0 })).nextPlayer).toBe("Mei");
    expect(turnFor(session({ index: 2 })).nextPlayer).toBe("Sam");
  });

  it("reports position out of the total", () => {
    const turn = turnFor(session({ index: 1 }));
    expect(turn.position).toBe(2);
    expect(turn.total).toBe(4);
  });

  it("finishes once the run is used up", () => {
    const turn = turnFor(session({ index: 4 }));
    expect(turn.finished).toBe(true);
    expect(turn.card).toBeNull();
  });

  it("finishes immediately on an empty run rather than dividing by zero", () => {
    const turn = turnFor(session({ queue: [], index: 0 }));
    expect(turn.finished).toBe(true);
    expect(turn.total).toBe(0);
  });

  it("survives a session with no players", () => {
    expect(() => turnFor(session({ players: [] }))).not.toThrow();
  });
});

describe("moving through a session", () => {
  const base = createSession(DECKS, ["Sam", "Mei"], ["a"]);

  it("advances and goes back without running off either end", () => {
    expect(advance(base).index).toBe(1);
    expect(goBack(base).index).toBe(0);
    const atEnd = { ...base, index: base.queue.length };
    expect(advance(atEnd).index).toBe(base.queue.length);
  });

  it("keeps and un-keeps a card", () => {
    const kept = toggleKeep(base, "a-1");
    expect(kept.kept).toEqual(["a-1"]);
    expect(toggleKeep(kept, "a-1").kept).toEqual([]);
  });

  it("never mutates the session it was given", () => {
    const before = JSON.stringify(base);
    advance(base); goBack(base); toggleKeep(base, "a-1"); skip(base);
    expect(JSON.stringify(base)).toBe(before);
  });
});

describe("skip", () => {
  it("drops the card without spending the turn, so the next card is the same person's", () => {
    const session = createSession(DECKS, ["Sam", "Mei"], ["a"]);
    const firstPlayer = turnFor(session).player;
    const dropped = turnFor(session).card!.cardId;

    const after = skip(session);
    expect(after.index).toBe(session.index);
    expect(after.queue).toHaveLength(session.queue.length - 1);
    expect(after.queue.some(c => c.cardId === dropped)).toBe(false);
    expect(turnFor(after).player).toBe(firstPlayer);
  });

  it("forgets a skipped card that had been kept", () => {
    const session = createSession(DECKS, ["Sam", "Mei"], ["a"]);
    const cardId = turnFor(session).card!.cardId;
    const after = skip(toggleKeep(session, cardId));
    expect(after.kept).not.toContain(cardId);
  });

  it("does nothing once the run is finished", () => {
    const session = createSession(DECKS, ["Sam", "Mei"], ["a"]);
    const atEnd = { ...session, index: session.queue.length };
    expect(skip(atEnd)).toEqual(atEnd);
  });
});
