#!/usr/bin/env python3
"""Bake every photograph on the La Pranzo site from its Pexels source.

Reproduce, end to end, from the project root:

    SRC=/tmp/lp-src && mkdir -p $SRC
    node fetch-pexels.mjs $SRC 30479386 17815998 34492425 27685507 7426867 \
        31249644 4224304 6262168 5990698 32148345 37030068 37315443 \
        18285958 33122349 36169141 33233601 18912369 5779487 10879643 \
        17255884 30500752 19141541 37322776 14662100 7353388
    for f in $SRC/raw-*.bin; do id=${f#*raw-}; id=${id%.bin}; \
        sips -s format jpeg "$f" --out "$SRC/cand-$id.jpg"; done
    python3 bake-lapranzo-photography.py $SRC /tmp/lp-out

The sips step is not optional: Pexels honours Chrome's Accept header, so what
fetch-pexels.mjs lands is AVIF whatever the .jpeg in the URL says.

HARVESTING THE IDS NEEDS A REAL BROWSER. pexels.com search is behind a
Cloudflare challenge that headless Chrome does not clear. images.pexels.com is
NOT challenged, so fetch-pexels.mjs still works headless; only search does not.

EVERY FRAME HERE IS A PLACEHOLDER and is flagged as one in the markup. La
Pranzo's own photography is not available at usable resolution or licence;
these are stock frames chosen to match dishes that are actually on its menu
boards. Whatever replaces them needs the property named in each entry's
comment and nothing else.

THREE SEARCHES RETURNED RELIGIOUS SITES AND THEY WERE ALL DISCARDED. Querying
Pexels for "mandi" and "arabic" surfaces the Kaaba (32822914), the Prophet's
Mosque (36318708), a skyline of Cairo minarets (38930869) and a Quran on a
stand (10346836) among the food. None of them is restaurant photography and
none is appropriate as decorative stock for a commercial site. Budget for
filtering that out before it reaches a contact sheet.

BANDS — AND THEY ARE THE INVERSE OF THE SET THIS REPLACES, which was itself
the inverse of the one before it. Crave was a daylight cafe opening at six in
the morning and every band was built for a bright room with DARK type over it.
La Pranzo opens at NOON and trades until eleven at night; its own menu artwork
is black, and its logo is a white mark on an opaque black field.

    hero            62     dark grill room, WHITE type over it again
    counter         70     the pill frame on index
    reserve         68     a laid table under warm light
    about opening   65     the making rather than the made
    about plate     55     full bleed, nothing on it
    chapters        72     lit food in unlit rooms
    experience      80     plates under lamps
    diwan          130     the ONE lit band, and it is EARNED
    contact hero    60     no baked vignette; see below
    gallery tiles   95     a marquee on a near-black ground

A DARK FRAME IS THE EASIER GROUND FOR TYPE, AND THAT IS THE ONE THING THIS
INVERSION MAKES SIMPLER. A bright frame's worst case under dark type is a
blown highlight at 255, which has no headroom left in it at all; a dark
frame's worst case under white type is a lamp at 250, which a grade can pull
back. The worst-12px-tile instrument is unchanged and still right — only the
direction of the test flips. Use shoot-hero-mobile.mjs, and note that its ink
colour has to flip with it or it scores every crop backwards.

THE VIGNETTES COME BACK, for exactly the reason they left. A vignette darkens
the corners, which on a bright frame reads as a dirty lens and on a dark one
concentrates the eye. On `lp-hero` it is back to 0.14 from Crave's ZERO: the
wordmark sits in the lower left, the type is white again, and darkening that
corner is now the one thing that helps it rather than the one thing that
breaks it.

BUT A DEEPER VIGNETTE BUYS ALMOST NOTHING HERE, AND THE REASON IS THE AIM.
The exposure is solved AFTER the vignette, so a deeper vignette removes light
and the gamma solve immediately puts it back to land the same mean. Swept on
lp-hero, the top-left corner moves 69.5 -> 67.1 -> 64.7 for vig 0.14 -> 0.20
-> 0.26 while the wordmark band sits at 70.2 throughout. Reaching for the
vignette to fix a local contrast problem is therefore the wrong lever on any
frame that also carries an aim: it redistributes light, it does not remove it.
What moves a local reading is the AIM, the CROP, or where the element sits.
(The locale frames are the exception and the reason the old note reads the way
it does: their marker-card floor is met by a vignette because their aim is set
for the room rather than for the card.)

GAMMA IS STILL THE RIGHT TOOL, AND THE REASON IS NOT THE ONE IT USED TO BE.
The old note said gamma rather than a linear gain "because a gain clips, and
these frames have their room in the shadows". Going the other way nothing can
clip — scaling DOWN cannot exceed 255 — so that argument is spent and a gain
would be safe on its own terms. Gamma is kept because of what the two do to a
LAMP. Solving a mean of 130 down to 62 needs a gain of 0.477, which takes a
250 lamp to 119 and it stops reading as a lamp at all; the same move on gamma
is 2.10, which leaves that lamp at 240 and puts the room underneath it. A dark
restaurant frame is precisely a bright lamp over a dark room, so the curve
that preserves the highlight and spends the shadows is the correct one.

THE CEILING IS WHAT BITES IN THIS DIRECTION, NOT THE FLOOR. Solving a source
already at 186 down to 62 wants gamma 4.5, past the 3.2 ceiling, and the bake
prints a PINNED list rather than silently landing short. A frame that cannot
reach its band does not belong in it — that rule is unchanged, and it now
fires on BRIGHT sources rather than on dark ones.

Two frames break the table and both are deliberate:

  - `about-dw1-room` and `about-dw2-room` aim 130, far above everything else.
    They are the diwan — the reception room the restaurant is half named
    after — and a diwan is a LIT room with people sitting in it. On the bright
    build the closing beat was the one DARK band, earned because midnight is
    dark. This is the exact inverse and it is earned the same way.

  - `contact-hero` bakes NO vignette, for the third rebrand running and the
    third distinct reason. The first frame was lit by a single corner pendant
    and a vignette put the lamp out; the second was a sunlit room and a
    vignette dirtied it; this one is a coffee bar whose whole subject is the
    lit counter at its centre, and cornering it would close the room in.

`locale-mombasa` is NOT baked here — bake-contact-locations.py owns it, and
`locale-nairobi` is deleted with the second branch. Mombasa's band moves for
the first time in three rebrands, 108-118 down to 75. It survived Li's and
Crave untouched because an open-air daylight city frame was already lit like
those rooms. On a near-black page it is the brightest thing on the site and
reads as a hole. Pulling it down also HELPS the near-white marker cards laid
over it, whose hard floor was always that the sky under a card must not
approach the card's own luminance.
"""
import os, sys
from PIL import Image, ImageEnhance, ImageFilter

