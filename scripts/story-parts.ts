/**
 * The script of "The Broke Apocalypse". One entry per reel.
 * Chunks are the narrator lines AND the on-screen subtitles: *word* = gold italic emphasis in the subtitle only.
 * {p: seconds} inserts a pause. Cue times are seconds from the beat start, or { chunk, off } = relative to a narrator line.
 * Rules for copy: no em dashes, short lines, deadpan.
 */
import type { ShotOpts } from './story-shots';

export type Chunk = string | { p: number };
export type At = number | { chunk: number; off?: number };
export type Cam = { from: [number, number, number, number]; to: [number, number, number, number]; ease?: string; hand?: number };
export type Beat = {
  shot?: string;
  shots?: { shot: string; at: At; opts?: ShotOpts; cam?: Cam; tr?: string }[];
  opts?: ShotOpts;
  vo?: Chunk[];
  label?: string;
  fries?: number;
  cam?: Cam;
  cues?: { k: string; at: At; v?: number | string }[];
  tr?: 'cut' | 'dip' | 'flash' | 'glitch';
  trd?: number;
  lead?: number;
  pad?: number;
  min?: number;
  bed?: 'silence' | 'calm' | 'uneasy' | 'dread' | 'panic' | 'hope';
};
export type Part = { title: string; beats: Beat[]; tail?: number };

const push = (x = 0, y = 0, s0 = 1.03, s1 = 1.12, r0 = 0, r1 = 0): Cam => ({ from: [-x, -y, s0, r0], to: [x, y, s1, r1] });

export const PARTS: Record<string, Part> = {};

