#!/usr/bin/env python3
"""Bake every photograph on the Crave site from its Pexels source.

Reproduce, end to end, from the project root:

    SRC=/tmp/crave-src && mkdir -p $SRC
    node fetch-pexels.mjs $SRC 4450327 30211369 33310140 5865422 5865314 \
        16556114 18752152 30919070 2196685 35667656 17086289 39704886 \
        35727834 27818209 34017081 9840182 39433058 10135114 28525208 \
        6510297 5317627 38392020 33253821 37107097 15030594 6463666
    for f in $SRC/raw-*.bin; do id=${f#*raw-}; id=${id%.bin}; \
        sips -s format jpeg "$f" --out "$SRC/cand-$id.jpg"; done
    python3 bake-crave-photography.py $SRC /tmp/crave-out

The sips step is not optional: Pexels honours Chrome's Accept header, so what
fetch-pexels.mjs lands is AVIF whatever the .jpeg in the URL says.

HARVESTING THE IDS NEEDS A REAL BROWSER. pexels.com search is behind a
Cloudflare challenge that headless Chrome does not clear — it returns a "Just
a moment..." page with two links on it and no photographs, which reads as
"this query has no results". images.pexels.com is NOT challenged, so
fetch-pexels.mjs still works headless; only the search does not.

EVERY FRAME HERE IS A PLACEHOLDER and is flagged as one in the markup. Crave's
own photography is not available at usable resolution or licence; these are
stock frames chosen to match dishes that are actually on Crave's menu.
Whatever replaces them needs the property named in each entry's comment and
nothing else.

BANDS — AND THEY ARE THE INVERSE OF THE SET THIS REPLACES. The previous
restaurant was a dark evening dining room and every band was built for a lit
subject in an unlit space: hero 44, plate 37, chapters 62-84. Crave is a
daylight cafe that opens at six in the morning. Its own header photograph
measures mean 130.9 of 255, with a warm sand and greige palette.

    hero           138        bright room, DARK type over it
    counter        145        the pill frame on index
    reserve        150        a laid table in daylight
    about opening  140
    about plate    120        full bleed, nothing on it
    chapters       145        lit rooms, food in daylight
    experience     160        white plates and pale counters
    midnight        95        the ONE dark band, and it is earned
    contact hero   135        no baked vignette; see below
    gallery tiles  130        a marquee on a near-white ground

A BRIGHT FRAME IS THE HARDER GROUND FOR TYPE, NOT THE EASIER ONE. A dark
frame's worst case under white type is a lamp at 250, which a grade can pull
back. A bright frame's worst case under dark type is a blown highlight at 255,
which has no headroom left in it at all. Judge the hero on its worst 12px
tile, never on the mean, and use shoot-hero-mobile.mjs to do it.

THE VIGNETTES ARE MOSTLY GONE, and that follows from the same inversion. A
vignette darkens the corners, which on a dark frame concentrates the eye and
on a bright one reads as a dirty lens. Where it survives it is a tenth of what
it was. On `crave-hero` it is ZERO: the wordmark sits in the lower left, the
type is dark, and darkening that corner is the one thing that would break it.

Two frames still break the usual rule and both are deliberate:

  - `about-ic1-late` and `about-ic2-late` aim 95, far below everything else.
    They are the midnight section, and that section is about the last hour of
    an eighteen-hour day. This is the only dark band left on the site and it
    is earned by its subject rather than inherited from the old restaurant.

  - `contact-hero` bakes NO vignette, unchanged, and for a new reason: the
    frame it replaces was a dark room lit by one corner pendant, this one is a
    sunlit dining room, and in both cases a baked vignette is wrong. Its wash
    is CSS.
"""
import os, sys
from PIL import Image, ImageEnhance, ImageFilter

