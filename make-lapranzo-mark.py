#!/usr/bin/env python3
"""Cut La Pranzo's mark out of its own logo tile as a white alpha silhouette.

    python3 make-lapranzo-mark.py
        -> brand_assets/lapranzo-mark.png        the ring alone, 1024, alpha
        -> brand_assets/lapranzo-mark-full.png   ring AND lettering, 1024, alpha

THIS IS NOT A RECONSTRUCTION, AND THAT IS THE WHOLE POINT. Crave's mark was a
four-fold symmetric scalloped plaque, so one quadrant could be traced and
mirrored twice and the result checked against the original to a mean boundary
error of 0.88px. La Pranzo's emblem is an IRREGULAR abstract Kufic ring with
no symmetry anywhere in it, and the only artwork obtainable is 536x395. A
Bezier fit to that would be a confident-looking bad trace, which is worse than
no trace at all, so nothing is fitted here: the real pixels are thresholded
and shipped as they are.

WHAT MAKES THAT AFFORDABLE IS THE DARK GROUND. The site went near-black on
2026-09-30, and the logo's own field is black, so the artwork no longer has to
be lifted off its tile and re-drawn to sit on the page — only separated from
it. An alpha cutout of a pure white mark on a pure black field is a threshold,
not a trace.

THE TILE IS GENUINELY MONOCHROME, measured rather than assumed: ground
rgb(22.4, 22.4, 22.4) at chroma 0.03, mark rgb(246.2, 246.2, 244.3) at chroma
1.87. Both are grey to within two levels. That is the single most useful thing
about this identity and it is what lets one file serve every ground.

THE LETTERING COMES OUT BY COMPONENT, NOT BY BAND, and trying it the other way
is the trap. "La Pranzo & Al-Diwan" sits at y 184-209 and "Fast Food & Cafe" at
y 237-249, which looks like a clean horizontal band to cut — but the lower arc
of the ring passes THROUGH those rows at both sides, so a band cut takes two
wings of the ring with it. Labelled instead, the separation is total: every
letter is 317px or smaller, every ring part is 456px or larger, and the one
large component that lies inside the band (695px at x 365-439) is a ring wing
rather than a glyph. The rule is therefore area-inside-the-band, and it has
~2x of margin on both sides of the cut.

WHY THE RING SHIPS WITHOUT THE LETTERING, as Crave's plaque did: at the size
the hero mark actually paints — 72 to 124px — the wordmark inside the ring is
under two pixels tall and reads as a smear. The name is set as TYPE beside the
mark instead, where it can be hinted, coloured and measured. The full version
is kept for the large icons, where iOS and Android render at 180px and up and
the lettering is legible.

THE MARK IS WHITE, NOT currentColor, and that is the one thing lost against a
vector. A raster cannot be re-coloured by CSS. It does not matter yet, because
every place the mark appears is a dark ground and white is correct on all of
them — but it is the first thing that will bite if a light surface is ever
added, and `mask-image` with `background: currentColor` is the way out when it
does. ASK THE CLIENT FOR VECTOR ARTWORK; it is the second item on the list in
the rebrand spec, above everything except re-reading the prices.
"""
import os
import numpy as np
from collections import deque
from PIL import Image

SRC = 'brand_assets/lapranzo-logo-official-536.png'
OUT = 1024
BAND = (178, 262)      # the rows the two lettering lines live in
LETTER_MAX = 400       # biggest glyph is 317px; smallest ring part in the band is 695
INK = 120              # the tile is monochrome; anything between the two peaks works

im = Image.open(SRC).convert('RGB')
a = np.asarray(im).astype(int)
L = 0.2126 * a[:, :, 0] + 0.7152 * a[:, :, 1] + 0.0722 * a[:, :, 2]
H, W = L.shape
mx, mn = a.max(2), a.min(2)

gnd, mrk = L < 60, L > 170
print(f"tile {W}x{H}   ground rgb {a[gnd].mean(0).round(1)} chroma {(mx-mn)[gnd].mean():.2f}"
      f"   mark rgb {a[mrk].mean(0).round(1)} chroma {(mx-mn)[mrk].mean():.2f}")

ink = L > INK
lab = -np.ones((H, W), int)
comps = []
for sy in range(H):
    for sx in range(W):
        if ink[sy, sx] and lab[sy, sx] < 0:
            cid = len(comps)
            q = deque([(sy, sx)]); lab[sy, sx] = cid
            ys, xs = [], []
            while q:
                y, x = q.popleft(); ys.append(y); xs.append(x)
                for dy in (-1, 0, 1):
                    for dx in (-1, 0, 1):
                        ny, nx = y + dy, x + dx
                        if 0 <= ny < H and 0 <= nx < W and ink[ny, nx] and lab[ny, nx] < 0:
                            lab[ny, nx] = cid; q.append((ny, nx))
            comps.append(dict(n=len(ys), y0=min(ys), y1=max(ys)))

