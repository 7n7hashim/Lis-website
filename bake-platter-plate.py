#!/usr/bin/env python3
"""Bake the turning plate on index.html's dish section — an alpha cutout.

Reproduce, from the project root:

    node -e "...fetch pexels 10802299 at h=3000..."   # see fetch-pexels.mjs
    sips -s format jpeg $SRC/raw-hi-10802299.bin --out $SRC/hi-10802299.jpg
    python3 bake-platter-plate.py $SRC/hi-10802299.jpg /tmp/crave-out/platter-plate.png
    node bake-png-to-webp.mjs /tmp/crave-out/platter-plate.png assets/img/platter-plate.webp 0.92

Pexels 32986475: a round decorated metal platter of rice and lamb seen from
directly overhead on a plain pale ground. Mandi is on La Pranzo's board three
ways in mutton and six in chicken, and the mix grilled platter above it is the
most expensive thing the kitchen sells.

THIS SOURCE WAS CHOSEN FOR ITS GEOMETRY, NOT ITS FOOD. Four overhead seafood
frames were rendered side by side; three had the plate held in a hand, shot at
an angle, or sitting on a patterned cloth. This one is the only one that is
circular, centred and on a ground the border flood can actually reach.

THREE THINGS DECIDE WHETHER THIS FILE WORKS, and all three are about the fact
that the finished element TURNS:

1.  THE PLATE'S CENTRE MUST BE THE FILE'S CENTRE. Anything else and the plate
    orbits instead of spinning. The rim is fitted, not eyeballed, and the square
    is cut about that fit.

2.  THE PLATE MUST BE CIRCULAR. Any ellipse in the source wobbles once per
    revolution, which reads as a broken animation rather than as a photograph.
    The measured ry/rx is corrected by scaling y; the figure is printed below
    so a replacement can be judged on it.

3.  THE CUT IS AT THE RIM, WITH NOTHING OF THE SURFACE LEFT ON IT. An earlier
    plate on this site was fitted to the wrong boundary and carried up to 52px
    of the pale surface it stood on as opaque pixels — invisible on cream, a
    light crescent on a warm ground, and because the plate turns, it orbited.
    The silhouette here is taken from a flood of the GROUND inward from the
    border rather than from a colour threshold on the plate, so the boundary is
    the real one, and it is then eroded by 2px before feathering.

THE GROUND THRESHOLD IS PER SOURCE, AND THE FIRST CANDIDATE HERE PROVED IT
THE HARD WAY. Pexels 7426867 — the mandi platter that ships as about-plate —
is geometrically perfect for this job: round, centred, overhead, margin all
round. It is shot on DARK wood, so the test inverts, and swept against the
ellipse fit the best it ever scored was 0.947 at L<90/sat<65. The reason is
the failure this docstring already warned about: the plate's rim is a thin
metal ring that falls into SHADOW along its lower edge, the shadow reads as
ground, and the flood walks through the rim and eats the plate. A dark ground
under a dark-rimmed plate has no boundary to find.

This source is on a pale ground (edge mean L 229), so the test runs the
original way round. Swept at the working resolution: L>190/sat<26 scores fill
0.991 and ry/rx 0.9757. Measure before changing the source, and prefer a PALE
plain ground over a handsome dark one — the cutout needs separation at the
rim, not atmosphere.

A pale plate centre reads as ground to any brightness test — it is bright and
desaturated, exactly like the surface. It survives only because the rim encloses
it and the border flood cannot reach it. Do not replace the flood with a
threshold.
"""
import sys, math
import numpy as np
from collections import deque
from PIL import Image, ImageFilter

SRC = sys.argv[1] if len(sys.argv) > 1 else '/tmp/crave-src/hi-10802299.jpg'
DST = sys.argv[2] if len(sys.argv) > 2 else '/tmp/crave-out/platter-plate.png'
OUT = 1122                      # the size the markup and the ladder expect

im = Image.open(SRC).convert('RGB')
# Work at 2400px, not the source's 5332. Still more than twice the 1122 the
# file ships at, so nothing is lost at the rim — and the morphological close
# below is O(r^2) per pixel, which at full resolution takes minutes.
if im.width > 2400:
    im = im.resize((2400, round(im.height * 2400 / im.width)), Image.LANCZOS)
a = np.asarray(im).astype(int)
H, W, _ = a.shape
mx, mn = a.max(2), a.min(2)
L = 0.2126 * a[:, :, 0] + 0.7152 * a[:, :, 1] + 0.0722 * a[:, :, 2]
# SOLVED, NOT CHOSEN. Swept together against the ellipse fit below at the
# working resolution: L>190/sat<26 scores fill 0.991 and ry/rx 0.9757. Loosening
# the saturation ceiling to 40 drops the fill to 0.961 — the platter's painted
# rim pattern starts being admitted as ground. The floor is insensitive here
# (150 through 196 all score 0.98+) because the ground is a clean pale sweep;
# the CEILING is the term that matters on a decorated plate.
ground = (L > 190) & ((mx - mn) < 26)

