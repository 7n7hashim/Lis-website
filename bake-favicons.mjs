/* Bakes the site icon set from the Crave mark.

   Reproduce:  node bake-favicons.mjs

   Two DIFFERENT drawings, which is the whole point of the script rather
   than a single file scaled down:

   - The SMALL mark (favicon.svg, favicon-16.png, favicon-32.png) is the
     plaque alone, with its stroke thickened and the lettering dropped. The
     real mark's stroke is 5.2 of 100, which at 16px lands at 0.83px, and its
     lettering at well under a pixel — rendered that size the whole thing
     collapses into a smear with a lighter middle. The small drawing takes the
     stroke to 10.6/100, which is 1.7px at 16 and reads as a shape.

   - The LARGE mark (apple-touch-icon, 192, 512) is the full artwork,
     lettering and all, inset to 78% of the tile. iOS and Android both mask
     these to a rounded shape or a circle, and the plaque spans 84% of its own
     viewBox, so uninset it loses its tips to the mask.

     ITS LETTERING IS SET AS TYPE, not traced. brand_assets/crave-mark.svg
     deliberately carries no letterforms — the mark is the plaque and CRAVE is
     type beside it, which is what lets one path take currentColor and work at
     any size. That is fine here because these three outputs are PNG: the font
     dependency is baked away by the render. assets/favicon.svg ships as SVG
     and therefore carries the small drawing, which needs no font at all.

   Both sit on the logo's OWN OPAQUE BLACK with the plaque in the ground
   colour. That is the real artwork's polarity — a white plaque on black — and
   it is the one place on this site where a black tile is correct rather than
   a carried-over habit. On a transparent icon the plaque vanishes against a
   dark browser tab.

   AN XML COMMENT MAY NOT CONTAIN A DOUBLE HYPHEN. Written the obvious way the
   SVG stops being well-formed and the browser shows a broken image with a
   clean 200 on the wire and nothing in the console. favicon.svg therefore
   carries no comments; the reasoning lives here instead.

   PNG encoding goes through the Chrome puppeteer already ships — there is no
   ImageMagick on this machine and `sips` cannot render SVG. */
import puppeteer from 'puppeteer';
import { writeFileSync, readFileSync, statSync } from 'node:fs';

const TILE = '#000000';   /* the logo's own ground, measured off it */
const MARK = '#FBFAF7';   /* --ground. The logo's mark measures #FBFBFB */

/* ------------------------------------------------------------ the drawings */

const SMALL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100" role="img" aria-label="Crave">
<title>Crave</title>
<rect width="100" height="100" fill="${TILE}"/>
<path d="M50.6 25.95C60.929 25.95,68.037 32.159,69.045 32.45C69.717 32.643,72.417 32.267,73.841 32.513C76.689 33.005,78.885 35.081,79.19 35.508C81.095 38.178,80.261 38.645,81.957 40.989C82.265 41.415,83.309 41.659,83.801 42.008C87.369 44.542,87.49 47.29,87.49 49.4C87.49 51.511,87.369 54.258,83.801 56.792C83.309 57.141,82.265 57.385,81.957 57.811C80.261 60.155,81.095 60.622,79.19 63.292C78.885 63.719,76.689 65.795,73.841 66.287C72.417 66.533,69.717 66.157,69.045 66.35C68.037 66.641,60.929 72.85,50.6 72.85C40.271 72.85,33.163 66.641,32.155 66.35C31.483 66.157,28.783 66.533,27.359 66.287C24.511 65.795,22.315 63.719,22.01 63.292C20.105 60.622,20.939 60.155,19.244 57.811C18.935 57.385,17.891 57.141,17.399 56.792C13.831 54.258,13.71 51.511,13.71 49.4C13.71 47.29,13.831 44.542,17.399 42.008C17.891 41.659,18.935 41.415,19.244 40.989C20.939 38.645,20.105 38.178,22.01 35.508C22.315 35.081,24.511 33.005,27.359 32.513C28.783 32.267,31.483 32.643,32.155 32.45C33.163 32.159,40.271 25.95,50.6 25.95Z" fill="none" stroke="${MARK}" stroke-width="10.6" stroke-linejoin="round"/>
</svg>`;

/* The full mark, lifted from brand_assets/lis-mark.svg and inset. Its own
   <title>/<desc> are dropped — an icon carries no accessible name of its
   own — and the paths are untouched. */
const markBody = readFileSync('brand_assets/crave-mark.svg', 'utf8')
  .replace(/<\?xml[\s\S]*?\?>/, '')
  .replace(/<svg[^>]*>/, '')
  .replace(/<\/svg>\s*$/, '')
  .replace(/<title>[\s\S]*?<\/title>/, '')
  .replace(/<desc>[\s\S]*?<\/desc>/, '')
  .trim();

const INSET = 0.78;
const off = (100 - 100 * INSET) / 2;
const LARGE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
<rect width="100" height="100" fill="${TILE}"/>
<g transform="translate(${off} ${off}) scale(${INSET})" color="${MARK}">
${markBody}
<text x="50.6" y="49.4" fill="${MARK}" font-family="Cormorant Garamond, Cormorant, Georgia, serif"
      font-size="21" font-weight="400" letter-spacing="1.6"
      text-anchor="middle" dominant-baseline="central" textLength="58" lengthAdjust="spacing">CRAVE</text>
</g>
</svg>`;

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
console.log(`assets/favicon.svg           ${statSync('assets/favicon.svg').size}B  (small mark, scalable)`);

for (const [size, out, svg, note] of [
  [16,  'assets/favicon-16.png',       SMALL, 'small mark'],
  [32,  'assets/favicon-32.png',       SMALL, 'small mark'],
  [180, 'assets/apple-touch-icon.png', LARGE, 'full mark, 78% inset'],
  [192, 'assets/icon-192.png',         LARGE, 'full mark, 78% inset'],
  [512, 'assets/icon-512.png',         LARGE, 'full mark, 78% inset'],
]) {
  const bytes = await png(svg, size, out);
  console.log(`${out.padEnd(29)}${String(bytes).padStart(6)}B  ${size}x${size}  ${note}`);
}

await browser.close();