letters = {i for i, c in enumerate(comps)
           if BAND[0] <= c['y0'] and c['y1'] <= BAND[1] and c['n'] < LETTER_MAX}
# The margin that matters is measured INSIDE THE BAND, which is the only place
# the rule applies. Comparing every dropped component against every kept one
# reports 0.60x and reads like a failure — but the 190px component that makes
# it is a ring part well outside the band, never a candidate for the cut.
in_band = [c for c in comps if BAND[0] <= c['y0'] and c['y1'] <= BAND[1]]
glyphs = [c['n'] for c in in_band if c['n'] < LETTER_MAX]
wings  = [c['n'] for c in in_band if c['n'] >= LETTER_MAX]
print(f"{len(comps)} components: {len(letters)} lettering, {len(comps)-len(letters)} ring")
print(f"   inside the band: largest glyph {max(glyphs)}px, smallest ring part "
      f"{min(wings)}px  -> {min(wings)/max(glyphs):.2f}x of margin across the cut")


def emit(mask, path):
    ys, xs = np.where(mask)
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    # square about the ink's own centre, with 4% of air so nothing touches the
    # edge — an icon masked to a circle loses whatever sits on the boundary.
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    half = max(x1 - x0, y1 - y0) / 2 * 1.04
    box = (int(round(cx - half)), int(round(cy - half)),
           int(round(cx + half)), int(round(cy + half)))
    alpha = Image.fromarray((mask * 255).astype(np.uint8))
    # The mark is white everywhere; only the alpha carries the shape.
    white = Image.new('RGB', im.size, (255, 255, 255))
    out = Image.new('RGBA', im.size)
    out.paste(white, (0, 0)); out.putalpha(alpha)
    out = out.crop(box).resize((OUT, OUT), Image.LANCZOS)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    out.save(path)
    al = np.asarray(out)[:, :, 3]
    print(f"  {path}  {out.size}  opaque {100*(al>247).mean():5.1f}%"
          f"  transparent {100*(al<8).mean():5.1f}%")


ring = np.isin(lab, list(letters), invert=True) & ink
emit(ring, 'brand_assets/lapranzo-mark.png')
emit(ink,  'brand_assets/lapranzo-mark-full.png')

# THE SMALL ICON IS A DIFFERENT DRAWING, not the same one scaled, and that was
# true of Crave's plaque too — it thickened its stroke from 5.2/100 to 10.6.
# A raster cannot be re-stroked, so the equivalent move is to DILATE the alpha.
# Measured on this ring: the thinnest arm is 18px at 1024, which is 0.28px at
# a 16px favicon and disappears. A 3px dilation at 1024 takes it to 24px and
# 0.38px, which is still nothing; the useful figure is what survives the
# downscale, so the dilation is set by rendering at 16 and looking, not by
# arithmetic on the source.
from PIL import ImageFilter
bold = Image.fromarray((ring * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(9))
emit(np.asarray(bold) > 127, 'brand_assets/lapranzo-mark-bold.png')

# THE SHIPPING MASK, and it is a THIRD of the file the pages first carried.
# index.html and contact.html paint this through `mask-image`, so it is
# fetched on every visit to either — and at 1024 with an RGB channel it was
# 160K, which perf.mjs reported as 180K of "img:legacy" on exactly those two
# pages and nowhere else. Two cuts, neither of which touches the shape:
#   · 512 instead of 1024. The mark paints at 124 CSS px on index (372 device
#     px at 3x) and at 16 x --tu on contact, where it is a 5%-alpha whisper.
#   · 'LA' instead of 'RGBA'. A mask reads the ALPHA CHANNEL ONLY, so three
#     channels of solid white were being shipped to be thrown away.
# 160K -> 47K. The 1024 RGBA files stay in brand_assets as the masters the
# icons render from, where the resolution is actually used.
master = Image.open('brand_assets/lapranzo-mark.png').resize((512, 512), Image.LANCZOS)
Image.merge('LA', (Image.new('L', master.size, 255), master.getchannel('A'))) \
     .save('brand_assets/lapranzo-mask-512.png', optimize=True)
print(f"  brand_assets/lapranzo-mask-512.png  (512, 512)  "
      f"{os.path.getsize('brand_assets/lapranzo-mask-512.png')/1024:.1f}K  alpha-only, the shipping mask")
