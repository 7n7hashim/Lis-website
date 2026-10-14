# CLAUDE.md — Frontend Website Rules

## Project: La Pranzo
A Middle Eastern grill and cafe in Mombasa. **Rebranded from Crave on 2026-09-30**,
which had been rebranded from Li's Chinese Restaurant on 2026-09-28, which had been
rebranded from Misono on 2026-08-26 — the architecture was kept all three times and
everything else was replaced.
Spec: `docs/superpowers/specs/2026-09-30-lapranzo-rebrand-design.md`.

**Every fact on this site is researched, not invented, and is listed with its source in
that spec.** Read 2026-09-30 from its Google listing, its own Odoo site
(`la-pranzo-al-diwan.odoo.com`, linked from its Instagram bio), its Instagram bio, and
the africabz directory.

| | |
|---|---|
| Trading name | **La Pranzo & Al-Diwan**. Known everywhere as **La Pranzo** |
| Strapline | **"Fast Food & Cafe"** — off its own logo |
| Tagline | **"Home of Middle Eastern Cuisine"** — its Instagram bio, verbatim |
| One branch | Haile Selassie Rd, **next to Ola petrol station**, Mombasa 80100 · in United Meat Supplies |
| Phone | **+254 768 818833** — the same number on all three sources |
| Hours | **12:00–23:00, daily.** It does not close on any day |
| Standing | Google **4.7 (323)** · Ksh 500–2,500pp · IG @lapranzoke, 13.6K |
| Alcohol | **NONE. See the rule below** |
| Email | **none published.** See the rule below |
| Socials | **Instagram only.** No TikTok, no Facebook — see below |

**The carte on `menu.html` is REAL and GENERATED** — 166 dishes across 19 courses with
La Pranzo's own KSh prices. `build-carte.mjs` writes the grid from `lapranzo-menu.json`
and `apply-carte.mjs` splices it into the page; **do not hand-edit it**, an edit is lost
on the next run.

**THE CARTE'S SOURCE IS PHOTOGRAPHS, NOT AN API, AND THAT IS THE ONE PLACE THIS BUILD IS
WEAKER THAN THE LAST.** Crave's carte came off a JSON endpoint and could not be
mistranscribed. These 166 prices were read off twelve menu-board images. They are sound,
but they carry a transcription risk an endpoint does not, and **re-reading them is the
first item on the client list rather than a line near the bottom of it.**

**THE BOARDS' OWN TYPOS ARE KEPT** — "Fajta", "Brest", "Mini pancke", "Frappucino",
"Iced Macciato", "Wafal", "white Mocha". They are the client's wording on the client's
menu, and a site that silently corrects a menu starts disagreeing with the room it
describes. Only course HEADINGS are normalised.

**LA PRANZO IS ALCOHOL-FREE AND THE SITE SAYS SO OUT LOUD.** Not one of the 166 items is
alcoholic; the thirteen **mojitos are mocktails** and so is everything on the juice
board, including the one called a Cocktail Juice. The FAQ states it plainly rather than
staying silent, because a guest who turns up expecting wine has been misled by omission.

**THERE IS NO EMAIL ADDRESS ANYWHERE ON THE SITE, for the third rebrand running.** None
is published. `.details` on `contact.html` therefore carries **PHONE and INSTAGRAM** —
the two channels that actually exist. That is the third arrangement those two cells have
held; see the comment above them.

**ONE SOCIAL ACCOUNT, AND IT IS RESEARCH RATHER THAN A LAYOUT CHOICE.** Li's ran three,
Crave ran three. La Pranzo's Google listing shows a single profile and it is Instagram;
the Facebook result in search is a post *about* the restaurant from somebody else's
account, and the TikTok results are discover pages rather than an account. Three icons
in the hero would be two inventions.

**NEVER ASSERTED, and each for a reason:** no founding year (none published); **no
second branch** (every source gives one address); **no halal claim** — the carte is
consistent with one and carries no pork, but no source states it, and the FAQ says
exactly that and sends the question to a phone call; no seat count, no private room, no
capacity; no delivery; no dish that is not on the real carte.

### The ground
**The whole site is on a near-black, `--ground #0D0C0A`.** This is the first rebrand here
that MOVED the ground rather than re-pointing it, and three independent things demanded
it: the logo's own field is black, the menu artwork is black, and the room trades noon to
eleven at night.

**THE ONE RULE THE WHOLE RE-SKIN TURNS ON.** Li's rule was *red is a light-ground
colour*. Crave's was *two greens and neither works on both grounds*. This one is simpler
and stricter:

> **`#FFCA2A` is a dark-ground colour and nothing else.**
> **12.79:1 on `--ground`. 1.43:1 on a near-white field.**

**THE SITE HAS EXACTLY ONE LIGHT FIELD LEFT, and it is where this bit.** The locale
band's marker cards are near-white plates laid over a photograph, written as a literal
(`rgba(252,251,249,0.94)`) rather than as a token — so they did NOT move with the ground,
and the token flip that took every ink on the site to near-white left **white type on a
white card and a heading that vanished outright**. Every colour inside that box is now
measured against the CARD: title `--ground` 18.91:1, eyebrow `--lp-amber` 5.91:1, note
`#55504A` 7.71:1. **When a ground inverts, the things that did NOT invert are the bugs.**

### The plaque retires
Crave's black plaques existed to carry a black-field logo onto a white page. **On a black
page the logo is native and the plaque has no job**, so the device is retired rather than
inverted — an ivory plaque on black is not the same object, it is a hole.

What replaces it is already published: every heading on La Pranzo's own menu boards is
**black type inside a solid `#FFCA2A` block**. That is the site's section marker now, at
12.79:1, and it is the brand's device rather than an invention.

### Design tokens
**All re-derived against the near-black on 2026-09-30** — none carried across, which is
the standing rule.

| token | value | ratio on the ground | Crave's | note |
|---|---|---|---|---|
| `--ground` | `#0D0C0A` | — | `#FBFAF7` | near-black, faintest warm cast |
| `--ink` | `#F8F7F3` | 18.24:1 | 18.51 | display type |
| `--menu-ink` | `#F8F7F3` | 18.24:1 | 18.51 | same value |
| `--menu-body` | `#A79F91` | 7.46:1 | 7.32 | body |
| `--menu-accent` | `#FFCA2A` | 12.79:1 | 6.14 | eyebrows, rules, links |
| `--brand-yellow` | `#FFCA2A` | 12.79:1 | — | the device role |
| `--lp-yellow` | `#FFCA2A` | 12.79:1 | — | focus ring, the location pill's fill |
| `--res-gold` | `#9A8654` | 5.50:1 | 5.05 | non-text boundary, small utility type |
| `--res-hair` | `#2E2A22` | 1.37:1 | 1.48 | decorative only, no minimum applies |
| `--lp-amber` | `#7A5E0E` | 3.20:1 | — | **light-field escape only.** 5.91:1 on the card |