/* ===================================================== PART 1: THE FREE TRIAL ===================================================== */
PARTS.p1 = {
  title: 'The Broke Apocalypse, Part 1: The Free Trial',
  beats: [
    { // cold open
      shot: 'door', opts: { fries: 1, mood: 'shock' }, label: 'DAY 6  ·  3:12 AM', fries: 1, bed: 'dread', lead: 1.5, pad: 0.35,
      vo: ['Day six.', 'Three twelve *a.m.*', 'Something is *knocking* at my door.'],
      cues: [{ k: 'knock', at: 0.4 }, { k: 'knock', at: 1.0 }, { k: 'knock', at: { chunk: 2, off: 0.62 } }],
      cam: { from: [0, 0, 1.02, 0], to: [36, -30, 1.15, -1.2] },
    },
    {
      shot: 'doorclose', label: 'DAY 6  ·  3:12 AM', bed: 'dread', pad: 0.3, lead: 0.2,
      vo: ['It knows my *name*.', 'It knows my *card number*.', 'And it charges me to *stand there*.'],
      cues: [{ k: 'breath', at: { chunk: 1, off: 0 } }, { k: 'knock', at: { chunk: 2, off: 1.5 } }],
      cam: { from: [0, 0, 1.0, 0], to: [-10, -50, 1.12, 0.8] },
    },
    {
      shot: 'title', opts: { top: 'THE BROKE\nAPOCALYPSE', sub: 'PART 1  ·  THE FREE TRIAL' }, bed: 'silence', min: 3.1, lead: 0.1, tr: 'glitch',
      cues: [{ k: 'stinger', at: 0.15 }],
      cam: { from: [0, 0, 1.0, 0], to: [0, 0, 1.06, 0] },
    },
    {
      shot: 'couch', opts: { mood: 'happy', fries: 9 }, label: 'DAY 1', fries: 9, bed: 'calm', tr: 'dip', pad: 0.4,
      vo: ['Day one.', "I'm a halal snack pack.", 'Nine fries.', "That's my whole *budget* for the week."],
      cues: [{ k: 'tv', at: 0.2 }, { k: 'ad', at: { chunk: 3, off: 1.1 } }],
      cam: { from: [-26, 14, 1.02, 0], to: [24, -26, 1.13, 0] },
    },
    {
      shot: 'phone', label: 'DAY 1', bed: 'uneasy', pad: 0.45,
      vo: ['Then a banner popped up.', '*Seven days free.*', 'I tapped it.', '*Zero* dollars.', 'That should have been the *first warning*.'],
      cues: [{ k: 'tap', at: { chunk: 2, off: 0.55 } }, { k: 'ping', at: { chunk: 3, off: 0.05 } }, { k: 'sting', at: { chunk: 4, off: 0.3 } }],
      cam: { from: [0, 20, 1.0, 1], to: [0, -30, 1.1, -1] },
    },
    {
      shot: 'cups', opts: { mood: 'sideeye', fries: 9, mood2: 'sad', fries2: 7 }, label: 'DAY 2', fries: 9, bed: 'uneasy', tr: 'cut', pad: 0.4,
      vo: ['Day two.', 'One bubble tea.', "Doesn't *count*.", 'Then it was lunch.', 'Then there were *five*.'],
      cues: [
        { k: 'cup', at: { chunk: 1, off: 0.5 } }, { k: 'cup', at: { chunk: 3, off: 0.3 } },
        { k: 'cup', at: { chunk: 4, off: 0.05 } }, { k: 'cup', at: { chunk: 4, off: 0.4 } }, { k: 'cup', at: { chunk: 4, off: 0.75 } },
        { k: 'fries', at: { chunk: 4, off: 1.05 }, v: 7 },
      ],
      cam: { from: [-20, 10, 1.02, 0], to: [20, -10, 1.1, 0.5] },
    },
    {
      shot: 'list', opts: { mood: 'shock', fries: 7, fries2: 5 }, label: 'DAY 3', fries: 7, bed: 'dread', tr: 'cut', pad: 0.55,
      vo: ['Day three.', 'I opened my bank app, and saw them.', "A gym I haven't entered since *March*.", 'A cloud I never use.', "An app I can't even *name*.", 'Still *charging*.'],
      cues: [
        { k: 'row', at: { chunk: 2, off: 0.8 } }, { k: 'row', at: { chunk: 3, off: 0.35 } }, { k: 'row', at: { chunk: 4, off: 0.9 } }, { k: 'row', at: { chunk: 5, off: 0.55 } },
        { k: 'turn', at: { chunk: 5, off: 0.0 } }, { k: 'fries', at: { chunk: 5, off: 0.7 }, v: 5 },
      ],
      cam: { from: [0, 30, 1.0, -1], to: [0, -30, 1.07, 1] },
    },
    {
      shot: 'street', opts: { mood: 'shock', fries: 5, mood2: 'sad', fries2: 4 }, label: 'DAY 4', fries: 5, bed: 'dread', tr: 'cut', pad: 0.5,
      vo: ['Day four.', 'They started *walking*.', 'Slowly.', 'Politely.', 'Because every month,', 'they have *all the time*.'],
      cues: [{ k: 'steps', at: { chunk: 1, off: 0.2 } }, { k: 'fries', at: { chunk: 5, off: 0.5 }, v: 4 }],
      cam: { from: [0, 0, 1.0, 0], to: [0, -20, 1.12, 0] },
    },
    {
      shot: 'fridge', opts: { mood: 'sad', fries: 4 }, label: 'DAY 5', fries: 4, bed: 'uneasy', tr: 'cut', pad: 0.5,
      vo: ['Day five.', 'One rule *worked*.', "Don't buy it.", 'Put it in the *fridge*.', 'Twenty-four hours.', "If you still want it tomorrow, it's *yours*."],
      cues: [{ k: 'fdoor', at: { chunk: 3, off: 0.0 } }, { k: 'lcd', at: { chunk: 4, off: 0.0 } }, { k: 'hum', at: 0 }],
      cam: { from: [0, 0, 1.0, 0], to: [0, -30, 1.1, 0] },
    },
    {
      shot: 'table', opts: { mood: 'sad', fries: 4, mood2: 'broke', fries2: 1 }, label: 'DAY 6', fries: 4, bed: 'dread', tr: 'cut', pad: 0.55,
      vo: ['Day six.', 'The fridge *held*.', "My wallet *didn't*.", 'One fry left.'],
      cues: [{ k: 'fries', at: { chunk: 2, off: 0.7 }, v: 1 }, { k: 'buzz', at: { chunk: 3, off: 0.1 } }],
      cam: { from: [-10, 10, 1.02, 0], to: [20, -10, 1.1, 0] },
    },
    {
      shot: 'door', opts: { fries: 1, mood: 'shock', empty: true }, label: 'DAY 6  ·  3:19 AM', fries: 1, bed: 'silence', tr: 'dip', pad: 0.6, lead: 0.5,
      vo: ['Three nineteen *a.m.*', 'The knocking *stopped*.', 'I thought they had given up.'],
      cam: { from: [0, 0, 1.0, 0], to: [-14, -20, 1.08, 0.4] },
    },
    {
      shot: 'fridgedoor', opts: { mood: 'shock', fries: 1 }, label: 'DAY 6  ·  3:19 AM', fries: 1, bed: 'panic', tr: 'cut', pad: 0.9, lead: 0.3,
      vo: ['Then I heard it again.', 'Not at the door.', 'Inside my *fridge*.'],
      cues: [{ k: 'fknock', at: { chunk: 1, off: 0.2 } }, { k: 'fknock', at: { chunk: 2, off: 0.0 } }, { k: 'fknock', at: { chunk: 2, off: 0.55 } }, { k: 'fknock', at: { chunk: 2, off: 1.3 } }, { k: 'hum', at: 0 }],
      cam: { from: [0, 0, 1.0, 0], to: [0, -20, 1.2, 0] },
    },
    {
      shot: 'tag', opts: { next: 'PART 2  ·  TOMORROW' }, bed: 'hope', tr: 'glitch', min: 5.2, lead: 0.5, pad: 2.2,
      vo: ['Part two. *Tomorrow.*'],
      cues: [{ k: 'stinger', at: 0.0 }],
      cam: { from: [0, 0, 1.0, 0], to: [0, 0, 1.04, 0] },
    },
  ],
};