SRC = sys.argv[1] if len(sys.argv) > 1 else '/tmp/lp-src'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/lp-out'
os.makedirs(OUT, exist_ok=True)

#   id     source photo
#   stem   output name
#   w,h    delivered size; the crop is taken at that aspect from the source
#   ax,ay  crop anchor, 0..1 across the slack (0.5 = centred)
#   lift   black point raised to this floor
#   gain   contrast about mid grey
#   sat    saturation multiplier
#   warm   per-channel multiplier (R,G,B)
#   vig    vignette strength at the corners, 0 = none
#   aim    target mean luminance; a gamma is solved to hit it
F = [
 # ---- index -----------------------------------------------------------------
 #   needs: a DARK room with its activity OFF CENTRE, leaving the lower left
 #   calm and DARK enough to set white type on. The aspect is load-bearing —
 #   1.60:1 is what every number in index.html's portrait crop was solved
 #   against, and it matches a 1440x900 viewport exactly so `cover` crops
 #   nothing there.
 #   CHOSEN ON THE WORDMARK BAND, NOT ON THE ROOM, which is the one rule that
 #   survived the inversion unchanged. The band (x 6-52%, y 62-94%) wants to be
 #   LOW and EVEN now rather than high and even.

 #   AND THEN RE-CHOSEN ON THE ROOM, 2026-10-01, because the first frame got
 #   the band right and the BUSINESS wrong. 30479386 is a handsome dark dining
 #   room with red leather banquettes and crystal glassware — a $$$$ steakhouse.
 #   La Pranzo's own logo says "Fast Food & Cafe", Google reports Ksh
 #   500-2,500 a head, and its own photographs show plain wooden tables, a
 #   chalkboard drinks wall and shared trays of mandi. A hero that flatters the
 #   client into a different price bracket is not a placeholder, it is a
 #   misrepresentation, and it is the kind a guest can check by walking in.

 #   TWO OTHERS WERE BAKED AND REJECTED FOR CONTENT RATHER THAN FOR LEVEL.
 #   1787141 is a chalkboard-menu cafe and the closest match to the real room
 #   of anything found — but the board carries ANOTHER BUSINESS'S NAME and a
 #   legible price list that is not La Pranzo's. 33233564 is a casual counter
 #   with Lavazza and Nutella packaging in shot. **A placeholder may not carry
 #   a third party's branding**; it ships, and a reader reads it.

 #   AND THE SHAPE OF THE SOURCE DECIDED IT IN THE END. 31943327 was the best
 #   room of the lot and is PORTRAIT, 1200x1800. Cropped to this slot's 1.60:1
 #   it throws away 58% of the height AND upscales 1200 -> 1717 on the largest
 #   image the site serves. A sweep of ax over that source returned BYTE
 #   IDENTICAL numbers at every value, which is the sweep signature this file
 #   already warns about twice — here it meant the crop had no horizontal
 #   slack to move in, because the source is narrower than the target. CHECK
 #   THE SOURCE ASPECT BEFORE SWEEPING AN ANCHOR; on a portrait source it is
 #   `ay` that is live and `ax` that does nothing.
 #
 #   This frame is landscape at 2700x1800, so it downscales rather than
 #   upscales. A warm casual room: wicker pendants, plants, plain wooden
 #   tables, people sitting, windows onto a street. No legible signage.
 #   ay=.55 puts the dark plants and chair backs under the wordmark (band mean
 #   43.1, against 70.1 for the steakhouse) and a dark window corner under the
 #   MARK, which is what the mark needed — see below.
 dict(id='34206672', stem='lp-hero', w=1717, h=1073, ax=.5, ay=.55,
      lift=0, gain=1.06, sat=0.94, warm=(1.03,1.00,0.97), vig=0.14, aim=62),
 #   needs: a WIDE view of the room. The radius clamps to half the height, so
 #   at 2.162:1 the outer 23.1% at each end is a semicircular cap and only the
 #   middle 53.8% is full height — keep the subject in that middle.
 #   REPLACED TWICE. 17815998 was a bare wall with two pendants: it graded
 #   correctly and read as nothing, because in a 2.162:1 stadium whose middle
 #   53.8% is the only part at full height, a frame whose subject is two small
 #   lamps has no subject in the middle at all. A band is not a composition.
 #   31071253 replaced it and was a dining room — correct for the frame, wrong
 #   for the business, for the same reason the hero was.

 #   A SHAWARMA SPIT IS THE MOST ACCURATE SINGLE OBJECT THIS KITCHEN OWNS.
 #   Shawarma is the first item on the sandwich board at 350, the vertical
 #   rotisserie is the one piece of equipment a guest sees from the street, and
 #   it sits dead centre of the stadium's full-height middle. It is also the
 #   only candidate that says "Middle Eastern" without a caption.
 dict(id='35255190', stem='lp-counter', w=1536, h=710, ax=.5, ay=.5,
      lift=0, gain=1.04, sat=0.94, warm=(1.03,1.00,0.97), vig=0.10, aim=70),
 #   needs: a LAID TABLE under warm light, behind the gourd clip.
 dict(id='34492425', stem='reserve-interior', w=1400, h=1576, ax=.5, ay=.5,
      lift=0, gain=1.04, sat=0.96, warm=(1.03,1.00,0.97), vig=0.12, aim=68),
 # ---- about -----------------------------------------------------------------
 #   THE MAKING RATHER THAN THE MADE — the brief for this slot, unchanged
 #   across three rebrands. A cook working a counter, not a plated dish.
 dict(id='27685507', stem='about-opening', w=2400, h=1800, ax=.5, ay=.5,
      lift=0, gain=1.06, sat=0.94, warm=(1.03,1.00,0.97), vig=0.14, aim=65),
 #   Full bleed, nothing over it. The mandi platter: rice, chicken, lemon.
 dict(id='7426867', stem='about-plate', w=1536, h=1024, ax=.5, ay=.5,
      lift=0, gain=1.08, sat=0.98, warm=(1.02,1.00,0.98), vig=0.16, aim=55),
 #   Chapter I - the fire. Kofta on skewers over open charcoal.
 dict(id='31249644', stem='about-ch1-fire', w=1100, h=1466, ax=.5, ay=.5,
      lift=0, gain=1.04, sat=0.98, warm=(1.03,1.00,0.97), vig=0.10, aim=72),
 #   Chapter II - the rice. Cooked under the lid.
 dict(id='4224304', stem='about-ch2-rice', w=1100, h=1466, ax=.5, ay=.5,
      lift=0, gain=1.04, sat=0.96, warm=(1.03,1.00,0.97), vig=0.10, aim=72),
 #   Chapter III - the sweet. Luqaimat-style fried dough in syrup, close.
 #   REPLACED: 6262168, a kunafa on a WHITE plate, pinned the gamma at its 3.2
 #   ceiling and still landed at 76.7 against 72 — a white plate under a
 #   top-light has no shadow for a dark band to live in. That frame is not
 #   wasted; it is bright and even, which is exactly what a marquee tile wants,
 #   so it moved to gallery/dish4 and took the 95 band instead.
 dict(id='7406887', stem='about-ch3-sweet', w=1100, h=1466, ax=.5, ay=.5,
      lift=0, gain=1.04, sat=0.98, warm=(1.02,1.00,0.98), vig=0.10, aim=72),
 #   Chapter IV - the table. People at it, which is the chapter's whole point.
 dict(id='5990698', stem='about-ch4-table', w=1100, h=1466, ax=.5, ay=.44,
      lift=0, gain=1.04, sat=0.94, warm=(1.03,1.00,0.97), vig=0.10, aim=72),
 dict(id='32148345', stem='about-ex1-coffee', w=1100, h=1467, ax=.5, ay=.5,
      lift=0, gain=1.02, sat=0.96, warm=(1.03,1.00,0.97), vig=0.08, aim=80),
 dict(id='37030068', stem='about-ex2-grill', w=1100, h=1467, ax=.5, ay=.5,
      lift=0, gain=1.02, sat=0.98, warm=(1.03,1.00,0.97), vig=0.08, aim=80),
 dict(id='37315443', stem='about-ex3-sweet', w=1100, h=1467, ax=.5, ay=.5,
      lift=0, gain=1.02, sat=0.98, warm=(1.02,1.00,0.98), vig=0.08, aim=80),
 #   THE DIWAN PAIR. 130, against the 55-80 everything around them sits at.
 #   This is the page's closing beat and it is about the room a household
 #   receives guests in. A dark frame here would be re-grading the subject
 #   away, exactly as a bright one would have on the build before this.
 dict(id='18285958', stem='about-dw1-room', w=1100, h=1466, ax=.5, ay=.5,
      lift=0, gain=0.98, sat=0.96, warm=(1.02,1.00,0.98), vig=0.06, aim=130),
 #   the only landscape frame on the site, and that is what stops the pair
 #   reading as a pair rather than as two depth planes.
 dict(id='33122349', stem='about-dw2-room', w=1200, h=900, ax=.5, ay=.5,
      lift=0, gain=0.98, sat=0.94, warm=(1.02,1.00,0.98), vig=0.06, aim=130),
 # ---- menu.html's opening frames --------------------------------------------
 # DEDICATED FILES, not the marquee tiles. The tiles are 560px tall, built for
 # a marquee, and these frames paint into a 3:4 portrait slot needing up to
 # 683 device px. At 900x1200 they paint at x0.7 and under.
 dict(id='36169141', stem='menu-grill', w=900, h=1200, ax=.5, ay=.5,
      lift=0, gain=1.04, sat=0.98, warm=(1.03,1.00,0.97), vig=0.10, aim=72),
 #   REPLACED: 34492425, which is reserve-interior's own source. The reserve
 #   block is byte-copied onto menu.html, so that frame was about to appear
 #   TWICE on one page, once in the opening composition and once three
 #   sections down. Reuse across distant pages is fine here and the site has
 #   always done it; reuse within a page is not.
 dict(id='19141541', stem='menu-arabic', w=900, h=1200, ax=.5, ay=.5,
      lift=0, gain=1.02, sat=0.96, warm=(1.02,1.00,0.98), vig=0.10, aim=72),
 dict(id='33233601', stem='menu-platter', w=900, h=1200, ax=.5, ay=.5,
      lift=0, gain=1.02, sat=0.96, warm=(1.02,1.00,0.98), vig=0.10, aim=72),
 # ---- contact ---------------------------------------------------------------
 #   REPLACED 2026-10-01 FOR CONTENT, NOT FOR LEVEL. 18912369 was a
 #   third-wave specialty coffee bar, and its menu board was fully legible in
 #   frame: ESPRESSO / AMERICANO / CORTADO / FLAT WHITE with prices in a
 #   currency that is not the shilling, over a BREW BAR list reading
 #   Moccamaster, Origami, Hario V60, Aeropress, Chemex, Kalita Wave. That is
 #   another business's price list, at full size, on the page a guest comes to
 #   for La Pranzo's contact details. It also graded cleanly and measured
 #   10.58:1 on the eyebrow, which is why nothing here caught it: **no tool in
 #   this project reads what is written inside a frame.**
 #
 #   This frame is Arabic coffee being poured from a DALLAH, the long-spouted
 #   pot, into a cup. It is the gesture the heading already names — "We are at
 #   Your Service" — and in the Gulf and on this coast it is the specific,
 #   conventional act of receiving a guest rather than a generic one. 2700x1800
 #   is this slot's own 1.5:1, so nothing is cropped away.
 #
 #   THE FIRST CHOICE FOR THIS SLOT WAS BRIGHTER AND WAS REJECTED BY THE BAKE
 #   RATHER THAN BY EYE. 8911582 — tea poured into two tulip glasses, a better
 #   photograph — measures 167.3 and pinned the gamma at its 3.2 ceiling at
 #   91.3 against the 60 aim. On a page whose heading is WHITE and whose
 #   eyebrow is held to 4.5:1, 91 is not a near miss. A frame that cannot
 #   reach its band does not belong in it, and the source mean is a
 #   five-second test that settles it before a bake.
 #
 #   NO VIGNETTE, and see the docstring: third rebrand, third reason.
 dict(id='5988437', stem='contact-hero', w=2000, h=1333, ax=.5, ay=.5,
      lift=0, gain=1.04, sat=0.92, warm=(1.03,1.00,0.97), vig=0.00, aim=60),
 # ---- the marquee ------------------------------------------------------------
 # Widths are the nine the row already had. Keeping them means .beyond__track
 # keeps its measured width and the marquee's percentage translate is untouched.
 # Every one of these nine is a dish that is actually on La Pranzo's boards.
 dict(id='5779487',  stem='gallery/dish1-chips',     w=856, h=560, ax=.5, ay=.5,
      lift=0, gain=1.04, sat=1.00, warm=(1.03,1.00,0.97), vig=0.06, aim=95),
 dict(id='33233601', stem='gallery/dish2-mixgrill',  w=671, h=560, ax=.5, ay=.5,
      lift=0, gain=1.02, sat=1.00, warm=(1.02,1.00,0.98), vig=0.06, aim=95),
 #   REPLACED TWICE, and the second one is the lesson. 10879643 pinned at
 #   gamma 3.20 (161.4 against 95) — a pale plate under a window — so it was
 #   swapped for 5848187, which pinned HARDER at 200.3. Both are studio shots
 #   on a WHITE SEAMLESS, and a white seamless has no shadow anywhere in it:
 #   no curve can put one back, so no white-seamless frame can ever reach a
 #   dark band. Checking the source mean first (120 and under for a 95 band)
 #   is a five-second test that saves a bake. This is basbousa in its own pan,
 #   which is on the board at 200, and it starts at 78.
 dict(id='36707708', stem='gallery/dish3-basbousa',  w=510, h=560, ax=.5, ay=.5,
      lift=0, gain=1.02, sat=0.98, warm=(1.03,1.00,0.97), vig=0.06, aim=95),
 #   REPLACED: 17255884 pinned at the gamma FLOOR (42.3 against 95) and was
 #   shot on a saturated red seamless — the only pure red anywhere on a site
 #   whose one colour is #FFCA2A. Two reasons, either sufficient.
 dict(id='6262168',  stem='gallery/dish4-kunafa',    w=445, h=560, ax=.5, ay=.5,
      lift=0, gain=1.02, sat=1.00, warm=(1.02,1.00,0.98), vig=0.06, aim=95),
 dict(id='30500752', stem='gallery/dish5-burger',    w=563, h=560, ax=.5, ay=.5,
      lift=0, gain=1.04, sat=1.00, warm=(1.03,1.00,0.97), vig=0.06, aim=95),
 #   REPLACED: 19141541, whose wings read pale and underdone at tile size. It
 #   is a good frame at full size and moved to menu-arabic. A marquee tile has
 #   one job and it is to look like something you would order.
 dict(id='36989868', stem='gallery/dish6-wings',     w=564, h=560, ax=.5, ay=.5,
      lift=0, gain=1.02, sat=0.98, warm=(1.03,1.00,0.97), vig=0.06, aim=95),
 dict(id='37322776', stem='gallery/dish7-shawarma',  w=637, h=560, ax=.5, ay=.5,
      lift=0, gain=1.02, sat=0.98, warm=(1.02,1.00,0.98), vig=0.06, aim=95),
 dict(id='14662100', stem='gallery/dish8-milkshake', w=450, h=560, ax=.5, ay=.5,
      lift=0, gain=1.02, sat=0.98, warm=(1.03,1.00,0.97), vig=0.06, aim=95),
 dict(id='7353388',  stem='gallery/dish9-masala',    w=306, h=560, ax=.5, ay=.5,
      lift=0, gain=1.02, sat=1.00, warm=(1.03,1.00,0.97), vig=0.06, aim=95),
]


