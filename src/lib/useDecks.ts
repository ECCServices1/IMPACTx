import { useMemo } from "react";
import { DECKS } from "@/data/decks";
import { useCustomDecks } from "@/lib/storage";
import type { Deck } from "@/lib/deck";

/**
 * The decks available on this device: the ones that ship with the app, plus
 * anything built in the studio. A studio deck that reuses a shipped slug
 * replaces it, which is how someone edits a shipped deck for their own group
 * without forking the project.
 */
export function useAllDecks(): Deck[] {
  const { customDecks } = useCustomDecks();
  return useMemo(() => {
    const bySlug = new Map<string, Deck>(DECKS.map(d => [d.slug, d]));
    for (const deck of customDecks) bySlug.set(deck.slug, deck);
    return [...bySlug.values()];
  }, [customDecks]);
}

export function useDeck(slug: string | undefined): Deck | null {
  const decks = useAllDecks();
  return useMemo(() => decks.find(d => d.slug === slug) ?? null, [decks, slug]);
}
