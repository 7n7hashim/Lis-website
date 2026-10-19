/* Bakes the site icon set from the La Pranzo mark.

   Reproduce:  python3 make-lapranzo-mark.py && node bake-favicons.mjs

   TWO DIFFERENT DRAWINGS, which is the whole point of the script rather than
   a single file scaled down:

   - The SMALL mark (favicon.svg, favicon-16.png, favicon-32.png) is a
     SIMPLIFICATION, not the real ring shrunk, and it had to become one. The
     emblem is an irregular Kufic ring of about twenty separate arms; its
     median ink run is 39px of 1024, which is 0.61px at a 16px favicon. The
     first attempt dilated the alpha to a median of 93px — the raster
     equivalent of the stroke-thickening that saved Crave's plaque — and it
     rendered as a white blob. A sweep of six dilations from 1 to 13 was
     rendered at 32px and NONE of them read as a mark: past a point the arms
     merge, and short of it they grey out. The information in this shape does
     not survive to 16px by any amount of thickening.

     So the small drawing keeps the emblem's STRUCTURE and drops its detail:
     a ring broken into an upper and a lower arc, with the two dots the real
     mark carries at top and bottom centre. Solved by rendering at 16, 32 and
     64 rather than by eye at full size — stroke 13, gap 18 degrees, radius
     31, dot 7 of a 100 unit box. It is a path, so favicon.svg is 700 bytes
     rather than the 162KB an embedded 1024px raster made it.

   - The LARGE mark (apple-touch-icon, 192, 512) is the full artwork,
     LETTERING AND ALL, inset to 78% of the tile. iOS and Android both mask
     these to a rounded shape or a circle, and an uninset ring loses its
     outermost arms to the mask.

     ITS LETTERING IS THE REAL ARTWORK'S OWN, not type set over it. That is
     the opposite of the build this replaces, where the mark carried no
     letterforms and CRAVE was drawn with a <text> element in a named font.
     La Pranzo's logo has its wordmark built into the emblem, so lifting the
     letters out and re-setting them in Cormorant would be inventing a
     lockup the brand does not have.

   BOTH SIT ON THE LOGO'S OWN OPAQUE BLACK with the mark in the ground colour.
   That is the real artwork's polarity — a white ring on black — and it is now
   the same polarity as the site itself, which it was not before. On a
   transparent icon the ring vanishes against a dark browser tab.

   THE MARK IS A RASTER, SO THE SVG EMBEDS IT. assets/favicon.svg carries the
   bold PNG as a base64 <image> rather than a <path>. It is still the right
   file to ship — a browser picks it for any size and it renders crisply well
   past 32px — but it is no longer resolution-independent, and that is the
   second thing vector artwork would buy. See make-lapranzo-mark.py.

   AN XML COMMENT MAY NOT CONTAIN A DOUBLE HYPHEN. Written the obvious way the
   SVG stops being well-formed and the browser shows a broken image with a
   clean 200 on the wire and nothing in the console. favicon.svg therefore
   carries no comments; the reasoning lives here instead.

   PNG encoding goes through the Chrome puppeteer already ships — there is no
   ImageMagick on this machine and `sips` cannot render SVG. */
import puppeteer from 'puppeteer';
import { writeFileSync, readFileSync, statSync } from 'node:fs';

const TILE = '#000000';   /* the logo's own ground: measured rgb(22,22,22) at chroma 0.03 */
const MARK = '#FBFAF7';   /* the logo's own mark:   measured rgb(246,246,244) at chroma 1.87 */

const b64 = f => readFileSync(f).toString('base64');

/* PARAMETERISED 2026-10-19. The LARGE icons embed the artwork wholesale,
   lettering and all, so pointing them at the client's file is pointing them
   at the client's LOGOTYPE — which must not ship on a demo sent to other
   restaurants. argv[2] is the artwork; argv[3] the label.
     node bake-favicons.mjs                                       (client)
     node bake-favicons.mjs brand_assets/demo-mark-512.png Mezani (demo)
   The SMALL drawing is a path and needs no source: it is already a ring of
   two arcs and two dots, which carries nothing brand-specific. */
