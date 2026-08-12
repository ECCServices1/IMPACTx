import { describe, it, expect } from "vitest";
import { ACCENTS, accentFor, accentVars, findCard, iconFor, shuffled, slugify } from "./deck";
import { DECKS, DECKS_BY_SLUG, TOTAL_CARDS } from "@/data/decks";
import { parseBulk } from "./deckFile";
import { cardShareText } from "./share";
import { parseDeckFile, serialiseDecks } from "./deckFile";

describe("accents and icons", () => {
  it("falls back to a known accent rather than rendering nothing", () => {
    expect(accentFor("nope")).toBe(ACCENTS.ember);
    expect(accentFor(undefined)).toBe(ACCENTS.ember);
    expect(accentFor("teal")).toBe(ACCENTS.teal);
  });

  it("exposes the accent as custom properties", () => {
    expect(accentVars("teal")).toMatchObject({ "--accent": ACCENTS.teal.base });
  });

  it("falls back to a known icon", () => {
    expect(iconFor("nope")).toBe(iconFor("sparkles"));
    expect(iconFor("heart")).not.toBe(iconFor("sparkles"));
  });
});

describe("shuffled", () => {
  it("keeps every item once and leaves the input alone", () => {
    const source = Array.from({ length: 50 }, (_, i) => i);
    const out = shuffled(source);
    expect([...out].sort((a, b) => a - b)).toEqual(source);
    expect(source[0]).toBe(0);
  });
});

describe("slugify", () => {
  it("makes a url-safe name", () => {
    expect(slugify("Faith & Doubt")).toBe("faith-doubt");
    expect(slugify("  Would You Rather?  ")).toBe("would-you-rather");
    expect(slugify("---")).toBe("");
    expect(slugify("a".repeat(200))).toHaveLength(60);
  });
});

describe("the decks that ship", () => {
  it("gives every card an id that is unique across all decks", () => {
    // Saved cards and shared links are looked up across every deck at once, so
    // a repeated id anywhere would silently point at the wrong card.
    const ids = DECKS.flatMap(d => d.cards.map(c => c.id));
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toHaveLength(TOTAL_CARDS);
  });

  it("gives every deck a unique slug and some cards", () => {
    expect(new Set(DECKS.map(d => d.slug)).size).toBe(DECKS.length);
    for (const deck of DECKS) {
      expect(deck.cards.length, `${deck.slug} has no cards`).toBeGreaterThan(0);
      expect(deck.title).not.toBe("");
      expect(deck.blurb).not.toBe("");
    }
  });

  it("uses only accents and icons that exist", () => {
    for (const deck of DECKS) {
      expect(accentFor(deck.accent).key, `${deck.slug} accent`).toBe(deck.accent);
      expect(iconFor(deck.icon), `${deck.slug} icon`).not.toBe(iconFor("__missing__"));
    }
  });

  it("writes prompts as questions a person can answer out loud", () => {
    for (const deck of DECKS) {
      for (const card of deck.cards) {
        expect(card.prompt.length, `${card.id} too short`).toBeGreaterThan(12);
        expect(card.prompt.length, `${card.id} too long to read off a screen`).toBeLessThan(220);
      }
    }
  });

  it("indexes by slug", () => {
    expect(DECKS_BY_SLUG["know-me"].title).toBe("Know Me");
  });
});

describe("findCard", () => {
  it("finds a card and the deck it came from", () => {
    const found = findCard(DECKS, "know-me-1");
    expect(found?.deck.slug).toBe("know-me");
    expect(found?.card.id).toBe("know-me-1");
  });

  it("returns null for an id that is not there", () => {
    expect(findCard(DECKS, "nope")).toBeNull();
  });
});

describe("cardShareText", () => {
  it("includes the parts a card has and nothing it does not", () => {
    const withAll = cardShareText({ prompt: "P", followUp: "F", scripture: "S" }, "Deck");
    expect(withAll.split("\n\n")).toEqual(["P", "F", "S", "Deck · IMPACTx"]);
    expect(cardShareText({ prompt: "P" }, "Deck").split("\n\n")).toHaveLength(2);
  });
});

describe("parseBulk", () => {
  it("takes one question per line", () => {
    expect(parseBulk("One?\n\nTwo?\n").map(c => c.prompt)).toEqual(["One?", "Two?"]);
  });

  it("splits a follow-up and a reference off the bar", () => {
    const [card] = parseBulk("Who do you go to? | What makes them the one? | Proverbs 17:17");
    expect(card).toEqual({ prompt: "Who do you go to?", followUp: "What makes them the one?", scripture: "Proverbs 17:17" });
  });

  it("strips list markers that came with the paste", () => {
    expect(parseBulk("- A?\n2. B?\n* C?").map(c => c.prompt)).toEqual(["A?", "B?", "C?"]);
  });

  it("drops lines with no question left in them", () => {
    expect(parseBulk("  \n-\n| just a follow-up")).toHaveLength(0);
  });
});

describe("deck files", () => {
  it("round-trips what the studio exports", () => {
    const result = parseDeckFile(serialiseDecks([DECKS[0]]));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.decks[0].slug).toBe(DECKS[0].slug);
    expect(result.decks[0].cards).toHaveLength(DECKS[0].cards.length);
  });

  it("accepts a bare array, since people hand-write these", () => {
    const result = parseDeckFile(JSON.stringify([{ title: "Mine", cards: [{ prompt: "A question?" }] }]));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.decks[0].slug).toBe("mine");
  });

  it("reports unreadable input rather than throwing", () => {
    expect(parseDeckFile("not json")).toEqual({ ok: false, error: "That file is not readable JSON." });
    expect(parseDeckFile("{}").ok).toBe(false);
    expect(parseDeckFile("[]").ok).toBe(false);
  });

  it("drops cards with no question and decks with no title", () => {
    const result = parseDeckFile(JSON.stringify([
      { title: "", cards: [{ prompt: "Dropped" }] },
      { title: "Kept", cards: [{ prompt: "Real question?" }, { prompt: "   " }, 42, null] },
    ]));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.decks).toHaveLength(1);
    expect(result.decks[0].cards).toHaveLength(1);
  });

  it("replaces an unknown accent, icon or depth with a known one", () => {
    const result = parseDeckFile(JSON.stringify([{
      title: "Odd", accent: "chartreuse", icon: "banana",
      cards: [{ prompt: "A question?", depth: "spicy" }],
    }]));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(accentFor(result.decks[0].accent).key).toBe(result.decks[0].accent);
    expect(result.decks[0].cards[0].depth).toBe("warm");
  });

  it("makes repeated card ids unique so saved cards stay unambiguous", () => {
    const result = parseDeckFile(JSON.stringify([{
      title: "Twins",
      cards: [{ id: "same", prompt: "First question?" }, { id: "same", prompt: "Second question?" }],
    }]));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const ids = result.decks[0].cards.map(c => c.id);
    expect(new Set(ids).size).toBe(2);
  });

  it("keeps a hostile file from smuggling in unbounded text", () => {
    const result = parseDeckFile(JSON.stringify([{
      title: "x".repeat(500),
      cards: [{ prompt: "y".repeat(5000) }],
    }]));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.decks[0].title.length).toBeLessThanOrEqual(60);
    expect(result.decks[0].cards[0].prompt.length).toBeLessThanOrEqual(400);
  });
});
