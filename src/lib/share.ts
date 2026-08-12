import type { Card, Deck } from "@/lib/deck";

/**
 * Sharing is how a group without accounts stays together: send someone a link
 * and it opens on the exact card you are looking at.
 */

const base = typeof __BASE_PATH__ === "string" ? __BASE_PATH__ : "/";

function origin(): string {
  return typeof window === "undefined" ? "" : window.location.origin;
}

export function deckUrl(deckSlug: string): string {
  return `${origin()}${base}deck/${deckSlug}`;
}

export function cardUrl(deckSlug: string, cardId: string): string {
  return `${deckUrl(deckSlug)}?card=${encodeURIComponent(cardId)}`;
}

export function cardShareText(card: Pick<Card, "prompt" | "followUp" | "scripture">, deckTitle: string): string {
  const lines = [card.prompt];
  if (card.followUp) lines.push(card.followUp);
  if (card.scripture) lines.push(card.scripture);
  lines.push(`${deckTitle} · IMPACTx`);
  return lines.join("\n\n");
}

export type ShareResult = "shared" | "copied" | "cancelled" | "failed";

/**
 * Use the device's share sheet where there is one, fall back to the clipboard.
 * A cancelled share sheet is reported separately so the caller does not tell
 * someone off for changing their mind.
 */
export async function shareCard(deck: Deck, card: Card): Promise<ShareResult> {
  const url = cardUrl(deck.slug, card.id);
  const text = cardShareText(card, deck.title);

  try {
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({ title: `${deck.title} · IMPACTx`, text, url });
      return "shared";
    }
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") return "cancelled";
    // Fall through and try the clipboard instead.
  }

  try {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    return "copied";
  } catch {
    return "failed";
  }
}

export async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}