const ART   = process.argv[2] ?? 'brand_assets/lapranzo-mark-full.png';
const LABEL = process.argv[3] ?? 'La Pranzo';
const FULL  = b64(ART);

/* ------------------------------------------------------------ the drawings */

/* The mark ships white in the PNG's own pixels, so it is recoloured here with
   a feColorMatrix rather than by re-cutting the file: the alpha is the shape
   and the fill is a decision. Flooding through the alpha keeps the antialiased
   rim, which a hard threshold would staircase at 16px. */
const tint = (id, hex) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return `<filter id="${id}" x="0" y="0" width="100%" height="100%">
<feColorMatrix type="matrix" values="0 0 0 0 ${r}  0 0 0 0 ${g}  0 0 0 0 ${b}  0 0 0 1 0"/>
</filter>`;
};

const INSET_LARGE = 0.78;   /* iOS and Android mask these to a circle */

/* Solved at 16, 32 and 64px, not chosen at full size. See the note above. */
const SW = 13, GAP = 18, R = 31, DOT = 7;
const px = (deg, s) => (50 + R * Math.cos(deg * Math.PI / 180)).toFixed(3);
const py = (deg) => (50 + R * Math.sin(deg * Math.PI / 180)).toFixed(3);
const SMALL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100" role="img" aria-label="La Pranzo">
<title>La Pranzo</title>
<rect width="100" height="100" fill="${TILE}"/>
<g fill="none" stroke="${MARK}" stroke-width="${SW}" stroke-linecap="round">
<path d="M${px(180 + GAP)} ${py(180 + GAP)}A${R} ${R} 0 0 1 ${px(-GAP)} ${py(-GAP)}"/>
<path d="M${px(GAP)} ${py(GAP)}A${R} ${R} 0 0 1 ${px(180 - GAP)} ${py(180 - GAP)}"/>
</g>
<circle cx="50" cy="${50 - R}" r="${DOT}" fill="${TILE}" stroke="${MARK}" stroke-width="${(SW * 0.55).toFixed(2)}"/>
<circle cx="50" cy="${50 + R}" r="${DOT}" fill="${TILE}" stroke="${MARK}" stroke-width="${(SW * 0.55).toFixed(2)}"/>
</svg>`;

const draw = (png, inset, label) => {
  const off = (100 - 100 * inset) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100" role="img" aria-label="${label}">
<title>${label}</title>
<defs>${tint('m', MARK)}</defs>
<rect width="100" height="100" fill="${TILE}"/>
<image x="${off}" y="${off}" width="${100 * inset}" height="${100 * inset}"
       filter="url(#m)" href="data:image/png;base64,${png}"/>
</svg>`;
};

const LARGE = draw(FULL, INSET_LARGE, LABEL);

/* ------------------------------------------------------------------ render */

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();

async function png(svg, size, out) {
  const enc = Buffer.from(svg, 'utf8').toString('base64');
  await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
  await page.setContent(
    `<body style="margin:0"><img src="data:image/svg+xml;base64,${enc}" width="${size}" height="${size}"></body>`,
  );
  await page.evaluate(() => document.images[0].decode());
  /* page.screenshot returns a Uint8Array, and Uint8Array.toString('base64')
     ignores its argument — wrap it before anything treats it as bytes. */
  writeFileSync(out, Buffer.from(await page.screenshot({ omitBackground: false })));
  return statSync(out).size;
}

writeFileSync('assets/favicon.svg', SMALL + '\n');
console.log(`assets/favicon.svg           ${statSync('assets/favicon.svg').size}B  (small mark, a path)`);

for (const [size, out, svg, note] of [
  [16,  'assets/favicon-16.png',       SMALL, 'simplified ring'],
  [32,  'assets/favicon-32.png',       SMALL, 'simplified ring'],
  [180, 'assets/apple-touch-icon.png', LARGE, 'full mark, 78% inset'],
  [192, 'assets/icon-192.png',         LARGE, 'full mark, 78% inset'],
  [512, 'assets/icon-512.png',         LARGE, 'full mark, 78% inset'],
]) {
  const bytes = await png(svg, size, out);
  console.log(`${out.padEnd(29)}${String(bytes).padStart(6)}B  ${size}x${size}  ${note}`);
}

await browser.close();