**Every role lands within 0.5 of its Crave counterpart except the accent, which doubles.**
That is what made this affordable: the site's measured contrast invariants transferred as
a polarity flip rather than a re-solve of every floor.

**`#FFCA2A` IS MEASURED, NOT CHOSEN** — the exact modal colour of three independent menu
boards, 11–17% of every frame.

**TWO TOKEN NAMES, ONE VALUE, AND THAT IS THE FINDING.** The last two brands each needed
two colours: a device hue that failed AA for text, and a darkened version that carried
type and fills. `#FFCA2A` clears 12.79:1 here, so for the first time the device colour
and the text colour are the same colour. The names stay apart because the ROLES are still
two and the next brand may need two values again.

**A fill made of the accent is a LIGHT field however dark the page is.** Type on the
locale pill and on `about.html`'s `.ex-card__badge` takes `--ground`, never `--ink`.
Both were `#fff` or `--ink` on the old green and both had to be flipped by hand.

**The old token NAMES were kept as the values moved**, because there are hundreds of
`var()` call sites across four pages and renaming them to move a palette is how a rebrand
breaks a layout. `--menu-*` and `--res-*` therefore describe the site's ink / body /
accent / boundary / hairline ROLES, not a menu or a reservation. `--crave-green` was
renamed to `--lp-yellow` and `--brand-green` to `--brand-yellow`, because both carried the
old brand's name. The chain is `--misono-indigo` → `--li-red` → `--crave-green` →
`--lp-yellow`.

A token that is used but not defined **fails silently**, and it has happened three times
on this project. When a page starts using a token role it has not used before, check
`:root` actually carries it. `verify-locale.mjs` checks every `var()` in `contact.html`
against `:root`.

**The same class of failure, in another form: `perspective` is inherited by nobody.** It
applies to an element's **direct children** and stops, so a `translateZ` on a grandchild
has no camera. Nothing errors and it does not look broken — it looks like a decision.

`--cream #0F0E0B` **appears nowhere on any page as a colour.** It is the name the
transplanted section CSS uses for "my ground", and re-pointing that one property is what
moves those sections onto the site's ground without editing them. Do not reach for it as a
colour, and do not delete it — it is the hinge all three adaptation blocks turn.

Type is **Cormorant Garamond** (display, 300/400) with **Jost** (utility, 300/400).
Never pair anything else without being asked. **No CJK anywhere** — `contact.html`'s
vertical mark is KARIBU, Swahili, set in Cormorant.

**THE WORDMARK IS CORMORANT AND THAT IS A KNOWN COMPROMISE, not a match.** La Pranzo's
logo letters are an italic transitional serif. Every measured type invariant on this site
is keyed to Cormorant's metrics — the hero wordmark's 3.4vw/0.18em lockup, the contact
hero's cap height, the locale bands' `4.1 × --lu`, the reserve column's 48.1u, the
statement's 51.1u block, the `size-adjust: 86.8%` fallback — so swapping the display face
means re-solving all of them.