def vignette(im, strength):
    """Radial darkening as an L-mask, multiplied in. Elliptical, so the falloff
    reaches the short and long edges at the same rate whatever the aspect."""
    if strength <= 0:
        return im
    w, h = im.size
    mask = Image.new('L', (w, h), 0)
    px = mask.load()
    cx, cy = w / 2.0, h / 2.0
    for y in range(h):
        dy = (y - cy) / cy
        for x in range(w):
            dx = (x - cx) / cx
            r = (dx * dx + dy * dy) ** 0.5 / (2 ** 0.5)
            t = max(0.0, (r - 0.45) / 0.55) ** 1.6
            px[x, y] = int(255 * (1.0 - strength * min(1.0, t)))
    mask = mask.filter(ImageFilter.GaussianBlur(max(4, w / 40)))
    return Image.composite(im, Image.new('RGB', (w, h), (0, 0, 0)), mask)


def mean_luma(im):
    h = im.convert('L').histogram()
    return sum(i * n for i, n in enumerate(h)) / sum(h)


def gamma(im, g):
    return im.point([min(255, int(round(255.0 * (v / 255.0) ** g))) for v in range(256)] * 3)


GAMMA_LO, GAMMA_HI = 0.25, 3.2


def solve_gamma(im, aim):
    """Bisect for the gamma landing this frame's mean on `aim`. See the
    docstring for why gamma rather than a linear gain in THIS direction: a
    gain cannot clip when it scales down, so the old argument is spent, but a
    gain also takes the lamps down with the room, and a dark restaurant frame
    is exactly a bright lamp over a dark room."""
    lo, hi = GAMMA_LO, GAMMA_HI
    for _ in range(40):
        mid = (lo + hi) / 2
        if mean_luma(gamma(im, mid)) > aim:      # larger gamma darkens
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2


