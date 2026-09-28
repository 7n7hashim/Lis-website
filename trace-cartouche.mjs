import puppeteer from 'puppeteer';
import fs from 'fs';
const b64 = fs.readFileSync('brand_assets/crave-logo-official-320.jpg').toString('base64');
const browser = await puppeteer.launch();
const page = await browser.newPage();
const out = await page.evaluate(async (b64) => {
  const img = new Image(); img.src = 'data:image/jpeg;base64,' + b64; await img.decode();
  const W = img.naturalWidth, H = img.naturalHeight;
  const c = document.createElement('canvas'); c.width=W; c.height=H;
  const x = c.getContext('2d',{willReadFrequently:true}); x.drawImage(img,0,0);
  const d = x.getImageData(0,0,W,H).data;
  const L = (px,py)=>{const i=(py*W+px)*4; return 0.2126*d[i]+0.7152*d[i+1]+0.0722*d[i+2];};
  const on = (px,py)=>L(px,py)>128;
  // OUTER boundary: for each row, leftmost and rightmost white pixel (that's the frame's outer edge)
  const left=[], right=[], top=[], bottom=[];
  for (let py=0; py<H; py++){
    let a=-1,b=-1;
    for(let px=0;px<W;px++) if(on(px,py)){ if(a<0)a=px; b=px; }
    if(a>=0){ left.push([py,a]); right.push([py,b]); }
  }
  for (let px=0; px<W; px++){
    let a=-1,b=-1;
    for(let py=0;py<H;py++) if(on(px,py)){ if(a<0)a=py; b=py; }
    if(a>=0){ top.push([px,a]); bottom.push([px,b]); }
  }
  // wordmark box: white pixels strictly INSIDE the frame.
  // walk each row inward past the first white run (the frame) and past the black gap
  let wx0=W, wx1=0, wy0=H, wy1=0;
  for (let py=0; py<H; py++){
    const runs=[]; let inR=false,s=0;
    for(let px=0;px<W;px++){const o=on(px,py); if(o&&!inR){inR=true;s=px;} else if(!o&&inR){inR=false;runs.push([s,px-1]);}}
    if(inR)runs.push([s,W-1]);
    if(runs.length>=3){ // frame-left, letters..., frame-right
      for(let k=1;k<runs.length-1;k++){
        if(runs[k][0]<wx0)wx0=runs[k][0]; if(runs[k][1]>wx1)wx1=runs[k][1];
        if(py<wy0)wy0=py; if(py>wy1)wy1=py;
      }
    }
  }
  return {W,H,left,right,top,bottom,word:{wx0,wx1,wy0,wy1}};
}, b64);
await browser.close();
const {W,H,left,right,top,bottom,word} = out;
const f = n => (n).toFixed(2);
// print the outer boundary as fractions of the 320 box, every 8 rows
console.log('# cartouche outer edge, as % of the 320px box');
console.log('yPct   leftPct  rightPct   halfWidthPct');
for (const [py,a] of left){
  if (py % 8) continue;
  const b = right.find(r=>r[0]===py)[1];
  console.log(`${f(py/H*100).padStart(6)} ${f(a/W*100).padStart(8)} ${f((b+1)/W*100).padStart(9)} ${f(((b+1-a)/2)/W*100).padStart(13)}`);
}
console.log('\n# top / bottom edge by column, every 8 cols');
console.log('xPct    topPct  bottomPct');
for (const [px,a] of top){
  if (px % 8) continue;
  const b = bottom.find(r=>r[0]===px)[1];
  console.log(`${f(px/W*100).padStart(6)} ${f(a/H*100).padStart(8)} ${f((b+1)/H*100).padStart(9)}`);
}
console.log('\n# wordmark ink box (px, and as % of the cartouche box)', JSON.stringify(word));
