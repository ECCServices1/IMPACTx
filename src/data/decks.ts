import type { Card, Deck, Depth } from "@/lib/deck";

/**
 * The decks that ship with IMPACTx.
 *
 * Card ids are built from the deck slug and the card's position and must stay
 * stable: they are what a saved card and a shared link point at. Adding cards to
 * the end of a deck is safe. Reordering or removing one breaks any link to it,
 * so leave a retired card in place rather than deleting it.
 */

type Raw = [prompt: string, followUp?: string, depth?: Depth, scripture?: string];

function build(slug: string, rows: Raw[]): Card[] {
  return rows.map(([prompt, followUp, depth = "warm", scripture], i) => ({
    id: `${slug}-${i + 1}`,
    prompt,
    ...(followUp ? { followUp } : {}),
    ...(scripture ? { scripture } : {}),
    depth,
  }));
}

export const DECKS: Deck[] = [
  {
    slug: "know-me",
    title: "Know Me",
    subtitle: "Easy openers",
    blurb: "Light questions to get a circle talking. Good for a first night, or for a new face in the room.",
    accent: "ember",
    icon: "compass",
    bestWith: "Any size, from two up",
    cards: build("know-me", [
      ["What is something people always get wrong about you?", "What would you rather they saw first?"],
      ["What song could you play right now and know every word?", "Who put you onto it?"],
      ["What is the best thing that happened to you this week? Small counts."],
      ["Where do you feel most yourself?", "What is it about that place?"],
      ["What is something you are surprisingly good at?", "How did you learn it?"],
      ["Which person in your family are you most like, and how do you feel about that?"],
      ["If this week had a title, what would it be called?"],
      ["What is one thing where you are, right now, that means more than it looks like it does?"],
    ]),
  },
  {
    slug: "real-talk",
    title: "Real Talk",
    subtitle: "Say the true thing",
    blurb: "Honest questions for people who already trust each other. Slow down and let the answers breathe.",
    accent: "plum",
    icon: "message",
    bestWith: "Two to six",
    cards: build("real-talk", [
      ["What have you been carrying that nobody here knows about?", "You choose how much to say.", "deep"],
      ["When did you last change your mind about something that mattered?", "What moved you?", "deep"],
      ["What do you pretend not to care about?", undefined, "deep"],
      ["Who in your life tells you the truth, even when it costs you something?", undefined, "deep"],
      ["What is the hardest thing about your life right now?", "What would actually help?", "deep"],
      ["What would you do if you knew you would not be judged for it?", undefined, "deep"],
      ["Where do you feel the pressure to perform?", "Who gets to see you off stage?", "deep"],
      ["What have you forgiven someone for, and what did it cost you?", undefined, "deep"],
    ]),
  },
  {
    slug: "big-feels",
    title: "Big Feels",
    subtitle: "Unburdening",
    blurb: "Naming what is actually going on. Have someone in the room who can stay with whoever opens up.",
    accent: "rose",
    icon: "heart",
    bestWith: "Two to eight, with a facilitator",
    cards: build("big-feels", [
      ["On a scale of one to ten, how are you actually going? No rounding up.", "What would move it up one point this week?", "deep"],
      ["What has been sitting on your chest lately?", undefined, "deep"],
      ["When you are not okay, what do you usually do with it?", "Does that help, or just make it quieter?", "deep"],
      ["Who notices when you go quiet?", undefined, "deep"],
      ["What is something you need but find hard to ask for?", undefined, "deep"],
      ["What makes you feel safe?"],
      ["What is one thing you wish the adults in your life understood?", undefined, "deep"],
      ["When did you last feel proud of yourself?", "Say it out loud without laughing it off."],
    ]),
  },
  {
    slug: "would-you-rather",
    title: "Would You Rather",
    subtitle: "Pure chaos",
    blurb: "Fast, loud and ridiculous. Use it to warm a cold room in ninety seconds.",
    accent: "saffron",
    icon: "shuffle",
    bestWith: "Three and up, the more the better",
    cards: build("would-you-rather", [
      ["Would you rather never use headphones again, or never use a phone camera again?", undefined, "wild"],
      ["Would you rather be famous for something embarrassing, or unknown for something brilliant?", undefined, "wild"],
      ["Would you rather always be twenty minutes early, or always ten minutes late?", undefined, "wild"],
      ["Would you rather lose every photo you have, or every message you have ever sent?", undefined, "wild"],
      ["Would you rather have your search history read out, or your voice notes played, to this room?", undefined, "wild"],
      ["Would you rather be the funniest person in the room, or the one everyone trusts?", "Be honest about which one you picked.", "wild"],
      ["Would you rather live one year overseas alone, or ten years at home surrounded by everyone you love?", undefined, "wild"],
      ["Would you rather always know when someone is lying, or always be believed?", undefined, "wild"],
    ]),
  },
  {
    slug: "squad-goals",
    title: "Squad Goals",
    subtitle: "Us, together",
    blurb: "Friendship, loyalty, falling out and making up. What we owe the people beside us.",
    accent: "teal",
    icon: "users",
    bestWith: "A group that already knows each other",
    cards: build("squad-goals", [
      ["What makes someone a real friend and not just a familiar face?"],
      ["Who here has helped you without knowing it?", "Tell them now."],
      ["What do you do when a friend is clearly in the wrong?", undefined, "deep"],
      ["Have you ever let a friendship go? What happened?", undefined, "deep"],
      ["What does this group do well, and what do we do badly?", "Whoever is leading, sit in this one and take notes.", "deep"],
      ["Who is on the edge of this group, and what would it take to bring them in?", undefined, "deep"],
      ["What is the hardest thing about making friends somewhere new?"],
      ["Which friendship do you need to repair?", "What is the first message you would send?", "deep"],
    ]),
  },
  {
    slug: "hot-seat",
    title: "Hot Seat",
    subtitle: "One person, rapid fire",
    blurb: "One person in the chair, the deck fires questions. Two minutes each, then pass it on.",
    accent: "crimson",
    icon: "zap",
    bestWith: "Three and up",
    cards: build("hot-seat", [
      ["Three words your closest friend would use about you. Then the one word you would add.", undefined, "wild"],
      ["What is the boldest thing you have ever done?", undefined, "wild"],
      ["What is a compliment you have never known how to accept?", undefined, "deep"],
      ["Best decision you made this year. Go.", undefined, "wild"],
      ["What would you fix about yourself if it took one hour?", undefined, "deep"],
      ["Who has your back, no questions asked?"],
      ["What is something you want this room to stop teasing you about?", undefined, "deep"],
      ["What do you want people to remember about you?", undefined, "deep"],
    ]),
  },
  {
    slug: "dream-big",
    title: "Dream Big",
    subtitle: "Where this is going",
    blurb: "Purpose, direction, the next five years, and the fear sitting underneath them.",
    accent: "ocean",
    icon: "rocket",
    bestWith: "Two to six",
    cards: build("dream-big", [
      ["What would you attempt if money and marks were not a problem?"],
      ["What is a skill you want to have by this time next year?", "What is step one, this week?"],
      ["Whose life do you want yours to look like, and why?", undefined, "deep"],
      ["What is the fear sitting under your biggest dream?", undefined, "deep"],
      ["What problem in the world makes you angry enough to work on it?", undefined, "deep"],
      ["What do people ask you for help with? That might be the clue."],
      ["Where do you want to be living in five years, and who is with you?"],
      ["What would you tell yourself at twelve?", undefined, "deep"],
    ]),
  },
  {
    slug: "gratitude-drop",
    title: "Gratitude Drop",
    subtitle: "Say it to their face",
    blurb: "Appreciation, out loud, to someone in the room. A good way to finish a night.",
    accent: "olive",
    icon: "gift",
    bestWith: "Two and up",
    cards: build("gratitude-drop", [
      ["Say thank you to someone in this room, out loud, and say what for."],
      ["Who outside this room deserves a message tonight?", "Send it before you leave."],
      ["What is one good thing about your family?"],
      ["Name a teacher, coach or leader who changed something for you."],
      ["What is something about your own body or mind you are grateful for?"],
      ["What is the smallest good thing that happened today?"],
      ["Who has forgiven you for something?", undefined, "deep"],
      ["What are you grateful for now that you complained about a year ago?"],
    ]),
  },
  {
    slug: "first-jobs",
    title: "Work & Money",
    subtitle: "The stuff nobody explains",
    blurb: "First jobs, money habits, ambition and burnout. Practical, and more revealing than it looks.",
    accent: "clay",
    icon: "landmark",
    bestWith: "Two to eight",
    cards: build("first-jobs", [
      ["What was your first job, and what did it teach you?"],
      ["What did the adults around you teach you about money, on purpose or by accident?", undefined, "deep"],
      ["What is something you spend money on that you would defend to anyone?"],
      ["What does enough look like for you?", undefined, "deep"],
      ["Have you ever been treated badly at work? What did you do?", undefined, "deep"],
      ["What would you do with a free year and no obligations?"],
      ["What is the difference between working hard and burning out?", "Which one are you doing?", "deep"],
      ["Who do you know who seems to have it right? What do they do differently?"],
    ]),
  },
  {
    slug: "word-up",
    title: "Word Up",
    subtitle: "A verse and a question",
    blurb: "For groups who want a text to work from. Read it together, then talk about what it asks of you this week.",
    accent: "indigo",
    icon: "book",
    bestWith: "Two to twelve",
    cards: build("word-up", [
      ["Read it out. What would doing this actually look like on Monday?", "Name one specific person or place.", "warm", "Micah 6:8"],
      ["What does this promise, and where do you struggle to believe it?", undefined, "deep", "Jeremiah 29:11"],
      ["Who in your life needs to hear this said to them?", undefined, "warm", "Zephaniah 3:17"],
      ["What is the hardest word in this passage for you?", undefined, "deep", "1 Corinthians 13:4-7"],
      ["If this were true of you, what would change this week?", undefined, "deep", "Romans 12:2"],
      ["What does this say about how we treat the person nobody notices?", undefined, "deep", "Matthew 25:40"],
      ["Where do you need this kind of courage right now?", undefined, "warm", "Joshua 1:9"],
      ["What would it mean to bring your whole self here, not the edited version?", undefined, "deep", "Psalm 139:23-24"],
    ]),
  },
];

export const DECKS_BY_SLUG: Record<string, Deck> = Object.fromEntries(DECKS.map(d => [d.slug, d]));

export const TOTAL_CARDS = DECKS.reduce((sum, d) => sum + d.cards.length, 0);
