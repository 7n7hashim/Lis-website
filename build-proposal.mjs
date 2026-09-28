/* Renders the Li's website proposal to a print-ready A4 PDF.

   Reproduce:  node build-proposal.mjs [in.html] [out.pdf]

   The proposal is set in the SAME two families as the site itself, from the
   same self-hosted files — so the document is a sample of the work rather
   than a description of it. They are base64-inlined rather than linked:
   Chrome will not load a file:// subresource from a file:// page, and a
   linked font that silently fails falls back to Times, which is exactly the
   look this proposal is arguing against.

   Printed with `printBackground` and zero margins — every page in the HTML
   is already a 210x297mm box with its own padding, so letting Chrome add
   margins on top would shrink the content and break the page boundaries. */
import puppeteer from 'puppeteer';
import { readFileSync, writeFileSync, statSync } from 'node:fs';

const IN  = process.argv[2] ?? 'proposal.html';
const OUT = process.argv[3] ?? 'proposal.pdf';

const b64 = (p) => readFileSync(p).toString('base64');
const face = (family, file, weight, style = 'normal') =>
  `@font-face{font-family:'${family}';font-style:${style};font-weight:${weight};` +
  `src:url(data:font/woff2;base64,${b64(file)}) format('woff2');font-display:block}`;

const fonts = [
  face('Cormorant Garamond', 'assets/fonts/cormorant-garamond-normal-300-400.woff2', '300 400'),
  face('Cormorant Garamond', 'assets/fonts/cormorant-garamond-italic-400.woff2', '400', 'italic'),
  face('Jost', 'assets/fonts/jost-normal-300-400.woff2', '300 400'),
].join('\n');

/* The date and the expiry are filled at BUILD time, not typed into the
   markup. They appeared in four places — the cover, the acceptance note and
   the footer twice — and the first build of this document went out stamped
   with yesterday's date because the day rolled over between writing it and
   printing it. `VALID_DAYS` is the decision window the proposal asks for.

   Override either from the shell when re-dating an old proposal:
     PROPOSAL_DATE=2026-10-01 VALID_DAYS=14 node build-proposal.mjs ... */
const VALID_DAYS = Number(process.env.VALID_DAYS ?? 7);
const today = process.env.PROPOSAL_DATE ? new Date(process.env.PROPOSAL_DATE + 'T12:00:00') : new Date();
const valid = new Date(today.getTime() + VALID_DAYS * 864e5);
const long = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

const html = readFileSync(IN, 'utf8')
  .replace('__FONTS__', fonts)
  .replaceAll('__DATE__', long(today))
  .replaceAll('__VALID_CAPS__', long(valid).toUpperCase())
  .replaceAll('__VALID__', long(valid));

if (html.includes('__DATE__') || html.includes('__VALID')) {
  console.error('a date placeholder was left unfilled'); process.exit(1);
}

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'load' });
await page.evaluateHandle('document.fonts.ready');

/* Fail loudly rather than shipping a PDF set in Times. */
const loaded = await page.evaluate(() =>
  ['Cormorant Garamond', 'Jost'].filter((f) => !document.fonts.check(`12px "${f}"`)));
if (loaded.length) { console.error('FONTS NOT LOADED:', loaded.join(', ')); process.exit(1); }

await page.pdf({
  path: OUT,
  width: '210mm',
  height: '297mm',
  printBackground: true,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
  preferCSSPageSize: false,
});
await browser.close();

const pages = (readFileSync(IN, "utf8").match(/<section class="page/g) || []).length;
console.log(`${OUT}  ${(statSync(OUT).size / 1024).toFixed(0)}KB  ${pages} pages  A4`);