SRC = sys.argv[1] if len(sys.argv) > 1 else '/tmp/lis-src'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/lis-out'
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
 #   needs: a BRIGHT room with its activity OFF CENTRE, leaving the lower left
 #   calm and LIGHT enough to set dark type on. The aspect is load-bearing —
 #   1.60:1 is what every number in index.html's portrait crop was solved
 #   against, and it matches a 1440x900 viewport exactly so `cover` crops
 #   nothing there. vig=0: see the note at the top of this file.
 #   CHOSEN ON THE WORDMARK BAND, NOT ON THE ROOM. Four bright interiors were
 #   rendered at 1.60:1 with the band outlined (x 6-52%, y 62-94%) and three
 #   of them put a black chair, a dark table or a row of yellow tub chairs
 #   straight under the type. This one puts PLAIN FLOOR there — the only one
 #   of the four with a calm, even, light area where the name goes. The room's
 #   activity, a laid round table, sits right of centre, which is exactly the
 #   composition this slot has always wanted.
 dict(id='30211369', stem='crave-hero', w=1717, h=1073, ax=.42, ay=.62,
      lift=0, gain=0.98, sat=0.94, warm=(1.02,1.00,0.985), vig=0.00, aim=142),
 #   needs: a WIDE view of the room. The radius clamps to half the height, so
 #   at 2.162:1 the outer 23.1% at each end is a semicircular cap and only the
 #   middle 53.8% is full height — keep the subject in that middle.
 dict(id='4450327', stem='crave-counter', w=1536, h=710, ax=.5, ay=.52,
      lift=0, gain=1.00, sat=0.94, warm=(1.02,1.00,0.985), vig=0.08, aim=145),
 #   needs: a LAID TABLE in daylight, behind the gourd clip.
 dict(id='33310140', stem='reserve-interior', w=1400, h=1576, ax=.5, ay=.5,
      lift=0, gain=1.00, sat=0.94, warm=(1.02,1.00,0.985), vig=0.10, aim=150),
 # ---- about -----------------------------------------------------------------
 dict(id='5865422', stem='about-opening', w=2400, h=1800, ax=.5, ay=.5,
      lift=0, gain=1.02, sat=0.94, warm=(1.02,1.00,0.985), vig=0.06, aim=140),
 dict(id='5865314', stem='about-plate', w=1536, h=1024, ax=.5, ay=.5,
      lift=0, gain=1.06, sat=0.98, warm=(1.01,1.00,0.99), vig=0.12, aim=120),
 #   Chapter I - the morning. Breakfast, flat daylight, pale ground.
 dict(id='16556114', stem='about-ch1-morning', w=1100, h=1466, ax=.5, ay=.5,
      lift=0, gain=1.02, sat=0.96, warm=(1.01,1.00,0.99), vig=0.08, aim=145),
 #   Chapter II - the coast. The frame this replaces (18752152) was a lit
 #   plate on a near-black table: source mean 52.6, and solving it to this
 #   band PINNED THE GAMMA AT ITS 0.25 FLOOR and still landed at 76.7. A frame
 #   that cannot reach its band does not belong in it. This one is lobsters in
 #   daylight and gets there at 0.6.
 dict(id='6510297', stem='about-ch2-coast', w=1100, h=1466, ax=.5, ay=.5,
      lift=0, gain=1.04, sat=0.96, warm=(1.02,1.00,0.985), vig=0.08, aim=140),
 #   Chapter III - the counter. Pastry under glass.
 dict(id='30919070', stem='about-ch3-counter', w=1100, h=1466, ax=.5, ay=.5,
      lift=0, gain=1.02, sat=0.94, warm=(1.02,1.00,0.985), vig=0.08, aim=145),
 #   Chapter IV - the table.
 #   aims 158, not the band's 145: the source is already 186 and pulling it
 #   to 145 needs gamma 2.02, which crushes everything that is not a window.
 dict(id='2196685', stem='about-ch4-table', w=1100, h=1466, ax=.5, ay=.5,
      lift=0, gain=1.00, sat=0.92, warm=(1.01,1.00,0.99), vig=0.08, aim=158),
 #   35667656 was tried here and pinned at the gamma floor too, reaching
 #   149.3 against 160. This source is 20 points brighter to start with.
 dict(id='34902483', stem='about-ex1-coffee', w=1100, h=1467, ax=.5, ay=.5,
      lift=0, gain=1.02, sat=0.94, warm=(1.02,1.00,0.985), vig=0.06, aim=152),
 dict(id='17086289', stem='about-ex2-grill', w=1100, h=1467, ax=.5, ay=.5,
      lift=0, gain=1.00, sat=0.94, warm=(1.01,1.00,0.99), vig=0.06, aim=150),
 dict(id='39704886', stem='about-ex3-sweet', w=1100, h=1467, ax=.5, ay=.5,
      lift=0, gain=1.02, sat=0.96, warm=(1.01,1.00,0.99), vig=0.06, aim=150),
 #   THE MIDNIGHT PAIR. 95, not the 145 everything around them sits at. This
 #   is the page's closing beat and it is about the last hour of the day; a
 #   bright frame here would be re-grading the subject away. They are the only
 #   dark band left on the site.
 dict(id='35727834', stem='about-ic1-late', w=1100, h=1466, ax=.5, ay=.5,
      lift=0, gain=1.08, sat=0.94, warm=(1.03,1.00,0.97), vig=0.22, aim=95),
 #   the only landscape frame on the site, and that is what stops the pair
 #   reading as a pair rather than as two depth planes.
 dict(id='27818209', stem='about-ic2-late', w=1200, h=900, ax=.5, ay=.42,
      lift=0, gain=1.06, sat=0.92, warm=(1.03,1.00,0.97), vig=0.20, aim=95),
 # ---- menu.html's opening frames --------------------------------------------
 # DEDICATED FILES, not the marquee tiles. The tiles are 560px tall, built for
 # a marquee, and these frames paint into a 3:4 portrait slot needing up to
 # 683 device px. At 900x1200 they paint at x0.7 and under.
 dict(id='34017081', stem='menu-grill', w=900, h=1200, ax=.5, ay=.5,
      lift=0, gain=1.04, sat=0.96, warm=(1.01,1.00,0.99), vig=0.10, aim=138),
 dict(id='9840182', stem='menu-breakfast', w=900, h=1200, ax=.5, ay=.5,
      lift=0, gain=1.02, sat=0.94, warm=(1.01,1.00,0.99), vig=0.10, aim=145),
 dict(id='39433058', stem='menu-seafood', w=900, h=1200, ax=.5, ay=.5,
      lift=0, gain=1.02, sat=0.92, warm=(1.01,1.00,0.99), vig=0.10, aim=145),
 # ---- contact ---------------------------------------------------------------
 #   NO VIGNETTE, unchanged from the frame it replaces but for the opposite
 #   reason: that one was lit by a single corner pendant and a vignette put the
 #   lamp out; this one is a sunlit room and a vignette would dirty it.
 dict(id='10135114', stem='contact-hero', w=2000, h=1333, ax=.5, ay=.46,
      lift=0, gain=1.02, sat=0.92, warm=(1.02,1.00,0.985), vig=0.00, aim=135),
 # ---- the marquee ------------------------------------------------------------
 # Widths are the nine the row already had. Keeping them means .beyond__track
 # keeps its measured width and the marquee's percentage translate is untouched.
 #
 # THE TWO DARKEST SOURCES CARRY A LIFT AND THE OTHERS DO NOT. dish5 starts at
 # 47.7 and dish8 at 54.5; reaching the band from there on gamma alone needs
 # 0.26 and 0.34, which lands the mean but opens the shadows into grey. Raising
 # the black point FIRST does the same job without spending the whole curve on
 # it. Lift before contrast, never after — see the note in the loop below.
 dict(id='28525208', stem='gallery/dish1-fries',     w=856, h=560, ax=.5, ay=.5,
      lift=0, gain=1.04, sat=1.00, warm=(1.02,1.00,0.985), vig=0.06, aim=135),
 dict(id='39433058', stem='gallery/dish2-prawns',    w=671, h=560, ax=.5, ay=.5,
      lift=0, gain=1.02, sat=1.00, warm=(1.01,1.00,0.99), vig=0.06, aim=135),
 dict(id='5317627',  stem='gallery/dish3-pancakes',  w=510, h=560, ax=.5, ay=.5,
      lift=0, gain=1.02, sat=0.98, warm=(1.02,1.00,0.985), vig=0.06, aim=135),
 dict(id='38392020', stem='gallery/dish4-waffle',    w=445, h=560, ax=.5, ay=.5,
      lift=0, gain=1.02, sat=1.00, warm=(1.02,1.00,0.985), vig=0.06, aim=135),
 dict(id='33253821', stem='gallery/dish5-burger',    w=563, h=560, ax=.5, ay=.5,
      lift=16, gain=1.04, sat=1.00, warm=(1.02,1.00,0.985), vig=0.06, aim=135),
 dict(id='37107097', stem='gallery/dish6-wings',     w=564, h=560, ax=.5, ay=.5,
      lift=0, gain=1.02, sat=0.98, warm=(1.02,1.00,0.985), vig=0.06, aim=135),
 dict(id='34017081', stem='gallery/dish7-steak',     w=637, h=560, ax=.5, ay=.5,
      lift=0, gain=1.02, sat=0.98, warm=(1.01,1.00,0.99), vig=0.06, aim=135),
 dict(id='15030594', stem='gallery/dish8-cheesecake',w=450, h=560, ax=.5, ay=.5,
      lift=12, gain=1.02, sat=0.98, warm=(1.02,1.00,0.985), vig=0.06, aim=135),
 dict(id='6463666',  stem='gallery/dish9-shake',     w=306, h=560, ax=.5, ay=.5,
      lift=0, gain=1.02, sat=1.00, warm=(1.02,1.00,0.985), vig=0.06, aim=135),
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


