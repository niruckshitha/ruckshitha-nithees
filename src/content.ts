/* ──────────────────────────────────────────────────────────────────────────
 *  ✨ Written in the Stars — everything on the site comes from this file ✨
 *
 *  Edit the text between the quotes. Lines marked ✏️ are the ones to look at.
 *  Photos: see README (photos-original/ + `npm run optimize-images`).
 * ────────────────────────────────────────────────────────────────────────── */

export interface Chapter {
  title: string;
  caption: string;
  date: string;
  photo: string;
}

export interface Content {
  herName: string;
  myName: string;
  /** ISO date-time of the day it all began (IST). */
  togetherSince: string;
  /** "MM-DD" — anniversary mode + countdown target. */
  anniversaryMonthDay: string;
  heroPhoto: string;
  heroQuote: string;
  timeline: Chapter[];
  thenPhoto: string;
  nowPhoto: string;
  reasons: string[];
  letter: string;
  promises: string[];
  /** Extra promises in their own section below the normal ones (unlocked after those are opened). */
  specialPromises: string[];
  /** "Our Memories" gallery near the end. Photos come from scripts/optimize-images.mjs (GALLERY). */
  gallery: { photo: string; caption: string }[];
  closingLine: string;
  /** Very first screen: she must type the password to get in. */
  password: {
    prompt: string;
    /** Capital letters don't matter; spaces before/after are ignored. */
    value: string;
    /** Shown after 2 wrong tries. */
    hint: string;
    /** Playful replies to a wrong password (shown in turn). */
    wrongReplies: string[];
  };
  /** Second screen: a question with Yes / No buttons. "Yes" opens the envelope. */
  gate: {
    question: string;
    yes: string;
    no: string;
    /** Playful replies shown (in turn) each time she taps "No". */
    noReplies: string[];
  };
  /** Optional soft background music (e.g. "/audio/music.mp3"). Empty = no music toggle. */
  backgroundMusic: string;
}