### Pages
- **`index.html`** — the homepage. Full-viewport photographic hero, then the known-for
  section, a sharing section (`#beyond`), the Mix Grilled Platter feature, reservations
  (`#reserve`), and the closing footer nav.

  **THE PHOTOGRAPH AND THE TYPE'S POLARITY BOTH CHANGED AGAIN ON 2026-09-30.** The hero
  is a dark dining room and the type over it is **white**, as it was for Li's and Misono.
  The frame, its 1.60:1 aspect and the whole portrait-crop apparatus are unchanged; every
  LUMINANCE was re-solved.

  **A DARK FRAME IS THE EASIER GROUND, and that is the one thing this inversion makes
  simpler.** A bright frame's worst case under dark type is a blown highlight at 255,
  which has no headroom in it at all; a dark frame's is a lamp at 250, which a grade can
  pull back. The worst-12px-tile instrument is unchanged — only the direction flips.

  **THE HERO AND THE COUNTER FRAME WERE REPLACED AGAIN ON 2026-10-01, FOR ACCURACY
  RATHER THAN FOR CONTRAST.** The first pair graded correctly and described the wrong
  business: a dark dining room with red leather banquettes and crystal glassware, and a
  second dining room behind it. La Pranzo's own logo says **Fast Food & Cafe**, Google
  reports **Ksh 500–2,500 a head**, and its own photographs show plain wooden tables, a
  chalkboard drinks wall and shared trays of mandi. **A placeholder that flatters the
  client into a different price bracket is not a placeholder, it is a misrepresentation,
  and it is the kind a guest can check by walking in.** The hero is now a warm casual
  room with wicker pendants, plants and people lingering; the counter frame is a
  **shawarma spit**, which is the most accurate single object this kitchen owns and sits
  dead centre of the stadium's full-height middle.

  **THREE CANDIDATES ACROSS TWO PAGES HAVE NOW BEEN REJECTED FOR CARRYING SOMEBODY
  ELSE'S BRANDING, AND ONE SHIPPED FOR A DAY BEFORE IT WAS CAUGHT** (contact.html's
  hero — see that page's note). This is a content test rather than a photometric one and
  **no tool here performs it**: read what is written inside a frame before grading it. Pexels
  1787141 is a chalkboard-menu cafe and the closest match to the real room of anything
  found — but the board carries another business's NAME and a legible price list that is
  not La Pranzo's. 33233564 has Lavazza and Nutella packaging in shot. **Look at what is
  written inside a frame before grading it.**

  Measured at 390x844, worst 12px tile, against floors of 3 / 4.5 / 3 / 3:
  **name 7.13 · tagline 5.18 · social 5.52 · mark 7.74.**
  The tagline is the binding number now at 5.18 against 4.5. **The MARK was the
  binding number on both of the two frames before this and it FAILED outright on one of
  them at 2.32:1** — the room was warm and casual and correct, and it had a pale wall
  in the top-left corner where the mark sits. The mark's corner is the second thing to
  check on any hero candidate, right after the wordmark band.

  **`shoot-hero-mobile.mjs`'s INK CONSTANT HAS NOW BEEN WRONG TWICE, in both directions.**
  It hardcoded white until 2026-09-28, was flipped dark for Crave, and is white again. The
  symptom is identical each time: the tool reports the WRONG KIND of bed as a triumph.
  Left dark against this hero it would pass a black-floor crop at 18:1 and fail the one
  that ships. **A contrast tool whose ink does not match the page's ink is not measuring
  the page.** The tagline and icons are given as COMPOSITES over a REPRESENTATIVE BED, and
  that figure flips with the photography too — it was 250 for a daylight room and is 62 now.

  **`shoot-hero-mobile.mjs` DEFAULTS TO PORT 3000, WHICH IS A DIFFERENT PROJECT ON THIS
  MACHINE.** Run it as `PORT=3001 node shoot-hero-mobile.mjs`. Pointed at 3000 it loads
  somebody else's site, finds no `.hero__img`, and dies with a null dereference that
  reads like a broken page. Other projects also hold 3002. **Check the served `<title>`
  before trusting any screenshot.**

  **THE WORDMARK WAS RE-SOLVED FOR NINE GLYPHS.** `LA PRANZO` is two words and nine caps
  against `CRAVE`'s five; measured, its ink is 6.80x the font-size where CRAVE's was 5.70.
  **The lockup is the rule, not the size** — the composition is built on the wordmark's
  ink matching the TAGLINE's, and the tagline changed too (246.7px → 338.8px at 1440).
  3.40vw at 0.18em puts the ink at 333.3px against 338.8, a lockup of 0.984. Tracking
  steps down with glyph count: 0.29 (four narrow) → 0.22 (five wide) → 0.18 (nine with a
  word space). The minimum is set by 320px, not by taste, and `.hero` CLIPS rather than
  scrolling — which is why it breaks invisibly.

  **THE CLOSING WORDMARK WAS RE-SOLVED TOO, and every term scaled by the same 0.610.**
  `LA PRANZO`'s ink is 6.731x the font-size against CRAVE's 4.10, so at the inherited size
  it ran to 150.8% of the viewport. Scaling only the middle term would have held 92% at
  1440 and left the mark at 94.7% of a 2560 — a cap that had stopped capping. Measured
  after: 91.9% at 1440/1280/1000, 57.7% at 2560, 92.4% on a phone. `measure-endmark.mjs`
  is the tool and it was run before and after.

  **CHECK THE SOURCE ASPECT BEFORE SWEEPING A CROP ANCHOR.** A sweep of `ax` over one
  candidate returned BYTE-IDENTICAL numbers at every value — the sweep signature this
  file already warns about twice. It was neither the design nor a malformed value: the
  source was PORTRAIT (1200x1800) against a 1.60:1 target, so the crop took the full
  width and had no horizontal slack to move in. On a portrait source `ay` is the live
  knob and `ax` does nothing. That frame was dropped anyway — cropping it to this slot
  throws away 58% of its height and upscales 1200 → 1717 on the largest image the site
  serves. **The hero needs a LANDSCAPE source**; Pexels takes `?orientation=landscape`.

  Everything else about the portrait crop is unchanged and still load-bearing — the
  percentage anchor being aspect-stable, the crop being a balance rather than a maximum,
  sampling the bed with the TYPE hidden rather than the block, candidates carrying their
  unit, and the two bed declarations where the phone override governs below 640px.
  **Identical numbers across a sweep mean the instrument, not the design.**

