#!/bin/bash
# Encodes every PNG the python bake wrote into the JPEG the site ships as its
# <img src> fallback. One Chrome launch per file is slow but it is the encoder
# that matters: `sips -s format jpeg` at the same nominal quality runs about
# twice the file size.
set -e
OUT=${1:?usage: bake-crave-photography.sh <bake-out-dir>}
mkdir -p assets/img/gallery
for png in "$OUT"/*.png "$OUT"/gallery/*.png; do
  [ -e "$png" ] || continue
  rel=${png#$OUT/}; stem=${rel%.png}
  node bake-png-to-jpeg.mjs "$png" "assets/img/${stem}.jpg" 0.86
done
