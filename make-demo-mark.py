"""Draws the demo brand's emblem. Reproduce:  python3 make-demo-mark.py

   WHY THIS IS DRAWN RATHER THAN TRACED. make-lapranzo-mark.py thresholds the
   real client's artwork, because that artwork exists and is theirs. The demo
   brand has no logo and must not borrow one: the Kufic ring on the client
   build is La Pranzo's identity, and shipping it on a site sent to two
   hundred other restaurants would be the same error as a stock photograph
   with somebody else's name legible in it.

   So the demo emblem is GEOMETRY, not a logotype. A ring broken at the top
   and bottom with two dots on the horizontal — deliberately the same
   structure bake-favicons.mjs already solved for the 16px icon, so the mark
   and the icon set agree with each other instead of being two drawings.

   It carries NO letters. A wordmark built into an emblem is a lockup, and
   inventing one for a brand that does not exist would be inventing the one
   thing a prospect is meant to replace. LA PRANZO / MEZANI is set as type
   beside the mark by the page, exactly as before.

   ALPHA-ONLY AND 512px, which is the shipping spec the client mask already
   meets: a CSS mask-image reads the alpha channel and throws the colour
   away, so three channels of solid white are three channels of wasted
   bytes. 1024 with RGB measured 160K on this project and 512 alpha-only 47K.

   The proportions are a share of the box, never pixels, so the same numbers
   render any size:
     radius 0.355   ring centreline
     stroke 0.034   ring weight
     gap    18deg   each side of the HORIZONTAL, which breaks the ring into
                    an upper and a lower arc rather than leaving a circle
     dot    0.034   centred IN each gap, on the ring's own radius, so the
                    dots punctuate the breaks instead of sitting mid-arc
"""
from PIL import Image, ImageDraw
import math

BOX, SS = 512, 8                      # supersample, then downsample once
N = BOX * SS

R      = 0.355 * N
STROKE = 0.034 * N
GAP    = 18.0                         # degrees, half-gap each side of horizontal
DOT    = 0.034 * N
C      = N / 2.0

img  = Image.new("L", (N, N), 0)
draw = ImageDraw.Draw(img)

bbox = [C - R, C - R, C + R, C + R]

# Two arcs. PIL measures degrees clockwise from 3 o'clock, so the right-hand
# arc spans the gap at 0deg and the left-hand one the gap at 180deg.
draw.arc(bbox, start=GAP,       end=180 - GAP, fill=255, width=int(STROKE))
draw.arc(bbox, start=180 + GAP, end=360 - GAP, fill=255, width=int(STROKE))

# The two dots sit ON the ring's centreline, centred in the gaps the arcs
# leave at 3 and 9 o'clock. Mid-arc they read as bumps, not as dots.
for ang in (0, 180):
    x = C + R * math.cos(math.radians(ang))
    y = C + R * math.sin(math.radians(ang))
    draw.ellipse([x - DOT, y - DOT, x + DOT, y + DOT], fill=255)

img = img.resize((BOX, BOX), Image.LANCZOS)

# Alpha-only: an L-mode image written as the alpha of a fully transparent
# RGBA would double the file for nothing, so write it as LA — two channels,
# and the L is ignored by a mask.
out = Image.merge("LA", (Image.new("L", (BOX, BOX), 255), img))
out.save("brand_assets/demo-mark-512.png", optimize=True)

ink = sum(1 for p in img.get_flattened_data() if p > 127) / float(BOX * BOX)
print("brand_assets/demo-mark-512.png  %dx%d  ink %.1f%% of frame" % (BOX, BOX, ink * 100))
