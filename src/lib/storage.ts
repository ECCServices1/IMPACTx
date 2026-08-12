import { useCallback, useEffect, useState } from "react";
import type { Deck } from "@/lib/deck";

/**
 * Everything IMPACTx remembers lives on the device. There is no account and no
 * server, so localStorage is the whole of it. Every read and write is guarded:
 * private browsing and full disks both throw, and neither is a reason for the
 * app to stop working.
 */

const KEYS = {
  saved: "impactx.saved.v1",
  seen: "impactx.seen.v1",
  decks: "impactx.decks.v1",
  players: "impactx.players.v1",
} as const;

export function readStore<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function writeStore(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable or full. The session still works, it just will not
    // be remembered next time.
  }
}

/** State backed by localStorage, kept in step with other tabs. */
export function useStored<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => readStore(key, fallback));

  const update = useCallback((next: T | ((prev: T) => T)) => {
    setValue(prev => {
      const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      writeStore(key, resolved);
      return resolved;
    });
  }, [key]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) setValue(readStore(key, fallback));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
    // fallback is only read on a miss; re-subscribing when it changes identity
    // would churn the listener for nothing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [value, update] as const;
}

// ── Saved cards ───────────────────────────────────────────────────────────
export function useSavedCards() {
  const [saved, setSaved] = useStored<string[]>(KEYS.saved, []);

  const isSaved = useCallback((cardId: string) => saved.includes(cardId), [saved]);

  const toggle = useCallback((cardId: string) => {
    let nowSaved = false;
    setSaved(prev => {
      nowSaved = !prev.includes(cardId);
      return nowSaved ? [cardId, ...prev] : prev.filter(id => id !== cardId);
    });
    return nowSaved;
  }, [setSaved]);

  const clear = useCallback(() => setSaved([]), [setSaved]);

  return { saved, isSaved, toggle, clear };
}

// ── Cards already seen, per deck ──────────────────────────────────────────
export type SeenMap = Record<string, string[]>;

export function useSeenCards() {
  const [seen, setSeen] = useStored<SeenMap>(KEYS.seen, {});

  const seenIn = useCallback((deckSlug: string) => seen[deckSlug] ?? [], [seen]);

  const markSeen = useCallback((deckSlug: string, cardId: string) => {
    setSeen(prev => {
      const current = prev[deckSlug] ?? [];
      if (current.includes(cardId)) return prev;
      return { ...prev, [deckSlug]: [...current, cardId] };
    });
  }, [setSeen]);

  const resetDeck = useCallback((deckSlug: string) => {
    setSeen(prev => {
      const next = { ...prev };
      delete next[deckSlug];
      return next;
    });
  }, [setSeen]);

  const resetAll = useCallback(() => setSeen({}), [setSeen]);

  const totalSeen = Object.values(seen).reduce((sum, ids) => sum + ids.length, 0);

  return { seen, seenIn, markSeen, resetDeck, resetAll, totalSeen };
}

// ── Decks built in the studio ─────────────────────────────────────────────
export function useCustomDecks() {
  const [decks, setDecks] = useStored<Deck[]>(KEYS.decks, []);
  return { customDecks: decks, setCustomDecks: setDecks };
}

// ── The last group that played, so a regular group need not retype names ──
export function useRememberedPlayers() {
  return useStored<string[]>(KEYS.players, []);
}

export const STORAGE_KEYS = KEYS;