/* ===================================================== PART 2: THE FRIDGE ===================================================== */
PARTS.p2 = {
  title: 'The Broke Apocalypse, Part 2: The Fridge',
  beats: [
    {
      shot: 'fridgedoor', opts: { mood: 'shock', fries: 1 }, label: 'DAY 6  ·  3:20 AM', fries: 1, bed: 'dread', lead: 0.9, pad: 0.35,
      vo: ["I'm a halal snack pack.", 'A free trial ate my week.', 'And something is *knocking*', 'from inside my fridge.'],
      cues: [{ k: 'fknock', at: 0.3 }, { k: 'fknock', at: { chunk: 2, off: 0.5 } }, { k: 'fknock', at: { chunk: 3, off: 0.9 } }, { k: 'hum', at: 0 }],
      cam: { from: [0, 0, 1.0, 0], to: [0, -20, 1.14, 0] },
    },
    {
      shot: 'fridgeopen', opts: { mood: 'shock', fries: 1 }, label: 'DAY 6  ·  3:20 AM', bed: 'dread', pad: 0.45,
      vo: ['The timer hit *zero*.', 'The door opened by itself.', 'And there they were.', 'The sneakers. The headphones.', 'Everything I wanted at *three in the morning*.'],
      cues: [{ k: 'fopen', at: 0.15 }, { k: 'whisper', at: { chunk: 2, off: 0.4 } }, { k: 'whisper', at: { chunk: 4, off: 0.25 } }],
      cam: { from: [0, 10, 1.0, 0], to: [0, -30, 1.16, 0] },
    },
    {
      shot: 'lifecycle', label: 'HOW IT SPREADS', bed: 'uneasy', tr: 'flash', trd: 0.25, pad: 0.8,
      vo: ["Here's what nobody tells you.", 'Every zombie started as a *want*.', 'You want it.', 'You buy it.', 'You *forget* it.', 'It never forgets *you*.'],
      cues: [{ k: 'step', at: { chunk: 2, off: 0.05 } }, { k: 'step', at: { chunk: 3, off: 0.05 } }, { k: 'step', at: { chunk: 4, off: 0.05 } }, { k: 'step', at: { chunk: 5, off: 0.1 } }],
      cam: { from: [0, 0, 1.0, 0], to: [0, -10, 1.05, 0] },
    },
    {
      shot: 'choice', opts: { mood: 'ok', fries: 1 }, label: 'DAY 6  ·  3:21 AM', fries: 1, bed: 'uneasy', tr: 'cut', pad: 0.5,
      vo: ['Twenty-four hours were up.', 'So I asked the only question that matters.', 'Do I still *want* it?', 'The sneakers? *No.*', 'They screamed. Then they were *gone*.'],
      cues: [{ k: 'no', at: { chunk: 3, off: 0.7 } }, { k: 'poof', at: { chunk: 4, off: 0.85 } }],
      cam: { from: [-10, 10, 1.0, 0], to: [10, -10, 1.1, 0] },
    },
    {
      shot: 'choice', opts: { mood: 'ok', fries: 1, empty: true }, label: 'DAY 6  ·  3:21 AM', bed: 'hope', tr: 'cut', pad: 0.55,
      vo: ['The headphones?', 'I actually still wanted those.', 'They sat down. *Quietly.*', "That's the difference between a want and a monster.", '*Time.*'],
      cues: [{ k: 'yes', at: { chunk: 1, off: 0.5 } }, { k: 'calm', at: { chunk: 2, off: 0.3 } }],
      cam: { from: [10, 0, 1.02, 0], to: [-8, -14, 1.1, 0] },
    },
    {
      shot: 'street', opts: { mood: 'shock', fries: 1, still: true }, label: 'DAY 6  ·  3:24 AM', bed: 'dread', tr: 'dip', pad: 0.5,
      vo: ['Then the street went *quiet*.', 'All of them. Stopped.', 'Like they were waiting for *someone*.'],
      cues: [{ k: 'hush', at: 0 }],
      cam: { from: [0, 0, 1.0, 0], to: [0, -10, 1.1, 0] },
    },
    {
      shot: 'notif', opts: { mood: 'shock', fries: 1 }, label: 'DAY 6  ·  3:26 AM', bed: 'dread', tr: 'cut', pad: 0.55,
      vo: ['My phone lit up.', '*Your free trial has been upgraded.*', 'Annual plan.', 'One hundred and eighty nine dollars.', 'Billing starts in *twenty four hours*.'],
      cues: [{ k: 'ping', at: { chunk: 1, off: 0.0 } }, { k: 'sting', at: { chunk: 2, off: 0.0 } }, { k: 'buzz', at: 0.1 }],
      cam: { from: [0, 10, 1.0, 0], to: [0, -20, 1.1, 0] },
    },
    {
      shot: 'boss', label: 'DAY 6  ·  3:27 AM', bed: 'panic', tr: 'cut', pad: 0.8,
      vo: ['The small ones were never the problem.', 'They were the *welcome party*.', 'Something much bigger was *waking up*.'],
      cues: [{ k: 'rumble', at: 0.1 }, { k: 'stinger', at: { chunk: 2, off: 0.15 } }],
      cam: { from: [0, 50, 1.0, 0], to: [0, -30, 1.18, 0] },
    },
    {
      shot: 'tag', opts: { next: 'PART 3  ·  TOMORROW' }, bed: 'hope', tr: 'glitch', min: 5.2, lead: 0.5, pad: 2.2,
      vo: ['Part three. *Tomorrow.*'],
      cues: [{ k: 'stinger', at: 0.0 }],
      cam: { from: [0, 0, 1.0, 0], to: [0, 0, 1.04, 0] },
    },
  ],
};

