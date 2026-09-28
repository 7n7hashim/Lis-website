# Li's Chinese Restaurant → Crave — rebrand design

**Date:** 2026-09-28
**Scope:** all four pages, every token, every photograph, the logo, the icon set.
**Architecture:** unchanged. Every pin, rAF loop, 3D entrance, clip path, marquee
and measured layout survives. This is a re-skin and a re-content, not a rebuild —
the same operation the 2026-08-26 Misono → Li's spec describes, run again.

**What makes this one harder than that one:** Misono and Li's were both dark
evening restaurants, so the photographic system carried across untouched. Crave
is a daylight café that opens at six in the morning. **The photography inverts,
and every contrast relationship on the site inverts with it.** That, not the
palette, is the body of the work.

---

## 1. The subject, and what is actually known

**Crave**, Kenya. Two branches. No official website exists. Researched
2026-09-28; every fact below has a source, and anything without one is asserted
nowhere on the site.

| fact | value | source |
|---|---|---|
| Mombasa (the original) | Malindi Road, City Mall, Nyali, Mombasa 80100 | TripAdvisor (claimed listing) + Google |
| Mombasa phone | +254 705 000275 | TripAdvisor + Instagram bio |
| Mombasa hours | **06:00 – 00:00, seven days** | TripAdvisor hours table |
| Mombasa standing | #1 of 212 restaurants in Mombasa · 4.9 (406) · Travellers' Choice 2026 | TripAdvisor |
| Mombasa, Google | 4.8 (1,664 reviews) · Ksh 1,000–3,500 per person | Google listing |
| Nairobi (second) | Ring Road, Kilimani, Zarafa Towers, Ground Floor | TripAdvisor (claimed listing) |
| Nairobi phone | +254 756 600600 | TripAdvisor + Instagram bio |
| Nairobi hours | **06:00 – 01:00, seven days** | TripAdvisor hours table |
| Nairobi standing | #8 of 1,111 restaurants in Nairobi · 4.9 (629) · Travellers' Choice 2026 | TripAdvisor |
| Tagline | **"Satisfying every craving"** | Crave's own digital menu header |
| Cuisine | all-day café: breakfast, brunch, burgers, steaks, curries, seafood, pizza, pasta, a large pastry and dessert counter, specialty coffee | own menu |
| Alcohol | **none. Halal, no pork.** | own menu (no alcohol in 14 drinks categories; "beef macon" throughout) + review sources |
| Services | breakfast, lunch, dinner, brunch, drinks · vegetarian friendly · gluten-free options (Mombasa listing) · parking · cards | TripAdvisor features |
| Socials | IG @crave_kenya · TikTok @crave_kenya · Facebook | own menu's socialMedia block |

**The full carte is real.** 262 items across 38 categories in four menus —
FOOD (15), DESSERTS (8), DRINKS (14), MOMBASA SPECIALS (1) — read from Crave's
own `api.oddmenu.com/place/EN/cravekenya` on 2026-09-28, with every KSh price.
Nothing on `menu.html` is invented.

**Two facts the branches do not share, and both are load-bearing:**

- **MOMBASA SPECIALS is a Mombasa-only menu** — Mutton/Fish/Chicken Mandi,
  Mombasa Biriyani, Swahili Pilau, Chicken Tikka, Lamb Chops, Mutton Kabab.
  Eight dishes that exist at one branch. This is the structural equivalent of
  Li's Mombasa-only private dining, and it is presented the same way: on the
  branch's own card, never as a house claim.
- **The closing times differ** — midnight in Mombasa, 1am in Nairobi. The shared
  reserve block is byte-copied to four pages and therefore states the opening
  hour only, which both branches share.

### Deliberately NOT asserted
- **No founding year for either branch.** None is published. Mombasa is the
  original — Crave's own Facebook announced Kilimani as the "new branch" — and
  the copy says that and stops.
