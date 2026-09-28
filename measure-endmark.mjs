/* Solves --end-mark so the closing wordmark runs to ~92% of the viewport.
   That 92% is the target the block was designed against and it is a function
   of the STRING, so it has to be re-solved whenever the name changes length:
   MISONO's six glyphs, LI'S's four and CRAVE's five all measure differently
   at one size. Run from the project root with the server up. */
import puppeteer from 'puppeteer';
const URL = process.argv[2] || 'http://localhost:3001';
const b = await puppeteer.launch();
const p = await b.newPage();
for (const [w,h] of [[1440,900],[2560,1440],[1280,800],[390,844],[1000,700]]) {
  await p.setViewport({width:w,height:h});
  await p.goto(URL, {waitUntil:'networkidle0'});
  await p.evaluate(()=>document.fonts.ready);
  const r = await p.evaluate(() => {
    const el = document.querySelector('.ending__mark');
    const cs = getComputedStyle(el);
    const em = parseFloat(cs.fontSize);
    // MEASURE THE TEXT, NOT THE BOX. The mark is white-space: nowrap inside a
    // full-width block, so once it is wider than the viewport its border box
    // stops growing and getBoundingClientRect() reports the VIEWPORT back at
    // you. Read that way an overflowing mark reports as a perfectly fitted
    // one — it was reporting 93.2% while hanging 48.6px off the right edge.
    const r = document.createRange();
    r.selectNodeContents(el);
    const rect = r.getBoundingClientRect();
    const track = 0.16 * em;                 // trailing letter-space is not ink
    return { size: em, ink: rect.width - track, box: el.getBoundingClientRect().width,
             text: el.textContent.trim(), vw: innerWidth };
  });
  const pct = r.ink / r.vw * 100;
  const need = r.size * (92 / pct);
  console.log(`${String(w).padStart(4)}x${h}  "${r.text}"  size ${r.size.toFixed(1)}px  ink ${r.ink.toFixed(0)}px = ${pct.toFixed(1)}% of vw   -> ${need.toFixed(1)}px for 92%  (${(need/r.size*100).toFixed(1)}% of current)`);
}
await b.close();
