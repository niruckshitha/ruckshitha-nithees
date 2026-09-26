# Written in the Stars ✨

A private 2nd-anniversary website for Ruckshitha, from Nithees.
Everything runs on this computer. Nothing is uploaded unless you do it yourself.

---

## ✅ Before you send it: checklist

1. **Read the letter, reasons, promises and chapter captions** in `src/content.ts` and make them yours. Each line marked `✏️` is worth a look.
2. Run `npm run build && npm run preview` once and open it on your phone (see below).

---

## (a) What to edit: `src/content.ts`

This is the only file you need to touch.

| Field | What it does |
|---|---|
| `herName`, `myName` | Names used everywhere |
| `togetherSince` | The day it began (`2024-09-27T00:00:00+05:30`). The live counter and "2nd" are computed from this. |
| `anniversaryMonthDay` | `"09-27"`. On this date (India time) the site switches to anniversary mode. |
| `heroQuote` | The italic line under your names |
| `timeline` | 6 chapters: `title`, `caption`, `date` and `photo`. The caption is also the photo's alt text. |
| `reasons` | Flip cards (any number) |
| `letter` | Your letter. A blank line starts a new paragraph. The first paragraph is the greeting. |
| `promises` | Wax-seal promises |
| `specialPromises` | Extra promises below, unlocked after the normal ones are opened |
| `gallery` | "Our Memories" photos near the end: `photo` + `caption` (shown when a photo is opened) |
| `closingLine` | The last big line |
| `password` | The very first screen: `prompt`, the password `value` (capitals don't matter), the `hint` shown after 2 wrong tries, and the playful `wrongReplies` |
| `gate` | Envelope screen (after the password): `question`, the `yes` / `no` button words, and the playful `noReplies` shown when she taps No |
| `backgroundMusic` | Optional. Create a `public/audio/` folder, put a song there and set e.g. `'/audio/music.mp3'`. A music button appears (off by default). Leave it `''` for no music. |

**Chapter dates:** the photos come from Nov 2024 and Jan 2026. Chapter 3 ("March 2025") uses the ring close-up, and Chapter 4 ("September 2025") uses a photo from January 2026. Change the dates or swap the photos if you like.

---

## (b) Photos

- **Original photos** are in `photos-original/`. Your 31 originals were moved here; nothing was deleted.
- **Which photo goes where** is set at the top of `scripts/optimize-images.mjs`. The current picks:

| Slot | Photo | Why |
|---|---|---|
| `hero` | `IMG_20260110_143724` | Her arm wrapped around yours, both smiling |
| `then` (2024) | `IMG_20241128_130704` | The tree selfie, where she's shyly hiding her smile |
| `now` (2026) | `IMG_20260110_142850` | Sitting close together on the rock |
| `t1` | `IMG_20241125_125306` | Fingers interlaced: "the day it all began" |
| `t2` | `IMG_20241128_131251` | Her playful hand-on-cheek selfie |
| `t3` | `IMG_20241125_125356` | The ring close-up |
| `t4` | `IMG_20260110_143740` | Standing arm in arm |
| `t5` | `IMG_20260110_154857` | You kneeling while she blushes |
| `t6` | `IMG_20260110_154951` | The two of you standing together |

- **Gallery ("Our Memories")**: the `GALLERY` list in the same script picks 10 more photos (g1–g10). Add, remove or reorder entries there, run the optimizer, then match the list in `content.gallery`.
- **To swap a photo:** drop the new file in `photos-original/`, change the `file:` name in that list, then run the optimizer.
  - To adjust a crop, change the `crop` fractions, e.g. make `top` smaller to show more above the heads.

## (c) Image optimizer

```bash
npm run optimize-images
```

This turns the originals into small WebP files in `public/photos/`, at most 1600px, with the hero at 1100px and the timeline at 1000px. It also makes `public/og.jpg`, the 1200×630 WhatsApp preview image.

## (d) Preview it

```bash
npm install          # only the first time
npm run dev          # opens on http://localhost:5173
```

**On your phone** (same Wi-Fi as the computer):

```bash
npm run dev -- --host
```

Then open the `Network:` address it prints (e.g. `http://192.168.1.23:5173`) in your phone's browser.

**Preview any date** by adding `?date=` to the address:

| URL | What you'll see |
|---|---|
| `?date=2026-09-27` | Anniversary mode: "Happy 2nd Anniversary, my love", gold confetti, celebration panel |
| `?date=2026-09-26` | Day before: "Almost 2 Years Together", no celebration panel |
| `?date=2026-09-28` | Day after: "2 Years Together", no celebration panel |
| `?date=2026-09-26T23:59:50%2B05:30` | Watch midnight roll over live (`%2B` is a `+`) |

Without `?date=`, the site uses the real time in India (IST).

**Final check, exactly as it will be served:**

```bash
npm run build && npm run preview     # http://localhost:4173
# phone: npm run preview -- --host
```

---

## Good to know

- **The password (`RuckshithaNithees`) is a sweet lock, not real security.** The whole site, including the password, ships to the browser, so a tech-savvy person could read it. It's plenty to keep the page private from anyone who just gets the link, but don't reuse a real password.
- The site uses `noindex, nofollow`, so search engines are asked not to list it.
- It respects "Reduce motion" on her phone: everything still appears, just without the big movements.

---

## OPTIONAL: sharing it later without Git

> Only do this if and when you decide to. Nothing here has been done for you.

1. Run `npm run build`. This creates a `dist/` folder.
2. Go to **https://app.netlify.com/drop** and drag the whole `dist` folder onto the page.
3. Netlify gives you a link like `https://something-lovely-123.netlify.app`. That's the link to send.

**For a nice WhatsApp preview (photo + "For Ruckshitha ♥ Happy 2nd Anniversary"):** WhatsApp needs the full web address of the preview image.

1. After the first upload, open `.env` and set `VITE_SITE_URL=https://something-lovely-123.netlify.app` (no slash at the end).
2. Run `npm run build` again.
3. In Netlify, open your site → **Deploys** and drag the new `dist` folder there. This keeps the same link.

Send the link *after* this, because WhatsApp remembers the first preview it sees.

Anyone with the link can open it, and the photos in it are then on the internet. Keep that in mind before sharing.