- **No third branch.** Mombasa's own listing text mentions "a second branch not
  far from Fort Jesus". It appears on no other source, the Instagram bio lists
  two locations, and the digital menu says "MOMBASA & NAIROBI". Two branches.
- **No email address anywhere on the site.** `reservations@cravekenya.com`
  appears on `crave-kenya.quickprimetech.com`, which is an agency demo site and
  not Crave's. Crave publishes no email. **`.details` therefore carries two
  phone cells, not a phone and an email** — see §6.
- **No "full bar" and no cocktails.** Google's listing carries a user-contributed
  "Great cocktails" attribute and it is wrong: the Strawberry Mojito is on the
  MOCKTAILS list, and there is no alcohol in the entire drinks menu. The site
  states the house is alcohol-free rather than staying silent, because a guest
  who turns up expecting wine has been misled by omission.
- **No drive times or distances** on the location cards, unchanged.
- **No claim that either number takes WhatsApp** until it is confirmed — see §9.

---

## 2. The logo

The only artwork obtainable is the 320×320 JPEG Crave uses on its own digital
menu: **a white `CRAVE` in a scalloped cartouche, on an opaque black square.**
Measured — ground `#000000`, mark `#FBFBFB`, **zero chroma in either.** It is a
genuinely monochrome identity, which is the single most useful thing about it.

At 320px it cannot be a hero wordmark, so the mark was **redrawn as SVG**
(`brand_assets/crave-mark.svg`, `make-cartouche-path.mjs`, verified by
`verify-mark.mjs`). Four things about the method:

- **The plaque is five lobes across its top** — tip-lobe, shoulder, crown,
  shoulder, tip-lobe — and **two of them are genuine measured flats**, 13% and
  5% of the half-width. An evenly-spaced anchor set rounds both off and the mark
  stops reading as a scalloped cartouche at all. Anchors are placed at the
  structural points, not at even intervals.
- **One quadrant is traced and mirrored twice.** The mark is 4-fold symmetric;
  folding all four quadrants onto one profile before fitting is what makes a
  lopsided result impossible, which a whole-outline trace of a 320px JPEG does
  not. Worst segment RMS **0.39px** at the source's own resolution.
- **The apex and the tips are extrema, so their tangents follow from that** —
  horizontal at the crown, vertical at the tips. A central difference
  underestimates both, because the curve turns inside one sample, and the fit
  then overshoots the point it is turning around: the first emit put a control
  point at u=1.02 and doubled the outline back over its own tip.
- **The stroke must be swept by RE-EMITTING the path.** The emitted path is the
  stroke's centreline and its inset is a function of the stroke, so the two move
  together. A sweep that varied only the `stroke-width` attribute on an
  already-emitted path reported an optimum at 4.6 which measured 1.97px once it
  was actually generated. Swept properly: 2.86px at 4.2, **minimum 0.88px at
  5.2**, 0.91px at 5.4.

**Measure the boundary, not the filled area.** Filled-area IoU reported a
confident 55% — because the official tile carries the `CRAVE` lettering inside
the plaque and the mark file deliberately does not, so a third of the
"disagreement" was the lettering being correctly absent. `verify-mark.mjs`
compares the two outer boundaries and reports **mean 0.88px over 906 samples**.
Its worst case, 21px at `lef[91]`, is a **sampling artefact and not an error**:
that row cuts the shoulder flat, where the boundary is near-horizontal and a
sub-pixel vertical difference moves the leftmost-ink column by tens of pixels.

**The mark is the plaque, and `CRAVE` is set as type beside it.** The file
carries no lettering, which is what lets it take `currentColor` and work at any
size. The hero keeps the arrangement Li's had: device top-left, wordmark as type.

**The wordmark is Cormorant, and that is a known compromise.** The logo's own
lettering is a transitional serif with prominent bracketed serifs and moderate
stroke contrast; Cormorant is lighter and more calligraphic. Every measured type
invariant on this site is keyed to Cormorant's metrics — the contact hero's cap
height, the locale bands' `4.1 × --lu`, the reserve column's 48.1u, the about
statement's 51.1u block, the `size-adjust: 86.8%` fallback — and swapping the
display face means re-solving all of them. **Flagged for the client** (§9), not
silently accepted as a match.

