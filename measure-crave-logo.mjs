import puppeteer from 'puppeteer';
import fs from 'fs';
const file = process.argv[2];
const b64 = fs.readFileSync(file).toString('base64');   // real Buffer -> fine
const browser = await puppeteer.launch();
const page = await browser.newPage();
const out = await page.evaluate(async (b64) => {
  const img = new Image();
  img.src = 'data:image/jpeg;base64,' + b64;
  await img.decode();
  const W = img.naturalWidth, H = img.naturalHeight;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d', { willReadFrequently: true });
  x.drawImage(img, 0, 0);
  const d = x.getImageData(0, 0, W, H).data;
  const at = (px, py) => { const i = (py * W + px) * 4; return [d[i], d[i+1], d[i+2]]; };
  const lum = ([r,g,b]) => 0.2126*r + 0.7152*g + 0.0722*b;
  // histogram of luminance
  const hist = new Array(16).fill(0);
  const dark = [0,0,0,0], light = [0,0,0,0];
  for (let i = 0; i < d.length; i += 4) {
    const L = lum([d[i],d[i+1],d[i+2]]);
    hist[Math.min(15, Math.floor(L/16))]++;
    if (L < 40) { dark[0]+=d[i]; dark[1]+=d[i+1]; dark[2]+=d[i+2]; dark[3]++; }
    if (L > 215) { light[0]+=d[i]; light[1]+=d[i+1]; light[2]+=d[i+2]; light[3]++; }
  }
  const avg = a => a[3] ? [Math.round(a[0]/a[3]), Math.round(a[1]/a[3]), Math.round(a[2]/a[3])] : null;
  // row/col ink extents of the LIGHT (white) pixels — the mark itself
  let minX=W, maxX=0, minY=H, maxY=0;
  for (let py=0; py<H; py++) for (let px=0; px<W; px++) {
    if (lum(at(px,py)) > 160) { if(px<minX)minX=px; if(px>maxX)maxX=px; if(py<minY)minY=py; if(py>maxY)maxY=py; }
  }
  // horizontal scan of the cartouche at several rows: first/last white run
  const rows = {};
  for (const f of [0.10,0.18,0.25,0.30,0.35,0.42,0.50,0.58,0.65,0.70,0.75,0.82,0.90]) {
    const py = Math.round(f*H); const runs = [];
    let inRun = false, start = 0;
    for (let px=0; px<W; px++) {
      const on = lum(at(px,py)) > 160;
      if (on && !inRun) { inRun = true; start = px; }
      else if (!on && inRun) { inRun = false; runs.push([start, px-1]); }
    }
    if (inRun) runs.push([start, W-1]);
    rows[f] = { n: runs.length, first: runs[0]||null, last: runs[runs.length-1]||null };
  }
  return { W, H, hist, darkAvg: avg(dark), darkN: dark[3], lightAvg: avg(light), lightN: light[3],
           inkBox: {minX,maxX,minY,maxY}, rows,
           corner: at(3,3), centre: at(W>>1, H>>1) };
}, b64);
await browser.close();
console.log(JSON.stringify(out, null, 1));
