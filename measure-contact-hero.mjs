/* Worst-12px-tile contrast for contact.html's hero heading and eyebrow.

   Reproduce:  node measure-contact-hero.mjs [W H, ...]   (server on 3001)

   WHY THIS EXISTS. shoot-contact.mjs reports the band MEAN, and a mean is
   exactly what hides a lit shirt or a white cup behind one word — CLAUDE.md
   records the heading measuring 3.01:1 on its worst tile while the mean
   looked comfortable. This samples the way shoot-hero-mobile.mjs does: the
   TYPE is hidden (visibility, so layout and the bed are untouched), the bed
   under each element's box is captured, and every 12px tile is scored
   against the element's own computed ink. Light type on a dark bed, so the
   worst tile is the BRIGHTEST one. Floors: heading 3:1, eyebrow 4.5:1. */
import puppeteer from 'puppeteer';
const sizes = process.argv.slice(2).length
  ? process.argv.slice(2).map(s => s.split('x').map(Number))
  : [[1440, 900], [1280, 800], [2560, 1440], [390, 844], [820, 1180]];
const lum = ([r, g, b]) => { const f = c => (c /= 255) <= 0.03928 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4;
  return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + .05) / (y + .05); };
const b = await puppeteer.launch({ headless: 'new' });
const p = await b.newPage();
for (const [W, H] of sizes) {
  await p.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  await p.goto('http://localhost:3001/contact.html', { waitUntil: 'networkidle0' });
  await p.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 1500));            // let the entrance land
  const els = await p.evaluate(() => ['.hero__title', '.hero__eyebrow'].map(s => {
    const e = document.querySelector(s); const r = e.getBoundingClientRect();
    const ink = getComputedStyle(e).color.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number);
    e.style.visibility = 'hidden';
    return { s, ink, x: r.left, y: r.top, w: r.width, h: r.height };
  }));
  await new Promise(r => setTimeout(r, 200));
  const shot = await p.screenshot({ encoding: 'base64' });
  const out = await p.evaluate(async (shot, els) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + shot; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    return els.map(e => {
      const d = g.getImageData(Math.round(e.x), Math.round(e.y), Math.max(1, Math.round(e.w)), Math.max(1, Math.round(e.h)));
      let worst = null, wl = -1, sum = [0, 0, 0], n = 0;
      // a small eyebrow's box can be under 12px tall: clamp the tile to it
      const T = Math.min(12, d.height, d.width), st = Math.max(1, T >> 1);
      for (let ty = 0; ty + T <= d.height; ty += st) for (let tx = 0; tx + T <= d.width; tx += st) {
        let r = 0, gg = 0, bb = 0;
        for (let y = ty; y < ty + T; y++) for (let x = tx; x < tx + T; x++) {
          const i = (y * d.width + x) * 4; r += d.data[i]; gg += d.data[i + 1]; bb += d.data[i + 2]; }
        const m = [r / (T * T), gg / (T * T), bb / (T * T)]; const l = .2126 * m[0] + .7152 * m[1] + .0722 * m[2];
        sum[0] += m[0]; sum[1] += m[1]; sum[2] += m[2]; n++;
        if (l > wl) { wl = l; worst = m; }
      }
      return { s: e.s, ink: e.ink, worst, mean: sum.map(v => v / n) };
    });
  }, shot, els);
  for (const o of out) {
    const floor = o.s === '.hero__title' ? 3 : 4.5;
    const w = ratio(o.ink, o.worst), m = ratio(o.ink, o.mean);
    console.log(`${String(W + 'x' + H).padEnd(10)} ${o.s.padEnd(15)} worst tile ${w.toFixed(2).padStart(5)}:1  mean ${m.toFixed(2).padStart(5)}:1  floor ${floor}  ${w >= floor ? 'ok' : 'FAILS'}`);
  }
}
await b.close();