**The mark is a reconstruction.** Verify against official artwork before launch.
`brand_assets/lis-mark*.svg` and the Li's logo are superseded.

---

## 3. Palette — re-derived, never carried across

Ground moves warm ivory → **near-white**. Every token re-solved against it.

The logo is black and white with zero chroma, and the room behind it is a bright
daylight café. So the site is **a white sheet with black plaques on it**, and the
food is the only colour on the page. That is the thesis, and it is also why the
palette is short: one accent, used sparingly.

| token | value | ratio on ground | role |
|---|---|---|---|
| `--ground` | `#FBFAF7` | — | near-white, the faintest warm cast, from the room's own neutrals |
| `--ink` | `#0E0E0C` | **18.51:1** | display type — **and the black plaque fields**, which is new |
| `--menu-ink` | `#0E0E0C` | 18.51:1 | display type (same value; the role name is kept — see below) |
| `--menu-body` | `#57534C` | **7.32:1** | body |
| `--menu-accent` | `#2A6B41` | **6.14:1** | the botanical green — eyebrows, rules, links. White on it 6.14:1 |
| `--crave-green` | `#2A6B41` | 6.14:1 | same value, the FILL/focus role (renamed from `--li-red`) |
| `--brand-green` | `#009E2F` | 3.39:1 | **Crave's own chosen green. Device only — never type** |
| `--res-gold` | `#7A6A48` | **5.05:1** | non-text boundary, and small utility type |
| `--res-hair` | `#D8CFBC` | 1.48:1 | decorative only, no minimum applies |
| `--on-dark-accent` | `#8FCFA3` | **10.69:1 on `--ink`** | the accent's dark-field form |

**THE ONE RULE THIS RE-SKIN TURNS ON — and it is the exact inverse of the last
one.** Li's rule was *red is a light-ground colour*. Here: **green is a
light-ground colour at `#2A6B41` (6.14:1 on the ground, 3.02:1 on the ink) and a
dark-ground colour at `#009E2F` (3.39:1 on the ground, 5.46:1 on the ink).** The
two greens are not interchangeable and neither one works on both fields.
Anything that has to be read on a black plaque takes `#8FCFA3`, `--res-hair` or
the ground itself.

`--brand-green #009E2F` is the colour Crave picked for its own digital menu. It
clears the 3:1 non-text floor on the ground and fails AA for text. It colours the
mark and nothing else — the exact role `--brand-red` held.

**The old token NAMES are kept as the values move**, for the reason the last
rebrand recorded: there are 256 `var()` call sites across four pages for the
role tokens alone, and renaming them to move a palette is how a rebrand breaks a
layout. `--menu-*` and `--res-*` no longer describe a menu or a reservation —
they are the site's ink / body / accent / boundary / hairline roles.
`--li-red` is the one that *is* renamed, to `--crave-green`, because it carried
the old brand's name. `--brand-red` is deleted: `grep -c 'var(--brand-red)'`
returns **0** across all four pages, exactly as `--ember` did before it. **Do
not reintroduce a token on the strength of a note — check whether it is read.**

`--cream #FCF8F5` keeps its role unchanged: not a colour, but the hinge the
three ground-adaptation blocks turn.

Type is **Cormorant Garamond** (display, 300/400) with **Jost** (utility,
300/400), unchanged — see §2 for why, and §9 for the flag.
**No Chinese or Japanese glyphs anywhere.** `contact.html`'s vertical stack is
covered in §6.

---

## 4. The photography — the inversion

**This is the body of the work.** Crave's own header photograph measures **mean
luminance 130.9 of 255**, with its dominant colours a warm sand and greige
family (`#c9b397`, `#c5b7a8`, `#b69977`, `#c8c8c6`). Li's hero band is 44–57.

