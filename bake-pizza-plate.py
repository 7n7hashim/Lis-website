"""The demo's turning plate: a whole pizza, cut out as a FITTED CIRCLE.

   Reproduce:
     FETCH_H=3000 node fetch-pexels.mjs $SRC 33592996
     sips -s format jpeg $SRC/raw-33592996.bin --out $SRC/hi-33592996.jpg
     MODE=lum THR=60 INSET=0.055 python3 bake-pizza-plate.py $SRC/hi-33592996.jpg /tmp/out/platter-plate.png

   SHIPS 33592996, a wood-fired vegetable pizza on a round board over dark
   wood: olives, peppers, courgette, no meat. Brightness swept 45/60/80 against
   the fit's raggedness: 2.24% / 0.60% / 1.44%, so 60. INSET 0.055 rather than
   0.03 because the pizza sits a hair off-centre on its board and a sliver of
   board at the rim would ROTATE with the plate, which reads as wobble.

   MODE=sat (the default) was built first, for 36039447 — a plain cheese pizza
   on a white plate. It segmented cleanly but the pizza is not a true circle (a
   crescent of plate showed at the rim) and it reads as a frozen supermarket
   pizza, which is a poor thing to spin in the middle of a sales demo. NO MEAT
   on whatever ships here: the FAQ says the carte carries no pork, and a
   pepperoni or ham pizza turning on the homepage would contradict it.

   WHY NOT bake-platter-plate.py. That script traces a silhouette by flooding a
   PALE GROUND inward, and needs the plate to be the only thing the flood cannot
   reach. Five pizza sources failed it, recorded so nobody repeats them:
     36039447  (this one, by flood) the PLATE runs to the frame edge: the rim
               came back clipped and the pizza sits off-centre on it
     16890470  plate touches the left edge, ry/rx 0.934
     20200300  herbs and a knife bridge into the crust: fill 0.72
     33592996  dark wood (GROUND_DARK=1): olives and char read as ground
     208537    a spinach leaf touches the crust (fill 0.76), and the pink
               slices under the tomato are HAM — out on content regardless

   WHAT WORKS: SEGMENT BY COLOUR, THEN FIT. The pizza is warm and saturated
   (centre sat p5 42) and everything round it — white plate, grey ground — is
   neutral (border sat p99 10). So the mask is saturation > SAT, closed, largest
   component, and the PLATE never enters into it; that is what defeats this
   source's flood failure. Then a CIRCLE is least-squared through the mask's
   boundary (Kasa fit), twice, dropping points more than 2x the median residual
   off the first fit so the crust's two small nicks do not pull it.

   Because the cut is a fitted circle rather than a traced outline, the turning
   plate's two rules hold BY CONSTRUCTION: the centre IS the file's centre (no
   orbit) and the shape IS circular (no once-per-revolution wobble). INSET
   pulls the circle inside the crust's ragged edge so no white plate shows at
   the rim; FEATHER antialiases it. """
import sys
from collections import deque
import numpy as np
from PIL import Image, ImageFilter, ImageDraw

SRC, DST = sys.argv[1], sys.argv[2]
import os
OUT, INSET, FEATHER = 1122, float(os.environ.get('INSET', 0.03)), 1.5
# MODE=sat: the disc is what is SATURATED (a pizza on a white plate).
# MODE=lum: the disc is what is BRIGHT (a pizza on its board over dark wood);
#           olives and char inside it are holes, and the fit only reads the
#           outer boundary, so they never matter.
MODE = os.environ.get('MODE', 'sat'); THR = float(os.environ.get('THR', 28 if MODE == 'sat' else 60))

full = Image.open(SRC).convert('RGB')
k = 2                                           # segment at half size: plenty
im = full.resize((full.width // k, full.height // k), Image.LANCZOS)
a = np.asarray(im).astype(int); H, W, _ = a.shape
m = ((a.max(2) - a.min(2)) > THR) if MODE == 'sat' else ((0.2126*a[...,0] + 0.7152*a[...,1] + 0.0722*a[...,2]) > THR)
g = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.MinFilter(7))
m = np.asarray(g) > 127

# largest component
lab = np.zeros((H, W), np.int32); best, bestn = 0, 0; n = 0
for y0 in range(0, H, 4):
    for x0 in range(0, W, 4):
        if m[y0, x0] and not lab[y0, x0]:
            n += 1; q = deque([(y0, x0)]); lab[y0, x0] = n; c = 0
            while q:
                y, x = q.popleft(); c += 1
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < H and 0 <= nx < W and m[ny, nx] and not lab[ny, nx]:
                        lab[ny, nx] = n; q.append((ny, nx))
            if c > bestn: best, bestn = n, c
P = lab == best

# boundary: leftmost and rightmost per row, topmost and bottommost per column
pts = []
for y in np.nonzero(P.any(1))[0]:
    xs = np.nonzero(P[y])[0]; pts += [(xs.min(), y), (xs.max(), y)]
for x in np.nonzero(P.any(0))[0]:
    ys = np.nonzero(P[:, x])[0]; pts += [(x, ys.min()), (x, ys.max())]
pts = np.array(pts, float); X, Y = pts[:, 0], pts[:, 1]

def fit(X, Y):
    A = np.c_[2 * X, 2 * Y, np.ones_like(X)]
    cx, cy, c = np.linalg.lstsq(A, X**2 + Y**2, rcond=None)[0]
    return cx, cy, np.sqrt(c + cx**2 + cy**2)
cx, cy, r = fit(X, Y)
res = np.abs(np.hypot(X - cx, Y - cy) - r)
keep = res < 2 * np.median(res) + 1
cx, cy, r = fit(X[keep], Y[keep])
res = np.abs(np.hypot(X[keep] - cx, Y[keep] - cy) - r)
print(f'{keep.sum()}/{len(X)} boundary points  centre ({cx*k:.1f},{cy*k:.1f}) r {r*k:.1f}  '
      f'residual median {np.median(res)*k:.1f}px p95 {np.percentile(res,95)*k:.1f}px  '
      f'(r {100*np.median(res)/r:.2f}% ragged)')
cx, cy, r = cx * k, cy * k, r * k
assert cx - r >= 0 and cx + r <= full.width and cy - r >= 0 and cy + r <= full.height, 'circle leaves the frame'

side = round(2 * r); x0, y0 = round(cx - side / 2), round(cy - side / 2)
crop = full.crop((x0, y0, x0 + side, y0 + side))   # square by construction
S = side; R = r * (1 - INSET)
mask = Image.new('L', (S * 4, S * 4), 0); c4 = S * 2; r4 = R * 4
ImageDraw.Draw(mask).ellipse([c4 - r4, c4 - r4, c4 + r4, c4 + r4], fill=255)
mask = mask.resize((S, S), Image.LANCZOS).filter(ImageFilter.GaussianBlur(FEATHER * S / OUT))
crop.putalpha(mask)
out = crop.resize((OUT, OUT), Image.LANCZOS)
out.save(DST)
al = np.asarray(out.split()[-1]) > 127; yy, xx = np.nonzero(al)
print(f'written {DST}  {OUT}x{OUT}  opaque x {xx.min()}..{xx.max()} y {yy.min()}..{yy.max()}  '
      f'centre ({(xx.min()+xx.max())/2:.1f},{(yy.min()+yy.max())/2:.1f}) want {(OUT-1)/2}  '
      f'source px per output px {S/OUT:.2f}')