def solve_gamma(im, aim):
    """Bisect for the gamma landing this frame's mean on `aim`. Gamma rather
    than a linear gain because a gain clips, and these frames have their room
    in the shadows, not the highlights."""
    lo, hi = 0.25, 3.2
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

    bw = max(8, int(f['w'] * .10)); bh = max(8, int(f['h'] * .10))
    corner = mean_luma(im.crop((0, 0, bw, bh)))
    centre = mean_luma(im.crop((f['w']//2 - bw, f['h']//2 - bh, f['w']//2 + bw, f['h']//2 + bh)))
    print(f"{f['id']:>9}  {f['stem']:<28}{f['w']:5d}x{f['h']:<5d} "
          f"{before:5.1f} -> {mean_luma(im):5.1f} (aim {f['aim']:3d})  {gm:4.2f}   "
          f"{corner:5.1f}/{centre:5.1f}")

# The hero carries type. Report the band the wordmark actually sits in, because
# the whole-frame mean is not what a reader is judging contrast against.
if any(f['stem']=='crave-hero' for f in F):
 hero = Image.open(os.path.join(OUT, 'crave-hero.png'))
 w, h = hero.size
 band = hero.crop((int(w * .06), int(h * .62), int(w * .52), int(h * .94)))
 print(f"\ncrave-hero wordmark band (x 6-52%, y 62-94%): mean {mean_luma(band):.1f}"
       f"   -- the type here is DARK, so this wants to be HIGH and even.")