Every band moves, and the site's type-over-photograph contrast flips from
white-on-dark to **dark-on-light** in the two places it exists.

    band            Li's      Crave     note
    hero            44-57      138      bright room, type over it
    reserve           64       150      a laid table in daylight
    about opening     71       140
    about plate       37       120      full bleed, nothing on it
    chapters       62-84       145
    experience    90-108       160      lit rooms and white plates
    midnight       64-96        95      the ONE dark band, and it is earned - see below
    contact hero      60       135      still no baked vignette
    locale       108-118   108-118      UNCHANGED - daylight aerials, already right
    gallery tiles   ~112       130      food on a light ground

**The locale band does not move, and that is the useful finding.** Those two
frames are open-air daylight city photographs and were already the one band on
the site lit like Crave's rooms. They are kept as-is, including the card-zone
floor `bake-contact-locations.py` reports (Mombasa 151/86, Nairobi 165/54).

**`body { background: var(--ink) }` behind the two full-viewport photographs
must become the ground.** It is `--ink` today for a stated reason: a failed hero
image then leaves white type on black rather than white type on ivory. Invert the
photography without inverting this and a failed image leaves **dark type on
black** — invisible. The reason survives the inversion; the value does not.

**The midnight band is the one dark section, and it is earned rather than
inherited.** The `.reunion` section (§5) is about the last hour of the day, so a
dark frame there is what the content is about. Every other dark band on this site
was dark because the old restaurant was; this one is dark because midnight is.

**A bright photograph is a harder ground for type than a dark one, not an
easier one.** A dark frame's failure mode is a lit highlight under white type;
a bright frame's is a blown highlight under dark type, and blown highlights are
at 255 where a lamp is at 250 — there is no headroom left to grade back. The
worst-12px-tile instrument is unchanged and still the right one; only the
direction of the test flips. `shoot-hero-mobile.mjs` and `shoot-contact.mjs`
report painted luminance and therefore need no change, but **every floor in
CLAUDE.md's hero section is re-solved from scratch, not adjusted.**

Every photograph remains a **Pexels placeholder flagged as one in the markup**,
matched dish by dish to dishes actually on Crave's carte. Two constraints carry
over unchanged: the location photographs still are not the places, and the
`.dish` cutout still has to be checked against the ground it will sit on.

---

## 5. Section map

Every section keeps its geometry, its motion and its tooling. Only content moves.

**The spine of the site is a day.** Crave opens at six in the morning and closes
at midnight, and its own menu is organised by the hour — Breakfast 6AM–12PM,
Brunch 11AM–2PM, then all day. Nothing on the site it replaces expresses that,
and it is the most characteristic thing about this subject. So the structural
device is the clock: the homepage opens at six, `about.html` runs through the
day, and the page's closing beat is midnight.