- **`menu.html`** — the menu page. Four portrait photographs floating around a centred
  heading, then the carte, then the reservation section and the closing wordmark.

  The display pair is **"From Mandi" / "to Kunafa"** — 10 glyphs over 9, which is
  **exactly the pair the entrance was last measured against**, and the one reason this
  heading could change without re-shooting the composition. It is a span rather than a
  slogan: the carte really does run from a Yemeni rice dish to a Levantine dessert.

  `.course__note` is new — three courses carry a line the board itself prints under the
  heading ("Medium and large", "Every meal is served with side of your choice", "Every
  one of these is non-alcoholic").

  Everything about the 3D entrance is unchanged and still load-bearing: depth is a
  `perspective` PROPERTY on three parents rather than a function inside each transform;
  `perspective` reaches direct children only; `.flavors__field`'s perspective-origin is
  the window centre; and the overshoot is not `y2`. Spec at
  `docs/superpowers/specs/2026-08-17-menu-flavors-entrance-design.md`.

- **`about.html`** — seven sections, then the transplanted reserve and ending blocks:
  the **opening** (a cook working a counter — the making rather than the made), the
  **statement** (`OPEN / FROM NOON / UNTIL / ELEVEN / EVERY DAY`), the **plate** (the
  mandi platter, full bleed, nothing on it), the **figures**, the **chapters**, the
  **experience**, and the **diwan**.

  **THE STATEMENT CARRIES A CLOSING HOUR AGAIN, and what changed is the branch count
  rather than the confidence.** Crave's two rooms shut at different times, so a five-line
  statement could not name one without misstating the other. One room closes at one hour.

  **The figures are 166 dishes · 19 courses · 11 hours a day · 7 days a week.** All four
  are counted off the real boards. The restaurant count was dropped: one branch as a
  headline figure reads as small.

  **`.reunion` → `.diwan`, and this is the first time the closing beat has come from the
  restaurant's OWN NAME.** 团圆 *tuányúan* was Li's and Crave inherited the section as a
  rewrite; **الديوان** *al-dīwān* is the reception room — the majlis, the long seated room
  a household receives guests in — and **La Pranzo & Al-Diwan** is the name over the door.
  The page had a closing concept waiting in the sign.

  **It is also the ONE LIT BAND on the site, and that is the exact inverse of the rule it
  replaces.** On the bright build this section was the one DARK frame, earned because
  midnight is dark. The site is dark throughout now, so a dark closing beat would say
  nothing; a diwan is a lit room with people sitting in it, and that is what earns 130
  against the 55–80 everywhere else.

  Everything about the chapters and experience sections' motion is unchanged and still
  load-bearing — one rAF loop, one number per element, `--ch-u` as `min(1vw, 1.62svh)`,
  the SVG dash expressed in the stage's own width, every `--at` measured rather than
  derived from x, the scale unit solved against a *measured* block height, and reduced
  motion putting every derived property back by name. Specs at
  `docs/superpowers/specs/2026-08-13-about-chapters-design.md` and
  `2026-08-13-about-experience-design.md`.

  `screenshot.mjs` cannot capture the chapters, the experience or the diwan; use
  `shoot-chapters.mjs`, `shoot-experience.mjs`, or scroll to the section for real.

- **`contact.html`** — **seven sections now, not eight**: a full-viewport photographic
  hero, `.touch`, `.details`, **ONE** location band, the FAQ (eight questions), and the
  transplanted reserve and ending blocks.

  **ONE BRANCH, SO ONE BAND. `.locale--nairobi` IS DELETED, not hidden** — the section,
  its six mirror rules and its policy entry. Six dead rules that match nothing cost
  nothing to run and everything to read; the next person through the file would spend ten
  minutes looking for the second band. The component itself is untouched and would take a
  second instance again.

  **`.details` IS PHONE AND INSTAGRAM**, the third arrangement those cells have held. They
  were Reservations and Email; then two branch phones when Crave turned out to publish no
  email; now the channel you call and the channel you message. Neither string is near the
  width that used to break this block — fifteen characters and eleven.

  The FAQ gained **"Is the food halal?"**, which replaces Crave's branch-difference
  question. It says plainly that no certification is published, that the carte is
  consistent with one and carries no pork, that this is an observation about a menu rather
  than a statement from the restaurant, and to call.

  **THE HERO PHOTOGRAPH WAS REPLACED 2026-10-01, FOR CONTENT, AND IT TOOK THE PAGE'S
  CONTRAST RULE WITH IT.** The frame was a third-wave specialty coffee bar whose menu
  board was fully legible in shot: ESPRESSO / AMERICANO / CORTADO / FLAT WHITE with
  prices in a currency that is not the shilling, over a BREW BAR list reading Moccamaster,
  Origami, Hario V60, Aeropress, Chemex, Kalita Wave. **Another business's price list, at
  full size, on the page a guest comes to for La Pranzo's phone number.** It graded
  cleanly and measured 10.58:1 on the eyebrow, which is why nothing here caught it: no
  tool in this project reads what is WRITTEN inside a frame. It is now Arabic coffee
  poured from a dallah — the gesture the heading already names, and the conventional act
  of receiving a guest on this coast rather than a generic one.

  **THE HEADING SETS THE CONTRAST FLOOR NOW, AND IT USED TO BE THE EYEBROW.** That
  reversal is the finding, and it follows from the frame's core rather than from the
  type. On a dark-core frame the heading had ~16:1 where it needs 3:1 and never bound,
  while `--res-hair` at 12.4px ran out first against 4.5:1. The new frame is a LIT core —
  a man in a white shirt, centre-lit — and the heading crosses the shirt and the pot. At
  the inherited bed its worst 12px tile measured **3.01:1 against a 3:1 floor**, and the
  eyebrow 4.69 against 4.5. **Both were green on `shoot-contact.mjs`, which reports the
  band MEAN (77.8) — a mean is exactly what hides a white shirt behind one word.**

  **`.hero__bed` IS A FUNCTION OF THE FRAME'S CENTRE, and that is how it was re-solved.**
  about.html's opening measures 117 at the centre and carries 0.60/0.42; this slot's old
  frame measured 41 and carried 0.24/0.14. The new one measures 112.2, so the bed goes
  back to about.html's order of magnitude: **0.54/0.36**, a shade lighter because 112.2 is
  a shade darker than 117. Swept with the type hidden, worst tile, heading / eyebrow:
  0.24/0.14 → 3.07 / 4.76 · 0.38/0.24 → 3.93 / 6.15 · 0.46/0.30 → 4.52 / 7.06 ·
  **0.54/0.36 → 5.26 / 8.11** · 0.60/0.42 → 6.11 / 9.16. The heavier bed clears by more
  and was not taken: the pour is the subject and it sits directly under the type.

  Everything else is unchanged and still load-bearing: cap height is the type invariant
  rather than ink width (measured 2.71% at 1440, 2.73% at 1280 against a 2.70% target);
  `--lu` deliberately has no `svh` clamp; the section is inset 7.18% to match its
  neighbours rather than the comp; `perspective` is per-element and does two opposite jobs;
  `.touch` + `.details` fit one desktop screen together and that is an assertion in
  `verify-touch.mjs` rather than something to re-check by eye; the eyebrow rather than the
  heading sets the contrast floor; a field's underline is a UI component boundary under
  WCAG 1.4.11 and takes `--res-gold`; and ordering matters — an override placed *above*
  the base rules loses at equal specificity.

### The reservation section
Rebuilt 2026-08-15 against `assets/img/inspooooo.png`. Spec at
`docs/superpowers/specs/2026-08-15-reservation-redesign-design.md`.

Unchanged in structure. The gourd `clipPath` in `objectBoundingBox` units, the hairline
drawn in full under an opaque photograph, the cusp at y≈42%, and the CSS grade rather
than a re-bake are all exactly as documented. The copy column is 48.1u of ink on
`--u: max(8.6px, min(1vw, 1.62svh))`, centred by `align-items`, verified to fit one
screen from 1000×700 to 2560×1440.

**THE HOURS LINE CAN NOW CARRY A CLOSING TIME, AND WHAT CHANGED IS NOT THE BLOCK.** The
constraint was never the copy — it was that Crave had two branches closing at two
different hours, so a block byte-copied to four pages could not name one without
asserting it as the whole house's. One branch, so the whole fact fits: **"Every day /
Noon until eleven"**. The hedge is retired rather than reworded. Keep it in step with the
location band and the FAQ — the same claim appears three times on one site and that set
has drifted before.

**The reserve and ending blocks are transplanted byte-for-byte from `index.html`** to
`menu.html`, `about.html` and `contact.html`. Do not edit the copies. Change
`index.html` and re-copy.

**`node recopy-blocks.mjs` does the copy and `--check` verifies it.** It replaces the old
diff snippet and it exists because a LENGTH-based splice of those blocks failed twice.
Both ends of every block are anchored in the target independently.

**CLAUDE.md USED TO CLAIM THE ENDING BLOCK CARRIES ONE INTENTIONAL DELTA PER PAGE —
`aria-current="page"` on that page's own footer link. IT DOES NOT, AND DID NOT BEFORE
THIS REBRAND EITHER.** All four footers are byte-identical. The `aria-current` that exists
is on the **topbar**, which is not part of the copied block. Checked 2026-09-30 against
the pre-rebrand files. `recopy-blocks.mjs --check` should print IDENTICAL twelve times.

### Specs
Design decisions are written up in `docs/superpowers/specs/`. Read the relevant one
before changing a page that has one — it records what was measured and why, which is not
recoverable from the CSS alone.

## Performance
The architecture is unchanged and still excellent: one rAF loop per page, one number per
element, transforms derived in CSS, observer-gated and self-halting. `node
perf-scroll.mjs` reports a median frame of **16.7ms and zero tasks over 50ms** on every
page at 4x CPU throttle, before and after the rebrand. **Do not "optimise" the motion.**

**THE NEW PHOTOGRAPHY COSTS MORE BYTES THAN THE OLD AT THE SAME PSNR FLOOR, and the
reason is texture rather than darkness.** Rice, lace mats, shredded kunafa pastry and a
basket of fries are the highest spatial frequency subjects a codec can be handed, and the
floor does not know that a grain of rice one level off is invisible. `reserve-interior`
is 231K at 770px where Crave's smoothest frames were ~150K at 710. Pages run 245–622K
desktop against Crave's 180–430K. The right response is to re-crop or re-source a frame,
not to lower a floor blindly.

`compare-photos.mjs` reports **28 pairs below 38dB**, worst 30.9dB on `dish4-kunafa`.
That is the documented false positive, not a regression: it measures at the PAINTED size
through a downscale, and a 2.7% resample of shredded pastry produces large local
differences. `verify-rungs.mjs` passes every rung at 40dB+ against its own source, and
the bake reports every variant meeting its floor.

### Responsive photography
Unchanged. Every photograph is AVIF, with WebP behind it and the untouched original JPEG
as the `<img src>`. The pipeline is three steps and must run in this order:

```bash
node measure-img-sizes.mjs --json   # what the layout actually paints -> img-sizes.json
node bake-responsive.mjs            # encode the ladder -> assets/img/r/ + img-manifest.json
node apply-responsive-markup.mjs    # wire <picture> into the four pages
```

**After any source is re-cropped or replaced, `rm -rf assets/img/r` rather than trusting
`--force`**, and re-run `apply-responsive-markup.mjs` after, since deleting rungs changes
the ladder. **`bake-responsive.mjs` does not notice a changed source at the same width** —
it keys on the output filename.

**UNWRAP THE `<picture>` ELEMENTS BEFORE RE-MEASURING when the filenames change.** The
measure pass drives the real pages, and a page whose `<source srcset>` points at deleted
rungs renders broken images. Strip every `<source>` and unwrap, so the `<img src>`
fallback governs; `apply-responsive-markup.mjs` re-wraps.

**COUNTING `<picture>` BY STRING OVERCOUNTS BY TWO PER PAGE.** Two CSS comments on every
page mention `<picture>` by name. That is the same trap `apply-responsive-markup.mjs`'s
own guard was hardened against; count elements, not occurrences.

**`bake-responsive.mjs` MUST RUN UNDER THE HARNESS, NOT AS A SHELL `&` JOB.** Backgrounded
with `&` the parent shell exits, Chrome dies with it, and the run stops partway with a
`TargetCloseError` after writing a partial ladder — which is exactly the state the
filename-keyed bake cannot recover from on its own.

Everything else about the ladder is unchanged and still load-bearing: `picture { display:
contents }`; an `<img>` sized `width: auto` taking its ratio from the BITMAP; `sizes`
being PER PAGE and read from **`img-manifest.json`** rather than `img-sizes.json`; the
ladder being the union of every page's demand; `naturalWidth` being density-corrected;
`platter-plate` being WebP-only and getting the WHOLE ladder; thinning by GAP rather than
by position; pruning a rung a wider rung beats on bytes (**delete the orphaned files
afterwards**); taking the WIDEST each image is ever painted sampled through the scroll;
sampling desktop demand at dpr 1 as well as at retina; and encoding AVIF 10-bit.

### Loading and delivery
Unchanged. Only the LCP image on each page is eager; everything else is `loading="lazy"`
plus `fetchpriority="low"`, and the choreographed sections carry `data-warm="<selector>"`
so a small observer flips them to eager 1.5 viewports out. **`data-warm` on about.html is
`.diwan` now, not `.reunion`** — the policy table in `apply-responsive-markup.mjs` carries
it. Type is self-hosted, one variable file per family. `serve.mjs` compresses and caches.
Page transitions prefetch on intent.

### `node build.mjs`
`dist/` is what ships. It strips every comment and copies **only what a page references**.
The copy list is derived from the markup — `src`, `href`, `srcset`, `imagesrcset` **and
`url()`**, which is what lets the mark ship as a CSS `mask-image`. It also parses
`assets/site.webmanifest`, whose icons an HTML attribute scanner cannot see.

It is **comment removal, not minification**, deliberately. About half the weight of
`about.html` and `contact.html` is CSS comments, and those comments are this project's
record of what was measured and why.

## The mark
**THIS IS THE FIRST REBRAND WHERE THE LOGO CANNOT BE FAITHFULLY RECONSTRUCTED, and saying
so is part of the deliverable.** Crave's mark was a 4-fold symmetric scalloped plaque: one
quadrant traced, mirrored twice, mean boundary error 0.88px. La Pranzo's emblem is an
**irregular Kufic ring with no symmetry to exploit** and the only artwork obtainable is
536×395. A curve fit to that would be a confident-looking bad trace, which is worse than
no trace.

**`make-lapranzo-mark.py` thresholds the real pixels instead.** What makes that affordable
is the dark ground: the logo's own field is black and so is the page, so the artwork only
has to be SEPARATED from its tile rather than lifted off it and re-drawn.

- **The tile is genuinely monochrome, measured:** ground rgb(22.4, 22.4, 22.4) at chroma
  0.03, mark rgb(246.2, 246.2, 244.3) at chroma 1.87. That is the single most useful thing
  about this identity.
- **The lettering comes out by COMPONENT, not by band.** The two text lines sit at y
  184–209 and 237–249, which looks like a clean horizontal cut — but the ring's lower arc
  passes THROUGH those rows at both sides, so a band cut takes two wings with it. Labelled
  instead, the separation is total: every glyph ≤317px, the smallest ring part in the band
  695px, **2.19x of margin**. Measure that margin INSIDE the band; comparing all dropped
  components against all kept ones reports 0.60x and reads like a failure.
- **It is MASKED, not placed**, so it still takes `currentColor` exactly as the `<path>`
  it replaces did. A plain `<img>` would have frozen it white and broken
  `.touch__mon`, which paints the same mark at 5% alpha.
- **The shipping mask is 512px and alpha-only.** At 1024 with an RGB channel it was 160K,
  which `perf.mjs` reported as 180K of "img:legacy" on exactly the two pages that carry it.
  A mask reads the alpha channel only, so three channels of solid white were being shipped
  to be thrown away. **160K → 47K.**

**Ask the client for vector artwork.** It is the second item on the list, above everything
except re-reading the prices.

### The icon set — `node bake-favicons.mjs`
**TWO DIFFERENT DRAWINGS, and the small one had to become a SIMPLIFICATION.** The emblem's
median ink run is 39px of 1024, which is 0.61px at a 16px favicon. The first attempt
dilated the alpha to a median of 93px — the raster equivalent of the stroke-thickening
that saved Crave's plaque — and it rendered as a **white blob**. A sweep of six dilations
from 1 to 13 was rendered at 32px and **none read as a mark**: past a point the arms
merge, short of it they grey out. **The information in this shape does not survive to
16px by any amount of thickening.**

So the small drawing keeps the emblem's STRUCTURE and drops its detail: a ring broken into
an upper and a lower arc with the two dots the real mark carries. Solved by rendering at
16, 32 and 64 — stroke 13, gap 18°, radius 31, dot 7 of a 100 unit box. It is a path, so
`favicon.svg` is 555 bytes.

The LARGE icons are the full artwork, **lettering and all**, inset to 78%. That lettering
is the real artwork's own, not type set over it — La Pranzo's logo has its wordmark built
into the emblem, so lifting the letters out and re-setting them in Cormorant would invent
a lockup the brand does not have.

Both sit on the logo's own opaque black. **An XML comment may not contain a double
hyphen** — `favicon.svg` therefore carries no comments.

## Verification — run these after touching anything above
```bash
node compare-layout.mjs --save   # snapshot every classed element's rect, BEFORE a change
node compare-layout.mjs          # ...then diff the live site against that snapshot
node recopy-blocks.mjs --check   # the four shared blocks, both ends anchored
node verify-rungs.mjs            # every rung IS its own source photograph
node compare-photos.mjs          # each rung vs its original, at four real device profiles
node verify-dist.mjs             # dist vs source: CSS rule counts, geometry, painted pixels
node perf.mjs after              # bytes, LCP, FCP, CLS, TBT
node perf-scroll.mjs             # frame cost while scrolling, at 4x CPU throttle
node verify-touch.mjs            # the contact page's own checks
node verify-locale.mjs           # the location band's own checks
```

**TWO OF THESE HAD POLARITY BUGS AND BOTH WERE FOUND ON 2026-09-30.** They are the same
bug in two tools, and it is the one to expect whenever a ground moves:

- **`verify-locale.mjs`'s cap scan tested "darker than the ground"**, which finds dark type
  on a light page. On a near-black page that found the BACKGROUND: ink on every row, and a
  **cap of 62px on a 59px font** — a cap taller than its own em, which is what gave it
  away. It now tests against the ground it is actually on.
- **`verify-touch.mjs` sampled each field rule's DARKEST row.** On a near-black page the
  darkest row is the background, so all four underlines reported lum 13 — the ground's own
  luminance — and a perfectly visible gold rule read as invisible. It now takes the row
  furthest from the ground.

**A measurement whose polarity does not match the page's is not a measurement.** Neither
tool errored; both printed confident numbers. Negative-test a checker after changing it.

`verify-dist.mjs` needs both servers, and **`SERVE_ROOT` is not optional**:
```bash
PORT=3001 node serve.mjs
SERVE_ROOT="$PWD/dist" PROD=1 PORT=3005 node serve.mjs
BUILT=http://localhost:3005 node verify-dist.mjs
```
**Ports 3000 and 3002 are other projects on this machine.** `serve.mjs` prints its root at
startup; read it before trusting a dist run.

As of 2026-09-30: `verify-dist` reports all eight page/viewport pairs **pixel-identical**
with matching CSS rule counts; `recopy-blocks --check` prints IDENTICAL twelve times;
`verify-rungs` passes; `verify-touch` and `verify-locale` pass every check.

**`layout-snapshot.json` was re-saved on 2026-09-30, and that was intended** — the carte
went from 84 to 166 dishes, a location band was deleted and the whole photography set was
replaced. It is not a reference to Crave's layout any more. Re-save it only when a layout
change is intended, and say so.

## Deploying — Vercel
`vercel.json` is the deploy config and carries **no comments**, deliberately — Vercel
validates it against a strict schema that rejects any additional property. The reasoning
lives here: `outputDirectory: "dist"`; the `headers` mirror `serve.mjs` PROD=1 exactly;
**rule ORDER is load-bearing** (the general `/assets/(.*)` must come BEFORE the two
specific paths, or the immutable rules are silently overwritten); `cleanUrls: false`
because every internal link is an explicit `.html`.

**A git-connected redeploy rebuilds the commit it was pointed at, not `main`'s tip.**

## `_archive/`
Everything superseded, moved rather than deleted:
- `_archive/misono-photography/` and `_archive/misono-bakes/` — the first restaurant's
  material.
- `_archive/crave-photography/` — the 2026-09-28 build's seventeen frames, including the
  nine marquee tiles and `locale-nairobi`. **They belong to a different restaurant.**
- `_archive/build-carte.crave.mjs` — the generator that read an API rather than images.

**Do not read it for direction and do not restore from it** unless the user asks.
`node build.mjs` derives its copy list from the markup, so `_archive/` cannot reach a
deploy by accident.

## Assets on hand
- `brand_assets/lapranzo-logo-official-536.png` — **the real logo, and the only artwork
  there is: 536×395, an opaque black tile.** A white Kufic ring with "La Pranzo &
  Al-Diwan / Fast Food & Cafe" inside it. Measured ground rgb(22,22,22), mark
  rgb(246,246,244), **near-zero chroma in both**.
- `brand_assets/lapranzo-mark.png` / `-full.png` / `-bold.png` — 1024px alpha masters cut
  by `make-lapranzo-mark.py`. The ring alone, the ring with lettering, and the dilated
  ring. **Masters only; none of them ships.**
- `brand_assets/lapranzo-mask-512.png` — **the one that ships.** 512px, alpha-only, 47K.
- `assets/favicon.svg`, `favicon-16/32.png`, `apple-touch-icon.png`, `icon-192/512.png`
  and `assets/site.webmanifest` — baked by `bake-favicons.mjs`.
- `assets/img/gallery/dish1..9-*.jpg` — the nine marquee tiles: la pranzo chips, a mixed
  grill, basbousa, kunafa, a beef burger, wings, a shawarma plate, milkshakes and masala
  chicken. **Their WIDTHS are the nine the row has always had** (856, 671, 510, 445, 563,
  564, 637, 450, 306, all 560 tall), so `.beyond__track` keeps its measured width. A
  replacement must keep its slot's width.
- `assets/img/r/` — the AVIF and WebP derivatives, all generated. **Never edit or
  hand-add anything here.**
- The reference comps in `assets/img/` are **kept**. The architecture they document is the
  architecture the site still has. `build.mjs` keeps all 35MB of them out of the deploy.

### Baking images — `bake-lapranzo-photography.py`
Covers all 27 frames; `bake-platter-plate.py` the one cutout; `bake-contact-locations.py`
the location frame.

**THE BANDS ARE THE INVERSE OF THE SET THEY REPLACE**, which was itself the inverse of the
one before it:

    hero            62     dark grill room, WHITE type over it again
    counter         70
    reserve         68     a laid table under warm light
    about opening   65     the making rather than the made
    about plate     55     full bleed, nothing on it
    chapters        72     lit food in unlit rooms
    experience      80     plates under lamps
    diwan          130     the ONE lit band, and it is EARNED
    contact hero    60     no baked vignette, for a THIRD distinct reason
    locale          75     was 108-118 — the first time it has ever moved
    gallery tiles   95     a marquee on a near-black ground

**GAMMA IS STILL THE RIGHT TOOL, AND THE REASON IS NOT THE ONE IT USED TO BE.** The old
note said gamma rather than a gain "because a gain clips". Going the other way nothing can
clip, so that argument is spent. Gamma is kept because of what the two do to a **LAMP**:
solving a mean of 130 down to 62 needs a gain of 0.477, which takes a 250 lamp to 119 and
it stops reading as a lamp; the same move on gamma is 2.10, which leaves it at 240 and
puts the room underneath it. A dark restaurant frame is exactly a bright lamp over a dark
room.

**THE CEILING IS WHAT BITES IN THIS DIRECTION, NOT THE FLOOR**, and the bake prints a
PINNED list rather than silently landing short. **A frame that cannot reach its band does
not belong in it** — unchanged, and it now fires on BRIGHT sources.

**NO WHITE-SEAMLESS STUDIO SHOT CAN EVER REACH A DARK BAND.** Two frames were tried for
one marquee tile and both pinned at gamma 3.20 — 161.4 and 200.3 against a 95 aim. A
white seamless has no shadow anywhere in it and no curve can put one back. **Check the
source mean first** (120 and under for a 95 band); it is a five-second test that saves a
bake.

**A DEEPER VIGNETTE BUYS ALMOST NOTHING WHERE AN AIM IS SOLVED AFTER IT.** The exposure
solve immediately puts back what the vignette removed. Swept on `lp-hero`, the top-left
corner moves 69.5 → 67.1 → 64.7 for vig 0.14 → 0.20 → 0.26 while the wordmark band sits at
70.2 throughout. **What moves a local reading is the AIM, the CROP, or where the element
sits.** The locale frames are the exception and the reason the old note reads the way it
does: their marker-card floor is met by a vignette because their aim is set for the room
rather than for the card.

**THE VIGNETTES COME BACK**, for exactly the reason they left: a vignette darkens the
corners, which on a bright frame reads as a dirty lens and on a dark one concentrates the
eye. On `lp-hero` it is back to 0.14 from Crave's zero.

**THE HERO IS CHOSEN ON ITS WORDMARK BAND, NOT ON ITS ROOM** — unchanged, only the target
flips. The band (x 6–52%, y 62–94%) wants to be LOW and EVEN now rather than high and
even. **Judge a candidate by rendering the real heading over it at full size, not from a
contact sheet.**

**THREE PEXELS SEARCHES RETURNED RELIGIOUS SITES AND ALL WERE DISCARDED.** Querying for
"mandi" and "arabic" surfaces the Kaaba, the Prophet's Mosque, a skyline of Cairo minarets
and a Quran on a stand among the food. None is restaurant photography and none is
appropriate as decorative stock for a commercial site. **Budget for filtering that out
before it reaches a contact sheet.**

**HARVESTING PEXELS IDS NEEDS A REAL BROWSER.** `pexels.com/search` is behind a Cloudflare
challenge headless Chrome does not clear. `images.pexels.com` is NOT challenged, so
`fetch-pexels.mjs` still works headless — only the search does not. What works is fetching
the search URL from page context inside a browser that already holds the cookie.
**`images.pexels.com` will not hotlink into a `pexels.com` page either**, so a contact
sheet has to be built from downloaded files rather than from live thumbnails.

**Pexels serves AVIF to Chrome** whatever the `.jpeg` says, so a download has to go through
`sips -s format jpeg` before anything else will touch it.

### The turning plate — `bake-platter-plate.py`
**THE CUTOUT NEEDS A PALE PLAIN GROUND, AND THE HANDSOMEST CANDIDATE IS NOT IT.** Pexels
7426867 — the mandi platter that ships as `about-plate` — is geometrically perfect for the
job: round, centred, overhead, margin all round. It is shot on DARK wood, and swept against
the ellipse fit the best it ever scored was 0.947. The plate's rim is a thin metal ring
that falls into SHADOW along its lower edge, the shadow reads as ground, and the flood
walks through the rim and eats the plate. **A dark ground under a dark-rimmed plate has no
boundary to find.** The frame that ships (32986475) is on a pale ground and scores **0.991
fill, ry/rx 0.9757**, centred within 2.5px on both axes.

**THE GROUND THRESHOLD IS PER SOURCE AND MUST BE SOLVED, NOT CARRIED ACROSS** — unchanged,
and now demonstrated in both directions. On this plate the **CEILING** is the term that
matters: the floor is insensitive from 150 to 196 because the ground is a clean pale
sweep, while loosening saturation from 26 to 40 drops the fill to 0.961 as the platter's
painted rim pattern starts being admitted as ground.

Everything else about the cutout is unchanged: the plate's centre must be the file's
centre or it orbits; any ellipse is scaled circular or it wobbles once per revolution; the
silhouette comes from a flood of the GROUND inward from the border, not a threshold on the
plate; and the ground is CLOSED before flooding.

## Still to confirm with the client
Everything on this site is **researched from public sources, not client-confirmed.** In
priority order:

- **The prices, and the whole carte.** Read off twelve photographs rather than an
  endpoint. This is the one fact class whose method is weaker than the last build's.
- **Official vector artwork**, and whether the wordmark should be set in the logo's own
  italic serif rather than Cormorant — see the type note above.
- **Whether the number takes WhatsApp.** The reserve CTA says "Opens WhatsApp" and links
  `wa.me/254768818833`. The number is real; WhatsApp on it is not verified, and if it is
  wrong the primary booking CTA is a dead end.
- **The opening hours.** africabz gives 12:00–23:00 daily and Google corroborates the noon
  open. No source contradicts either, and no source is the restaurant.
- **The alcohol answer.** Read off the menu itself — 166 items, none alcoholic. Do not
  soften it.
- **Halal.** Not published anywhere. The FAQ says exactly that and sends it to a call.
- **Dietary.** Vegetarian breadth is countable off the real carte and is stated. **Vegan
  and gluten-free are NOT confirmed**, the answer says so, and allergies go to a call.
- **Private dining and capacity.** Neither is published. The FAQ says the room does large
  groups, which the reviews establish, and stops.

**`contact.html`'s enquiry form does not submit, by decision rather than oversight.** There
is no backend; a handler cancels the submit event for one reason — a form with no action
reloads the page and throws away everything a guest typed. **There is deliberately no
success state.** To wire it up: give the `<form>` an action and delete that handler.

**Every photograph on the site is a placeholder and is flagged as one in the markup.** La
Pranzo's own imagery is not available at usable resolution or licence. The frames are
Pexels, matched dish by dish to dishes that are actually on its boards. Each one's markup
comment names the single property a replacement must have. **The location photograph
matters most**: a location band implies the picture IS the place, and it is the Mombasa
waterfront rather than Haile Selassie Road.

**Written rather than sourced:** the four chapters and the experience cards on
`about.html`, the diwan section, the four parts of the Mix Grilled Platter on
`index.html`, and the section copy throughout. Every restaurant-specific claim in it is a
count off the real carte — fourteen grill dishes, nine rice dishes, thirteen desserts,
eleven hours. None of it makes a service claim a guest could turn up and check.

## Always Do First
- **Invoke the `frontend-design` skill** before writing any frontend code, every session,
  no exceptions.

## Reference Images
- If a reference image is provided: match layout, spacing, typography, and color exactly.
  Swap in placeholder content. Do not improve or add to the design.
- If no reference image: design from scratch with high craft.
- Screenshot your output, compare against reference, fix mismatches, re-screenshot. At
  least 2 comparison rounds.
- Measure the reference rather than eyeballing it, and measure it as a **share of viewport
  width** — a recording made at 1890px and a screenshot taken at 1440px cannot be compared
  in pixels.

## Brand Assets
- Always check `brand_assets/` before designing. If assets exist there, use them.
- If a logo is present, use it. If a color palette is defined, use those exact values.

## Local Server
- **Always serve on localhost** — never screenshot a `file:///` URL.
- `node serve.mjs` serves the project root. **Port 3000 and 3002 are other projects on
  this machine**; this project runs on **3001**. If it is taken, pick another and
  **check the served `<title>` matches this project before trusting a screenshot.**
- If the server is already running, do not start a second instance.

## Screenshot Workflow
- `node screenshot.mjs http://localhost:3001 label [desktop|tablet|mobile|WxH]`.
  Saves to `./temporary screenshots/`.
- It captures **full page** via `captureBeyondViewport`, which **never moves the layout
  viewport** — so every `IntersectionObserver` section shoots ARMED, that is blank, and
  every `loading="lazy"` frame shoots as a placeholder. That is the capture, not the page.
  Scroll to the section for real, or use the dedicated shooters.
- Per-section tools, none of which overlap: `shoot-hero-mobile.mjs` (**`PORT=3001`**),
  `shoot-flavors.mjs`, `shoot-chapters.mjs`, `shoot-experience.mjs`, `shoot-contact.mjs`,
  `shoot-touch.mjs`, `shoot-locale.mjs`, `shoot-reserve.mjs` (**takes `index`, not
  `index.html`**), `compare-reserve.mjs`.
- After screenshotting, read the PNG with the Read tool.
- When comparing, be specific: "heading is 32px but reference shows ~24px".
- Judge subtle things (seams, banding, contrast) by **measuring the PNG**, not by eye.
- **Clean up when done:** `rm -f "temporary screenshots/"*.png`.

## Output Defaults
- One self-contained HTML file per page, all styles inline in a `<style>` block.
- **Hand-written CSS, not Tailwind.** Decided by the work: the site is built out of mask
  gradients, per-image filter grading, radial blooms, SVG noise and keyframes that
  utilities cannot express.
- Geometry that comes off a reference is written as a share of the viewport (or of one
  scale unit), never in pixels, and the derivation is left in a comment.
- **A new photograph is not finished until it has been through the responsive pipeline**,
  and it needs a policy entry in `apply-responsive-markup.mjs` first or it silently ships
  the full-size original.
- Mobile-first responsive.

## Anti-Generic Guardrails
- **Colors:** Never use default Tailwind palette. Derive from the brand colour.
- **Shadows:** Never flat `shadow-md`. Layered, colour-tinted, low opacity.
- **Typography:** Never the same font for headings and body. Tight tracking on large
  headings, generous line-height on body.
- **Gradients:** Layer multiple radial gradients. Add grain via SVG noise.
- **Animations:** Only animate `transform` and `opacity`. Never `transition-all`.
- **Interactive states:** Every clickable element needs hover, focus-visible and active.
- **Images:** Treat with an overlay where type sits on them; measure the worst tile.
- **Spacing:** Intentional, consistent tokens.
- **Depth:** A layering system, not all one z-plane.

## Hard Rules
- Do not add sections, features, or content not in the reference.
- Do not "improve" a reference design — match it.
- Do not stop after one screenshot pass.
- Do not use `transition-all`.
