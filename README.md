# IMPACTx

Conversation card decks for groups of two and up.

Pick a deck, deal a card, talk. Around a table, on a couch, in a classroom, at the front
of a room, or on a call. There is no account, nothing to install, and nothing is sent
anywhere: the whole app is a static site and what you save stays in your browser.

Published from this repository to GitHub Pages at `https://<owner>.github.io/impactx/`.

---

## What is in it

Ten decks, eighty cards.

| Deck | For |
| --- | --- |
| **Know Me** | Easy openers. A first night, or a new face in the room. |
| **Real Talk** | Honest questions for people who already trust each other. |
| **Big Feels** | Naming what is actually going on. |
| **Would You Rather** | Fast, loud and ridiculous. Warms a cold room. |
| **Squad Goals** | Friendship, loyalty, falling out and making up. |
| **Hot Seat** | One person in the chair, rapid fire. |
| **Dream Big** | Purpose, direction, and the fear underneath. |
| **Gratitude Drop** | Appreciation, out loud, to someone in the room. |
| **Work & Money** | First jobs, money habits, ambition and burnout. |
| **Word Up** | A verse and a question, for groups who want a text to work from. |

Every card is marked **Warm**, **Deep** or **Wild**, so you know what you are asking of the
room before you read it out.

## Three ways to use it

**On your own.** Open a deck and read through it. Swipe right to keep a card, left to move
on. Kept cards land on your saved shelf.

**With a group.** Add everyone's names and IMPACTx deals the cards around the circle in
turn, so nobody is skipped and nobody has to run it. Anyone can pass on a question without
losing their turn.

**On a screen at the front.** In a group session, press the expand control for a card sized
to be read from the back of a room.

Any card can be shared: the link opens on that exact card.

## Running a session well

Four things that matter more than the deck you pick.

- Anyone can pass on a question. Say that out loud before you start, and mean it.
- Whoever goes first sets the depth. Go first yourself if you want honesty.
- Leave the silence alone. The good answer usually arrives just after it.
- What is said here stays here, unless someone is unsafe. Then it goes to someone who can
  help.

**Big Feels** in particular asks people how they are actually going. That is the point of
it, and it means someone in the room should be ready to stay with whoever opens up.

## Writing your own decks

**Studio** builds a deck in the browser: title, colour, symbol, and the cards. Write them
one at a time, or paste a whole list with one question per line. A vertical bar splits off
an optional follow-up and reference:

```
Who do you go to when it falls apart? | What makes them the one? | Proverbs 17:17
```

Your decks live in your browser until you export them. **Export** writes a JSON file you
can keep, send to whoever else is running a group, or open a pull request with to add it to
the app for everyone. **Import** reads one back.

Giving your deck the same web address as one that ships replaces that deck, just for you.
That is the way to take one of ours and rewrite it for your group without forking anything.

## Privacy

There is no account, no analytics, no cookies and no server. Saved cards, decks you write
and the names you type into a group session are held in your browser's local storage and
never leave your device. Clearing your browser data clears them.

## Development

```bash
npm install
npm run dev      # http://localhost:5173/impactx/
npm test         # unit tests
npm run lint
npm run build    # static site into dist/
```

- **`src/data/decks.ts`** is the content. Card ids are built from the deck slug and the
  card's position, and they must stay stable: they are what a saved card and a shared link
  point at. Adding cards to the end of a deck is safe; reordering or deleting one breaks
  every link to it, so retire a card in place rather than removing it. A test enforces that
  ids stay unique across every deck.
- **`src/lib/`** holds the pure logic: decks and colour, group sessions, deck files, share
  links, local storage. It is all covered by tests.
- **`src/components/PlayCard.tsx`** is the card itself, and the point of the whole design.
- Fonts are self-hosted in `src/fonts/`. Regenerate with `scripts/fetch-fonts.sh` only if
  the typefaces change; the app never talks to a font CDN at runtime.

### Deployment

Every push to `main` runs lint, tests and a build, then publishes to GitHub Pages.

The build takes its base path from the repository name, so this works unchanged under any
owner, personal or organisation, and a fork deploys to its own path with no edit. For a
custom domain, build with `BASE_PATH=/`.

The workflow asks GitHub to turn Pages on itself. If your organisation does not allow that,
enable it once by hand at **Settings → Pages → Source → GitHub Actions**, then re-run the
job. Organisations can also restrict Pages sites to members only, under **Settings → Pages
→ Visibility**; leave that public if the point is that anyone can open a deck.

## Credits

Built for IMPACT, the youth fellowship at
[The Transformation Edge](https://www.thetransedge.com), and published by Edge Community Care
Services Ltd for anyone to use.