### `index.html`
| slot | was | becomes |
|---|---|---|
| hero wordmark | `LI'S` | `CRAVE` |
| hero tagline | The Art of the Chinese Table | **Satisfying every craving** (their own line) |
| hero photograph | dark wok kitchen | bright café interior, **dark type** |
| wok section | From the Wok | **From Six in the Morning** — the all-day idea |
| `#beyond` marquee | 9 Chinese dishes | 9 Crave dishes off the real carte |
| the feature | Peking Duck, turning plate | **the Seafood Platter** (KSh 9,500; Google's first "Popular" item; and the dish that carries the coast-to-capital story) |
| `#reserve` | unchanged geometry | new copy, two numbers, no email |

### `menu.html`
The carte becomes **four menus, 38 categories, 262 items** with real prices.
Signatures become C3 Loaded Fries, the Seafood Platter, Lobster Thermidor and the
freakshake wall. The three dedicated opening frames are re-shot bright.

### `about.html`
| # | section | becomes |
|---|---|---|
| 1 | opening | a bright full-viewport frame |
| 2 | statement | **OPEN / FROM SIX / UNTIL / MIDNIGHT / EVERY DAY** — five authored lines, as the composition requires, and every word of it sourced |
| 3 | plate | unchanged geometry, bright frame |
| 4 | figures | **2 restaurants · 262 dishes · 18 hours a day · 7 days a week** — all four counted off the real carte and the published hours |
| 5 | chapters | I six in the morning · II the coast (seafood from Mombasa) · III the pastry counter · IV the table, late |
| 6 | experience | the coffee, the grill, the dessert counter |
| 7 | `.reunion` | **midnight** — the last hour. Keeps its two-plate perspective box, its landscape front plate and its no-service-claim rule |

### `contact.html`
Seven sections unchanged in geometry. The two location bands take City Mall Nyali
and Zarafa Towers. The FAQ is rewritten to eight questions, and three of its
answers change *position*, not just wording: alcohol (none), reservations, and
the Mombasa-only menu.

**`.details` carries TWO PHONE CELLS, not a phone and an email.** Crave publishes
no email address. The cell that held Email holds **Mombasa**, and the cell that
held Reservations holds **Nairobi**. This also retires the 45-character email
that was a documented layout constraint — a Kenyan number is 13 characters and
the `overflow-wrap` rule that existed for the email is left in place but is no
longer load-bearing. **`verify-touch.mjs`'s `email-slack` check must be renamed
or it asserts against a string that is gone.**

**The vertical Chinese stack is replaced with vertical Latin — `KARIBU`.** The
`white-space: nowrap` requirement is unchanged and still silent when broken.
`text-orientation: upright` is required, or Latin glyphs rotate rather than stack.

---

## 6. The carte

262 items. Item names and prices are reproduced verbatim; the descriptions on
Crave's own menu are set in **mathematical-bold Unicode** (𝐓𝐰𝐨 𝐬𝐥𝐢𝐜𝐞𝐬) and are
normalised through `NFKC` before they reach the page — those codepoints are
styling smuggled into text, they break screen readers and search, and they are
not a typeface.

Prices move. **Re-read before launch.**

---

## 7. The icon set

Re-baked from the new mark. The two-drawings rule is unchanged and the reasoning
transfers exactly: at 16px the full plaque's 5.2/100 stroke lands at 0.83px and
the lettering at well under a pixel.

- **Small** (`favicon.svg`, 16, 32): the plaque alone, stroke thickened to
  10.6/100, no lettering.
- **Large** (apple-touch 180, 192, 512): plaque and lettering, inset to 78%.
- **Both sit on the logo's own opaque black**, with the plaque in the ground
  colour — which is the real artwork's polarity, and the one case on this site
  where a black tile is correct rather than a carried-over habit.

---

## 8. Verification

Unchanged, and all of it must be re-run. `layout-snapshot.json` is **re-saved
deliberately** at the end of this work, because the layout changes are intended —
and that re-save is recorded here so it is not mistaken later for a red run made
green.

---

## 9. Still to confirm with the client

Everything is researched from public sources, not client-confirmed.

- **Whether either number takes WhatsApp.** The reserve CTA on four pages says
  "Opens WhatsApp". Both numbers are real; WhatsApp on them is not verified, and
  if it is wrong the primary CTA is a dead end.
- **The hours.** TripAdvisor's claimed listings say 06:00–00:00 (Mombasa) and
  06:00–01:00 (Nairobi), seven days; Crave's own menu corroborates the six
  o'clock open with a Breakfast 6AM–12PM section. **eatout.co.ke says
  07:00–22:00**, which contradicts both. The site uses TripAdvisor's.
- **An email address**, if one exists. None is published.
- **Official vector artwork**, and whether the wordmark should be set in the
  logo's own transitional serif rather than Cormorant (§2).
- **Whether the Fort Jesus branch exists.** Mentioned once, in Mombasa's own
  listing text, and nowhere else.
- **Gluten-free.** Listed as a feature on Mombasa's listing only. The FAQ says
  Mombasa lists it and Nairobi does not, and sends allergies to a phone call.
- **The prices.** Real as of 2026-09-28, but a menu moves.