# Re-baking one frame does not require the other 26 sources on disk.
ONLY = set(sys.argv[3:])
if ONLY:
    F = [f for f in F if f['stem'] in ONLY]
    print(f"filtered to {len(F)} frame(s): {', '.join(f['stem'] for f in F)}")

pinned = []
print(f"{'src':>9}  {'stem':<28}{'size':>11}  luma          gamma  corner/centre")
for f in F:
    src = Image.open(os.path.join(SRC, f"cand-{f['id']}.jpg")).convert('RGB')
    W, H = src.size
    ar = f['w'] / f['h']

    if W / H > ar:                      # source too wide: take a full-height slice
        cw = int(round(H * ar)); ch = H
    else:                               # source too tall: take a full-width slice
        cw = W; ch = int(round(W / ar))
    x0 = int(round((W - cw) * f['ax'])); y0 = int(round((H - ch) * f['ay']))
    im = src.crop((x0, y0, x0 + cw, y0 + ch))
    before = mean_luma(im)

    # Black point first: raising the floor after contrast greys the whole
    # frame, raising it before leaves the highlights where they were.
    lo = f['lift']
    im = im.point([min(255, int(lo + (255 - lo) * (v / 255.0))) for v in range(256)] * 3)
    im = ImageEnhance.Contrast(im).enhance(f['gain'])
    im = ImageEnhance.Color(im).enhance(f['sat'])
    r, g, b = f['warm']
    im = im.point([min(255, int(v * r)) for v in range(256)] +
                  [min(255, int(v * g)) for v in range(256)] +
                  [min(255, int(v * b)) for v in range(256)])
    im = vignette(im, f['vig'])

    # Exposure last, and after the vignette: the vignette removes light, and
    # solving ahead of it lands every frame on the same mean and then takes a
    # different amount back out of each.
    gm = solve_gamma(im, f['aim'])
    im = gamma(im, gm)
    im = im.resize((f['w'], f['h']), Image.LANCZOS)

    os.makedirs(os.path.dirname(os.path.join(OUT, f['stem'] + '.png')), exist_ok=True)
    im.save(os.path.join(OUT, f['stem'] + '.png'))

    got = mean_luma(im)
    # A frame that cannot reach its band does not belong in it. In THIS
    # direction the ceiling is what bites, not the floor.
    if gm > GAMMA_HI - 0.02 or gm < GAMMA_LO + 0.01:
        pinned.append((f['stem'], f['id'], before, got, f['aim'], gm))

    bw = max(8, int(f['w'] * .10)); bh = max(8, int(f['h'] * .10))
    corner = mean_luma(im.crop((0, 0, bw, bh)))
    centre = mean_luma(im.crop((f['w']//2 - bw, f['h']//2 - bh, f['w']//2 + bw, f['h']//2 + bh)))
    print(f"{f['id']:>9}  {f['stem']:<28}{f['w']:5d}x{f['h']:<5d} "
          f"{before:5.1f} -> {got:5.1f} (aim {f['aim']:3d})  {gm:4.2f}   "
          f"{corner:5.1f}/{centre:5.1f}")

if pinned:
    print("\nPINNED AT A GAMMA LIMIT — these did not reach their band:")
    for stem, sid, b4, got, aim, gm in pinned:
        print(f"  {stem:<28} pexels {sid:<10} {b4:5.1f} -> {got:5.1f} against {aim:3d}  (gamma {gm:.2f})")
    print("  A frame that cannot reach its band does not belong in it. Replace")
    print("  the SOURCE rather than bending the aim — see the docstring.")

# The hero carries type. Report the band the wordmark actually sits in, because
# the whole-frame mean is not what a reader is judging contrast against.
if any(f['stem'] == 'lp-hero' for f in F):
    hero = Image.open(os.path.join(OUT, 'lp-hero.png'))
    w, h = hero.size
    band = hero.crop((int(w * .06), int(h * .62), int(w * .52), int(h * .94)))
    print(f"\nlp-hero wordmark band (x 6-52%, y 62-94%): mean {mean_luma(band):.1f}"
          f"\n   -- the type here is WHITE again, so this wants to be LOW and even."
          f"\n   -- judge it on the worst 12px tile with shoot-hero-mobile.mjs, never on this mean.")
