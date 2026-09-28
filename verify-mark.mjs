/* Checks brand_assets/crave-mark.svg against the official 320px logo by comparing
   the two OUTER BOUNDARIES, not filled areas.

   Filled-area IoU is the wrong instrument here and gave a confident 55%: the
   official tile carries the CRAVE lettering inside the plaque and the mark file
   deliberately does not, so a third of the "disagreement" was the lettering
   being correctly absent. The boundary is the thing that was reconstructed, so
   the boundary is the thing to measure.

   Run from the project root.  --solve searches centre offset and stroke width.  */
import puppeteer from 'puppeteer';
import fs from 'fs';

const SOLVE = process.argv.includes('--solve');
const src = fs.readFileSync('brand_assets/crave-logo-official-320.jpg').toString('base64');
const markRaw = fs.readFileSync('brand_assets/crave-mark.svg','utf8');
// currentColor in a DETACHED SVG image has nothing to inherit from and resolves
// to black; painted on the black tile that is a silent all-zero result.
const paint = (s) => s.replace(/currentColor/g,'#ffffff');

const browser = await puppeteer.launch();
const page = await browser.newPage();
const run = await page.evaluate(async (src, markRaw, SOLVE) => {
  const c=document.createElement('canvas'); c.width=c.height=320;
  const x=c.getContext('2d',{willReadFrequently:true});
  const trace = (d) => {
    const L=i=>0.2126*d[i]+0.7152*d[i+1]+0.0722*d[i+2];
    const on=(px,py)=>L((py*320+px)*4)>128;
    const top=new Array(320).fill(NaN), bot=new Array(320).fill(NaN),
          lef=new Array(320).fill(NaN), rig=new Array(320).fill(NaN);
    for(let px=0;px<320;px++){let a=-1,b=-1;for(let py=0;py<320;py++)if(on(px,py)){if(a<0)a=py;b=py;}
      if(a>=0){top[px]=a;bot[px]=b;}}
    for(let py=0;py<320;py++){let a=-1,b=-1;for(let px=0;px<320;px++)if(on(px,py)){if(a<0)a=px;b=px;}
      if(a>=0){lef[py]=a;rig[py]=b;}}
    return {top,bot,lef,rig};
  };
  const img=new Image(); img.src='data:image/jpeg;base64,'+src; await img.decode();
  x.drawImage(img,0,0,320,320);
  const A = trace(x.getImageData(0,0,320,320).data);

  const render = async (svg) => {
    const m=new Image(); m.src=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'})); await m.decode();
    x.fillStyle='#000'; x.fillRect(0,0,320,320); x.drawImage(m,0,0,320,320);
    return trace(x.getImageData(0,0,320,320).data);
  };
  const score = (B) => {
    let sum=0,n=0,max=0,where=null;
    for (const k of ['top','bot','lef','rig'])
      for (let i=0;i<320;i++){
        const a=A[k][i], b=B[k][i];
        if (Number.isNaN(a)||Number.isNaN(b)) continue;
        const e=Math.abs(a-b); sum+=e; n++; if(e>max){max=e;where=`${k}[${i}] off ${a} rec ${b}`;}
      }
    return {mean:sum/n, max, n, where};
  };
  const variant = (dx,dy,sw) => markRaw
      .replace(/currentColor/g,'#ffffff')
      .replace(/stroke-width="[\d.]+"/, `stroke-width="${sw}"`)
      .replace(/<path /, `<path transform="translate(${dx} ${dy})" `);

  const base = score(await render(variant(0,0,5.0)));
  let best = null;
  if (SOLVE) {
    for (let dx=0; dx<=1.2; dx+=0.15) for (let dy=-1.2; dy<=0.3; dy+=0.15)
      for (let sw=4.4; sw<=6.4; sw+=0.2) {
        const s = score(await render(variant(+dx.toFixed(2),+dy.toFixed(2),+sw.toFixed(1))));
        if (!best || s.mean < best.s.mean) best = {dx:+dx.toFixed(2),dy:+dy.toFixed(2),sw:+sw.toFixed(1),s};
      }
  }
  return {base, best};
}, src, markRaw, SOLVE);
await browser.close();

const f = s => `mean ${s.mean.toFixed(2)}px  max ${s.max}px  over ${s.n} boundary samples`
  + (s.where ? `\n             worst at ${s.where}` : '');
console.log(`as written   ${f(run.base)}`);
if (run.best) console.log(`best found   dx ${run.best.dx}  dy ${run.best.dy}  stroke ${run.best.sw}   ${f(run.best.s)}`);