# CLOSE THE GROUND BEFORE FLOODING. The grain leaves speckles of not-ground
# scattered over the board, and a chain of them BRIDGES the plate to the frame
# edge: the flood then stops at the bridge, the plate's component grows out
# along it, and the fit comes back as a 452x318 blob at fill 0.65. A close
# (dilate then erode) removes any speckle narrower than its kernel and leaves
# the plate's own rim where it was. Same parameters, no close: 0.671.
_k = 11                                  # odd, ~1/220 of the working width
_g = Image.fromarray((ground * 255).astype(np.uint8))
ground = np.asarray(_g.filter(ImageFilter.MaxFilter(_k))
                      .filter(ImageFilter.MinFilter(_k))) > 127

# Flood the ground inward from the border. What it cannot reach is either an
# object or an interior enclosed by one — which is what saves the white centre.
reached = np.zeros(ground.shape, bool)
q = deque()
for x in range(W):
    for y in (0, H - 1):
        if ground[y, x] and not reached[y, x]:
            reached[y, x] = True; q.append((y, x))
for y in range(H):
    for x in (0, W - 1):
        if ground[y, x] and not reached[y, x]:
            reached[y, x] = True; q.append((y, x))
while q:
    y, x = q.popleft()
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        ny, nx = y + dy, x + dx
        if 0 <= ny < H and 0 <= nx < W and ground[ny, nx] and not reached[ny, nx]:
            reached[ny, nx] = True; q.append((ny, nx))
obj = ~reached

# The plate component. This frame holds one plate and it is near-centred; the
# fitted bounding box centres on (0.487, 0.481) of the frame.
seed = (int(H * 0.481), int(W * 0.487))
assert obj[seed], "seed landed on ground — check the source frame"
lab = np.zeros(obj.shape, bool); q = deque([seed]); lab[seed] = True
while q:
    y, x = q.popleft()
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        ny, nx = y + dy, x + dx
        if 0 <= ny < H and 0 <= nx < W and obj[ny, nx] and not lab[ny, nx]:
            lab[ny, nx] = True; q.append((ny, nx))

ys, xs = np.where(lab)
x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
rx, ry = (x1 - x0) / 2, (y1 - y0) / 2
fill = lab.sum() / (math.pi * rx * ry)
print(f"plate  centre ({cx:.1f},{cy:.1f})  rx {rx:.1f} ry {ry:.1f}  "
      f"ry/rx {ry/rx:.4f}  ellipse fill {fill:.3f}")
assert fill > 0.97, "silhouette is not an ellipse — the flood leaked"

# Circularise on y, about the plate centre.
k = rx / ry
newH = int(round(H * k))
im_c = im.resize((W, newH), Image.LANCZOS)
mask = Image.fromarray((lab * 255).astype(np.uint8)).resize((W, newH), Image.LANCZOS)
cy_c, r = cy * k, rx
print(f"circularised  y x{k:.4f}  centre ({cx:.1f},{cy_c:.1f})  r {r:.1f}")

# Erode 2px, then feather by one, so the turning edge has no staircase and no
# pale rind from the surface.
m = np.asarray(mask).astype(np.uint8)
m = np.asarray(Image.fromarray(m).filter(ImageFilter.MinFilter(5)))
mask = Image.fromarray(m).filter(ImageFilter.GaussianBlur(1.0))

# Square about the fitted centre. 1.5% of margin so the feathered edge is not
# itself clipped by the frame.
half = int(round(r * 1.015))
box = (int(round(cx - half)), int(round(cy_c - half)),
       int(round(cx + half)), int(round(cy_c + half)))
pad_l, pad_t = max(0, -box[0]), max(0, -box[1])
im_c = im_c.crop(box); mask = mask.crop(box)
out = Image.new('RGBA', im_c.size)
out.paste(im_c.convert('RGB'), (0, 0))
out.putalpha(mask)
out = out.resize((OUT, OUT), Image.LANCZOS)
out.save(DST)

al = np.asarray(out)[:, :, 3]
print(f"written {DST}  {out.size}  transparent {100*(al<8).mean():.1f}%  "
      f"opaque {100*(al>247).mean():.1f}%")
# The plate must reach the frame edge symmetrically or it orbits.
c = OUT // 2
for name, row in (('mid row', al[c, :]), ('mid col', al[:, c])):
    on = np.where(row > 127)[0]
    print(f"  {name}: opaque {on.min()}..{on.max()}  centre {(on.min()+on.max())/2:.1f} (want {c})")
