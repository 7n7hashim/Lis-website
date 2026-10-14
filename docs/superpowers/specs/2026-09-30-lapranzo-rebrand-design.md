# La Pranzo — rebrand design

**Date:** 2026-09-30
**Replaces:** `2026-09-28-crave-rebrand-design.md` (Crave), which replaced
`2026-08-26-lis-rebrand-design.md` (Li's), which replaced Misono.
**Status:** approved, in build.

The architecture is kept for the fourth time. Everything else is replaced.

---

## 1. Who this is

**La Pranzo & Al-Diwan** — a Middle Eastern grill and cafe on Haile Selassie
Road in Mombasa. One branch. It calls itself **"Fast Food & Cafe"** on its own
logo and **"home of Middle Eastern Cuisine"** in its own Instagram bio, and
Google files it as a barbecue restaurant. All three are true at once, which is
the thing to design for: a room that does mandi and kunafa and also does
burgers and eighteen coffees.

### Every fact, and where it came from

Nothing below is invented. Sources read 2026-09-30.

| fact | value | source |
|---|---|---|
| Trading name | La Pranzo & Al-Diwan | its own logo artwork |
| Known as | La Pranzo | Google, Instagram, every review |
| Strapline | Fast Food & Cafe | its own logo artwork |
| Tagline | **Home of Middle Eastern Cuisine** | its own Instagram bio, verbatim |
| Address | Haile Selassie Rd, **next to Ola petrol station**, Mombasa 80100 | its own site; Google gives the road and postcode |
| Located in | United Meat Supplies | Google listing |
| Phone | **+254 768 818833** | Google, Instagram bio, its own site — all three agree |
| Hours | **12:00–23:00, daily** | africabz; Google corroborates the noon open |
| Standing | Google **4.7 (323)**, Ksh 500–2,500pp | Google listing |
| Instagram | **@lapranzoke**, 13.6K followers | Instagram |
| Website | `la-pranzo-al-diwan.odoo.com` | linked from the Instagram bio |
| Carte | **166 dishes, 19 courses**, KSh 100–2,500 | its twelve published menu boards |
| Alcohol | **none on any of the 166 items** | the boards themselves |

Two corroborations worth keeping: the carte's own ceiling is KSh 2,500, which
is exactly the top of Google's reported per-person range; and the noon open
appears independently on Google and on africabz.

### What is NOT asserted, and why

- **No founding year.** None is published anywhere.
- **No second branch.** Every source gives one address.
- **No email.** None is published. `.details` therefore carries PHONE and
  INSTAGRAM, which are the two channels that do exist.
- **No halal claim.** The carte is consistent with one and carries no pork,
  but no source states it, so the site does not either.
- **No seat count, no private room, no capacity.** Reviews mention an upstairs
  with "setup & deco" and that is not enough to build a claim on.
- **No delivery or booking claim.** Neither is published.

---

## 2. The ground, and the one rule the re-skin turns on

**The site inverts to a near-black ground.** This is the first rebrand here
that moves the ground rather than re-pointing it, and three independent things
demanded it: the logo's own field is black, the menu artwork is black, and the
room trades noon to eleven at night.

**La Pranzo's colour is `#FFCA2A`** — not chosen, *measured*: the exact modal
colour of three independent menu boards, 11–17% of every frame.

### The rule

Li's rule was *red is a light-ground colour*. Crave's was *two greens and
neither works on both grounds*. This one is simpler and stricter:

> **`#FFCA2A` is a dark-ground colour and nothing else.**
> 12.79:1 on `--ground`. **1.43:1 on a near-white field.**

Anything that has to be read on a light field — the locale band's marker cards
are the only ones left — takes `#7A5E0E` (5.70:1 there) or `--ground` itself
(18.24:1). Reaching for the accent on a light card is the mistake this palette
makes available, and it is the exact mirror of the mistake the last one did.

### Tokens

All re-derived against the near-black. None carried across.

| token | value | ratio on `--ground` | Crave's | note |
|---|---|---|---|---|
| `--ground` | `#0D0C0A` | — | `#FBFAF7` | near-black, faintest warm cast |
| `--ink` | `#F8F7F3` | **18.24** | 18.51 | display type |
| `--menu-ink` | `#F8F7F3` | 18.24 | 18.51 | same value |
| `--menu-body` | `#A79F91` | **7.46** | 7.32 | body |
| `--menu-accent` | `#FFCA2A` | **12.79** | 6.14 | eyebrows, rules, links |
| `--brand-yellow` | `#FFCA2A` | 12.79 | — | the FILL/device role |
| `--res-gold` | `#9A8654` | **5.50** | 5.05 | non-text boundary, small utility type |
| `--res-hair` | `#2E2A22` | **1.37** | 1.48 | decorative only |
| `--lp-amber` | `#7A5E0E` | 3.20 | — | **light-field escape only.** 5.70 on near-white |

**Every role lands within 0.5 of its Crave counterpart except the accent,
which doubles.** That is the finding that makes this affordable: the site's
measured contrast invariants transfer as a polarity flip rather than as a
re-solve of every floor. `--brand-green` was device-only because it failed AA
for text; `--brand-yellow` clears AAA on its own ground, so for the first time
the brand's actual colour can set type.

`--crave-green` is renamed **`--lp-yellow`** (the focus ring and the location
pill's fill) for the same reason it was renamed last time: it carried the old
brand's name. `--cream` is kept unchanged as the transplant hinge — it is
still not a colour, and all three adaptation blocks still turn on it.

### The plaque retires

Crave's black plaques existed to carry a black-field logo onto a white page.
**On a black page the logo is native and the plaque has no job**, so the device
is retired rather than inverted — an ivory plaque on black is not the same
object, it is a hole.

What replaces it is already published. Every heading on La Pranzo's own menu
boards is **black type inside a solid `#FFCA2A` block**. That becomes the
site's section marker, at 12.79:1, and it is the brand's device rather than an
invention. This is the signature element; everything around it stays quiet.

---

## 3. Photography

The bands invert again, back toward dark but not back to Li's set — this is a
grill room that opens at noon, not an evening dining room.

    hero            62     dark grill room, WHITE type over it again
    counter         70
    reserve         68     a laid table under warm light
    about opening   65
    about plate     55     full bleed, nothing on it
    chapters        72
    experience      80     plates under lamps
    diwan          130     the ONE lit band, and it is EARNED
    contact hero    60     still no baked vignette
    locale          75     was 108-118 — see below
    gallery tiles   95     a marquee on a black ground

**THE TYPE POLARITY FLIPS BACK TO WHITE**, and every luminance solved for
Crave's dark-type-on-bright-room hero must be re-solved. The worst-12px-tile
instrument is unchanged and still right; only the direction of the test flips.
A dark frame's worst case under white type is a lamp at 250, which a grade can
pull back — the easier of the two grounds, and the one this site had for its
first two lives.

**THE VIGNETTES COME BACK**, for the same reason they left: on a bright frame
a darkened corner reads as a dirty lens, and on a dark frame it concentrates
the eye. `contact-hero` still bakes none, now for a third distinct reason.

**THE DIWAN BAND IS EARNED, NOT INHERITED**, and it is the exact inverse of
the rule it replaces. On Crave the closing beat was the one *dark* band on a
bright site, because midnight is dark. Here it is the one *lit* band on a dark
site, because a diwan is a lit room with people sat in it.

**THE LOCALE FRAME MOVES FOR THE FIRST TIME.** It survived Li's → Crave
untouched at 108–118 because it was already lit like Crave's rooms. On a black
page a daylight city photograph is now the brightest thing on the site and
reads as a hole. Pulled to 75 — which also *helps* the near-white marker
card's edge, since the card zone's hard floor was always that the sky under it
must not approach the card's own luminance.

---

## 4. The carte

**166 dishes across 19 courses**, generated by `build-carte.mjs` from
`lapranzo-menu.json`. Do not hand-edit `carte.generated.html`.

Courses as the boards print them: Starters, Side Dishes, Pizza, Burgers, Main
Course, Sandwiches, Falafel, Mutton Rice, Chicken Rice, Pasta, Arabic Dishes,
Dessert, Hot Drinks, Frappucino, Ice Coffee, Milkshakes, Fresh Juices,
Slushes, Mojitos.

Burgers are split out of the SANDWICHES tab they are printed under, because
that tab contains only burgers while a second board carries the actual
sandwiches. That split is the only structural change to the boards' own
arrangement.

**THE SOURCE IS PHOTOGRAPHS, NOT AN API.** Crave's carte came off a JSON
endpoint and could not be mistranscribed. These prices were read off twelve
images. They carry a transcription risk an endpoint does not, and re-reading
them before launch is the **first** item on the client list rather than a
line near the bottom of it.

**The boards' own typos are kept** — "Fajta", "Brest", "Mini pancke",
"Frappucino", "Iced Macciato", "Wafal", "white Mocha". They are the client's
wording on the client's menu. Only course headings are normalised, because
those are structural labels rather than the menu's own words.

**ALCOHOL-FREE, AND THE SITE SAYS SO OUT LOUD** — unchanged in substance from
the Crave build, and established the same way: not one of the 166 items is
alcoholic, the thirteen mojitos are mocktails, and there is a "La Pranzo
Mocktail" on the juice board. The FAQ states it plainly rather than staying
silent.

**Seven items are named after the house** — La Pranzo Salad, Chips, Pizza,
Frappucino, Milkshake, Mocktail and Tea lapranzo. The Signatures course is
built from that fact rather than from a guess.

---

## 5. Page by page

Architecture unchanged throughout. Only content, polarity and palette move.

**`index.html`** — hero wordmark **LA PRANZO**, tagline **"Home of Middle
Eastern Cuisine"** (their words, verbatim). The four known-for items become
**Mandi · Mishkaki · Shawarma · *Kunafa***, signature in italic, all four on
the real carte. The showpiece feature becomes the **Mix Grilled Platter** —
a mixed grill has parts the way the duck did, at 1,500 half and 2,500 full.

**`menu.html`** — display pair becomes **"From Mandi" / "to Kunafa"**: 10
glyphs over 9, which is exactly the pair the entrance was measured against, so
the composition needs no re-measure. `.course__note` is new and needs a rule.

**`about.html`** — statement becomes `OPEN / FROM NOON / UNTIL / ELEVEN /
EVERY DAY` (4/8/5/6/9 against a 13-glyph envelope, so more clearance than it
was solved for). Figures become **166 dishes · 19 courses · 11 hours a day ·
7 days a week**; the restaurant count is dropped, because one branch as a
headline figure reads as small.

**`.reunion` → `.diwan`.** الديوان *al-dīwān*: the reception room, the majlis,
the room where guests are received and sat down. It is literally in the
restaurant's own trading name, which is what makes it the right closing beat
rather than a borrowed one — and it is the structural analogue of what 团圆 was
two rebrands ago. The section carries no service claim, as before.

**`contact.html`** — **one branch, so one location band.** `.locale--nairobi`
is deleted, not hidden. `.details` cells become **PHONE** and **INSTAGRAM**
(`@lapranzoke`), which are the two channels that actually exist. The FAQ loses
every branch-difference answer. The vertical mark stays **KARIBU** — Swahili,
still right for a Mombasa room, and already re-solved for Latin metrics.

---

## 6. The mark

**This is the first rebrand here where the logo cannot be faithfully
reconstructed, and saying so is part of the deliverable.**

Crave's mark was a 4-fold symmetric scalloped plaque: one quadrant traced,
mirrored twice, worst segment RMS 0.39px and mean boundary error 0.88px.
La Pranzo's emblem is an **irregular abstract Kufic ring with no symmetry to
exploit**, and the only artwork obtainable is 536×395. A curve fit to that
would be a confident-looking bad trace, which is worse than no trace.

**What the dark ground buys instead**: the artwork's own field is black, which
is now the page. The real logo can be used as a raster with its ground reading
as the sheet — no cutout, no reconstruction, no `verify-mark.mjs` claim that
cannot be honoured. The 16px favicon uses a simplified circular device, since
the ring collapses at that size regardless.

**Vector artwork is the top item on the client list**, above everything except
re-reading the prices.

---

## 7. Still to confirm with the client

Everything on this site is researched from public sources, not
client-confirmed. In priority order:

1. **The prices, and the whole carte.** Read off twelve photographs rather
   than an endpoint. This is the one fact class on the site whose method is
   weaker than the last build's.
2. **Official vector artwork**, and whether the wordmark should be set in the
   logo's own italic serif rather than Cormorant. Every measured type
   invariant here is keyed to Cormorant's metrics.
3. **Whether the number takes WhatsApp.** The reserve CTA says "Opens
   WhatsApp" and links `wa.me/254768818833`. The number is real; WhatsApp on
   it is not verified, and if it is wrong the primary booking CTA is a dead
   end.
4. **The opening hours.** africabz gives 12:00–23:00 daily and Google
   corroborates the noon open. No source contradicts it, but no source is the
   restaurant either.
5. **The alcohol answer.** Read off the menu itself. Do not soften it.
6. **Dietary.** The carte has real vegetarian breadth — falafel, fuul, adas,
   mutabal, hummus, fasuolia, vegetable pizza, grilled vegetables — which is
   countable and is stated. **Vegan, gluten-free and halal are NOT confirmed**
   and the FAQ says so, sending allergies to a phone call.
7. **Whether "Al-Diwan" should appear more prominently.** The site treats
   "La Pranzo" as the mark and the full name as the trading name.
