/* Solves .hero__name's size+tracking for a new wordmark. The lockup rule is
   that the wordmark's INK equals the tagline's ink, which is what the
   composition was built on. Prints ink widths as px and as a share of the
   viewport at a real render, for a grid of size/tracking candidates. */
import puppeteer from 'puppeteer';
const W = Number(process.argv[2] || 1440), H = Number(process.argv[3] || 900);
const b = await puppeteer.launch();
const p = await b.newPage();
await p.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
await p.goto('http://localhost:3001/', { waitUntil: 'networkidle0' });
await p.evaluate(() => document.fonts.ready);

const ink = await p.evaluate(() => {
  // measure the ink of a run of text at a given size/tracking with canvas,
  // which gives actualBoundingBox rather than the layout box (tracking adds
  // a trailing space to the layout box and that is not ink).
  const c = document.createElement('canvas').getContext('2d');
  const measure = (text, px, track, weight, family) => {
    c.font = `${weight} ${px}px ${family}`;
    const m = c.measureText(text);
    const glyph = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
    // tracking is applied per character INCLUDING the last, which the
    // margin-right: -Xem then removes, so ink = glyphs + (n-1) * track
    return glyph + (text.length - 1) * track * px;
  };
  const CG = `"Cormorant Garamond", Cormorant, Georgia, serif`;
  const J  = `Jost, system-ui, sans-serif`;
  const tagEl = document.querySelector('.hero__tagline');
  const cs = getComputedStyle(tagEl);
  const tagPx = parseFloat(cs.fontSize), tagTrack = parseFloat(cs.letterSpacing) / tagPx;
  const tagText = tagEl.textContent.trim().toUpperCase();
  const tagInk = measure(tagText, tagPx, tagTrack, cs.fontWeight, J);

  const out = { vw: innerWidth, tagText, tagPx: +tagPx.toFixed(2), tagInk: +tagInk.toFixed(1),
                tagPct: +(100 * tagInk / innerWidth).toFixed(2), rows: [] };
  for (const track of [0.14, 0.16, 0.18, 0.20, 0.22]) {
    for (const vw of [2.4, 2.6, 2.8, 3.0, 3.2, 3.4]) {
      const px = innerWidth * vw / 100;
      const w = measure('LA PRANZO', px, track, 300, CG);
      out.rows.push({ track, vw, px: +px.toFixed(1), ink: +w.toFixed(1),
                      pct: +(100 * w / innerWidth).toFixed(2),
                      vsTag: +(w / tagInk).toFixed(3) });
    }
  }
  // and what CRAVE measured at the shipped settings, as the control
  out.craveControl = +measure('CRAVE', innerWidth * 4.33 / 100, 0.22, 300, CG).toFixed(1);
  return out;
});
console.log(`viewport ${ink.vw}   tagline "${ink.tagText}" ${ink.tagPx}px  ink ${ink.tagInk}px (${ink.tagPct}% vw)`);
console.log(`CRAVE at the shipped 4.33vw / 0.22em measured ${ink.craveControl}px\n`);
console.log('track   vw     px     ink    %vw   ink/tagline');
for (const r of ink.rows)
  console.log(`${r.track.toFixed(2)}  ${r.vw.toFixed(2)}  ${String(r.px).padStart(6)} ${String(r.ink).padStart(7)} ${String(r.pct).padStart(6)}  ${r.vsTag.toFixed(3)}`);
await b.close();