export const content: Content = {
  herName: 'Ruckshitha',
  myName: 'Nithees',
  togetherSince: '2024-09-27T00:00:00+05:30',
  anniversaryMonthDay: '09-27',

  heroPhoto: '/photos/hero.webp',
  heroQuote: "Two years of you, and I'm still falling.",

  // Exactly 6 chapters. Photos are chosen from your originals — see scripts/optimize-images.mjs.
  timeline: [
    {
      title: 'Chapter 1',
      caption: 'The day it all began. Your hand found mine, and it never really let go.',
      date: 'September 2024',
      photo: '/photos/t1.webp',
    },
    {
      // ✏️
      title: 'Chapter 2',
      caption: 'Our first selfie under the trees — you hid your smile behind your hand, but your eyes gave you away.',
      date: 'November 2024',
      photo: '/photos/t2.webp',
    },
    {
      // ✏️ a favourite memory
      title: 'Chapter 3',
      caption: 'The little things — your fingers in mine, that ring, and me quietly wishing the moment would never end.',
      date: 'March 2025',
      photo: '/photos/t3.webp',
    },
    {
      // ✏️ our first anniversary
      title: 'Chapter 4',
      caption: 'One whole year of us — and somehow I loved you more than I did the day before.',
      date: 'September 2025',
      photo: '/photos/t4.webp',
    },
    {
      // ✏️ an adventure
      title: 'Chapter 5',
      caption: 'You in that green saree, me on one knee — you blushed, and the whole world went quiet.',
      date: 'January 2026',
      photo: '/photos/t5.webp',
    },
    {
      title: 'Chapter 6',
      caption: 'Two years, and this is only the beginning.',
      date: 'September 2026',
      photo: '/photos/t6.webp',
    },
  ],

  thenPhoto: '/photos/then.webp', // 2024
  nowPhoto: '/photos/now.webp', // 2026

  // ✏️ Reasons (flip cards) — any number works
  reasons: [
    'Your true love and loyalty to me.',
    'You have changed your own feelings for my work and my pressure. Thanks a lot for it.',
    'You were looking innocent and beautiful in the class, which made me feel you would be good.',
    'You have the capability to make me speak only the truth, without hiding anything.',
    'You made me propose when you thought you needed me.',
    'I see mummyyyy in you when I get sad and when I am not well.',
    'Sex youuuuuu daily.',
    'Hold your butt and boobs tight every day, as they are mine.',
    'I liked the taste of your lips when they met mine on 1st November 2025. I need it daily.',
  ],

  // ✏️ Your letter. Blank lines start a new paragraph.
  letter: `My dearest Ruckshitha,

Two years ago, on the 27th, I saw you in a sandal-coloured dress. Later, when you were in a green dress, I somehow found the courage to ask for your Insta ID. From that very first chat, I felt free to talk in a way I had never felt with a girl before.

After my mother, you are the one who told me "I like you."

Of course, there were many bitter fights at the start of our journey. But they taught me what makes you comfortable, and I changed my ways to suit you.

Still, everything I have done for you is so small compared to everything you have done for me.

In an era when so many girls look for their boyfriend's money, you only ever asked for my time. And it's true — when I couldn't give you the quality time you deserved, you changed yourself for me, and set your own feelings aside just for my happiness.

And you have always been so loyal, Ruckshitha…

Ruckshitha, forever, I love you — my baby, my mummy, my partner, my sex-partner — so, so much.

Thank you for everything, Ruckshitha.

I know we will have an understanding journey together, baby…

Thank you for understanding me, darling.
Happy anniversary, my love.`,

  // ✏️ 6 promises for the years ahead
  promises: [
    'To hold your hand a little tighter on the hard days.',
    'To keep making you laugh until your cheeks hurt.',
    'To listen — really listen — even when I think I already know.',
    'To choose you, again and again, every single day.',
    'To celebrate your dreams like they are my own.',
    'To keep writing our story, one beautiful chapter at a time.',
  ],

  // ✏️ Special promises — shown below the normal ones, unlocked once those are all opened
  specialPromises: [
    'Sex you when you are in a red saree with jasmine flowers.',
    'Have flirty talks every day and slide my fingers in you.',
    'Me drinking your milk and you licking my cum.',
  ],

  // ✏️ "Our Memories" gallery — captions show when a photo is opened
  gallery: [
    { photo: '/photos/gallery/g1.webp', caption: 'Your hand on my shoulder, and my whole world feels steady.' },
    { photo: '/photos/gallery/g2.webp', caption: 'That giggle you tried so hard to hide.' },
    { photo: '/photos/gallery/g3.webp', caption: 'You, blessing me the way only you can.' },
    { photo: '/photos/gallery/g4.webp', caption: 'Hands that fit like they were made for each other.' },
    { photo: '/photos/gallery/g5.webp', caption: 'My favourite place — right beside you.' },
    { photo: '/photos/gallery/g6.webp', caption: 'You blushed, I knelt, and time stood still.' },
    { photo: '/photos/gallery/g7.webp', caption: 'Us, under the trees, right at the start.' },
    { photo: '/photos/gallery/g8.webp', caption: 'Holding on to you, always.' },
    { photo: '/photos/gallery/g9.webp', caption: 'Your hand over mine.' },
    { photo: '/photos/gallery/g10.webp', caption: 'Sitting close, never wanting to leave.' },
  ],

  closingLine: 'Two years down, forever to go. Nithees & Ruckshitha, always.',

  // ✏️ Password screen (the very first thing she sees)
  password: {
    prompt: 'Give me the password, madam…',
    value: 'RuckshithaNithees',
    hint: 'Hint: both our names, together 💕',
    wrongReplies: ["Hmm… that's not it, madam 😏", 'Try again, my love 💭', 'So close… or not 😜'],
  },

  // ✏️ Envelope screen question
  gate: {
    question: 'Would you like to start reading my thoughts?',
    yes: 'Yes',
    no: 'No',
    noReplies: [
      'Are you sure, my love? 🥺',
      'Nice try 😜',
      "You can't say no to me, baby 😏",
      'Think again, darling… 💭',
      'Catch me if you can 😘',
      "The 'Yes' is right there 💕",
    ],
  },

  backgroundMusic: '', // optional, e.g. '/audio/music.mp3'
};