/* ===================================================== PART 3: THE ROAST ===================================================== */
PARTS.p3 = {
  title: 'The Broke Apocalypse, Part 3: The Roast',
  beats: [
    {
      shot: 'boss', opts: { smash: true }, label: 'DAY 7  ·  3:31 AM', fries: 1, bed: 'panic', lead: 1.4, pad: 0.4,
      vo: ['Day seven.', 'One fry. One phone.', 'And an annual plan *breaking through my wall*.'],
      cues: [{ k: 'rumble', at: 0.0 }, { k: 'smash', at: { chunk: 2, off: 1.0 } }],
      cam: { from: [0, 0, 1.0, 0], to: [0, -20, 1.12, 0] },
    },
    {
      shot: 'table', opts: { mood: 'broke', fries: 1 }, label: 'DAY 7  ·  3:32 AM', bed: 'dread', tr: 'cut', pad: 0.5,
      vo: ['I tried everything.', 'Cancel buttons. Hiding. *Hoping.*', 'Nothing works on something that *renews*.'],
      cues: [{ k: 'buzz', at: { chunk: 2, off: 0.2 } }],
      cam: { from: [-10, 10, 1.02, 0], to: [20, -10, 1.1, 0] },
    },
    {
      shot: 'rescue', opts: { mood: 'ok', fries: 1 }, label: 'DAY 7  ·  3:33 AM', bed: 'uneasy', tr: 'cut', pad: 0.45,
      vo: ['Then I remembered an app.', 'I had downloaded it at *three a.m.*', 'It was called *Brokey*.', 'The mascot looked a lot like *me*.'],
      cam: { from: [-14, 6, 1.0, 0], to: [10, -14, 1.1, 0] },
    },
    {
      shot: 'rescue', opts: { mood: 'proud', fries: 1 }, label: 'DAY 7  ·  3:34 AM', bed: 'uneasy', tr: 'cut', pad: 0.55,
      vo: ['It does not cancel anything.', 'It just tells you the *truth*.', 'So I read the first line *out loud*.', 'The gym zombie *flinched*.', 'Then it started to *cry*.'],
      cues: [{ k: 'roast', at: { chunk: 2, off: 0.9 } }, { k: 'cry', at: { chunk: 4, off: 0.35 } }],
      cam: { from: [10, 0, 1.02, 0], to: [-10, -20, 1.12, 0] },
    },
    {
      shot: 'stamps', label: 'DAY 7  ·  3:36 AM', bed: 'hope', tr: 'flash', trd: 0.2, pad: 0.5,
      vo: ['Gym. You went *twice*.', 'Cloud. You have *never* opened it.', 'Meal kit. You cooked *once*. Badly.', 'Streaming. You watched *one show*. Twice.', 'One by one, they *cancelled themselves*.'],
      cues: [
        { k: 'card', at: { chunk: 0, off: 0.0 } }, { k: 'stamp', at: { chunk: 0, off: 1.15 } },
        { k: 'card', at: { chunk: 1, off: 0.0 } }, { k: 'stamp', at: { chunk: 1, off: 1.35 } },
        { k: 'card', at: { chunk: 2, off: 0.0 } }, { k: 'stamp', at: { chunk: 2, off: 1.6 } },
        { k: 'card', at: { chunk: 3, off: 0.0 } }, { k: 'stamp', at: { chunk: 3, off: 1.6 } },
      ],
      cam: { from: [0, 0, 1.0, 0], to: [0, -10, 1.05, 0] },
    },
    {
      shot: 'boss', opts: { cry: true }, label: 'DAY 7  ·  3:44 AM', bed: 'dread', tr: 'cut', pad: 0.9,
      vo: ['The big one did not flinch.', 'So I did the maths.', 'One eighty nine, ninety nine.', "That's ten and a half halal snack packs.", 'For a show you watched *twice*.', 'And it *wept*.'],
      cues: [{ k: 'cry', at: { chunk: 5, off: 0.1 } }, { k: 'rumble', at: 0.1 }],
      cam: { from: [0, 40, 1.0, 0], to: [0, -20, 1.14, 0] },
    },
    {
      shot: 'dawn', opts: { mood: 'ok', fries: 1, mood2: 'happy', fries2: 9 }, label: 'MONDAY', fries: 1, bed: 'hope', tr: 'dip', pad: 0.5,
      vo: ['By morning, it was quiet.', 'The fries came back on *Monday*.', 'All nine.', "That's the thing about a *budget*.", 'It *resets*.'],
      cues: [{ k: 'fries', at: { chunk: 2, off: 0.05 }, v: 3 }, { k: 'fries', at: { chunk: 2, off: 0.3 }, v: 5 }, { k: 'fries', at: { chunk: 2, off: 0.55 }, v: 7 }, { k: 'fries', at: { chunk: 2, off: 0.8 }, v: 9 }],
      cam: { from: [0, 20, 1.02, 0], to: [0, -20, 1.1, 0] },
    },
    {
      shot: 'appshow', bed: 'hope', tr: 'flash', trd: 0.22, pad: 0.5,
      vo: ["It's real, by the way.", 'It is called *Brokey*.', 'Your budget, in halal snack packs.', 'It roasts you *before* the zombies do.'],
      cues: [{ k: 'pop', at: 0.2 }, { k: 'pop', at: 0.5 }, { k: 'pop', at: 0.78 }],
      cam: { from: [0, 0, 1.0, 0], to: [0, -10, 1.05, 0] },
    },
    {
      shot: 'bnpl', label: 'DAY 8  ·  3:12 AM', bed: 'dread', tr: 'glitch', pad: 0.9,
      vo: ['I thought it was over.', 'Then my phone *buzzed*.', 'Pay in four.', 'Four *easy* payments.', 'Of nineteen ninety nine.', 'And a hand came out of the *screen*.'],
      cues: [{ k: 'buzz', at: { chunk: 1, off: 0.1 } }, { k: 'pay', at: { chunk: 3, off: 0.0 } }, { k: 'pay', at: { chunk: 3, off: 0.3 } }, { k: 'pay', at: { chunk: 3, off: 0.6 } }, { k: 'pay', at: { chunk: 3, off: 0.9 } }, { k: 'hand', at: { chunk: 5, off: 0.3 } }],
      cam: { from: [0, 0, 1.0, 0], to: [0, -20, 1.14, 0] },
    },
    {
      shot: 'tag', opts: { next: 'SEASON 2  ·  SOON' }, bed: 'hope', tr: 'glitch', min: 5.4, lead: 0.5, pad: 2.4,
      vo: ['Season two. *Soon.*'],
      cues: [{ k: 'stinger', at: 0.0 }],
      cam: { from: [0, 0, 1.0, 0], to: [0, 0, 1.04, 0] },
    },
  ],
};
