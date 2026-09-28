import puppeteer from 'puppeteer';
import fs from 'fs';
const b64 = fs.readFileSync(process.argv[2]).toString('base64');
const browser = await puppeteer.launch();
const page = await browser.newPage();
const out = await page.evaluate(async (b64) => {
  const img = new Image(); img.src='data:image/jpeg;base64,'+b64; await img.decode();
  const W=img.naturalWidth,H=img.naturalHeight;
  const c=document.createElement('canvas');c.width=W;c.height=H;
  const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(img,0,0);
  const d=x.getImageData(0,0,W,H).data;
  const lum=(r,g,b)=>0.2126*r+0.7152*g+0.0722*b;
  let sum=0,n=0; const buckets=new Map();
  for(let i=0;i<d.length;i+=4){
    const r=d[i],g=d[i+1],b=d[i+2];
    sum+=lum(r,g,b); n++;
    const k=`${r>>4},${g>>4},${b>>4}`;
    const e=buckets.get(k)||[0,0,0,0]; e[0]+=r;e[1]+=g;e[2]+=b;e[3]++; buckets.set(k,e);
  }
  const top=[...buckets.values()].sort((a,b)=>b[3]-a[3]).slice(0,10)
    .map(e=>({hex:'#'+[0,1,2].map(i=>Math.round(e[i]/e[3]).toString(16).padStart(2,'0')).join(''),
              pct:+(e[3]/n*100).toFixed(1), L:+(lum(e[0]/e[3],e[1]/e[3],e[2]/e[3])).toFixed(0)}));
  // regional means
  const region=(x0,y0,x1,y1)=>{let s=0,m=0;for(let py=y0;py<y1;py++)for(let px=x0;px<x1;px++){const i=(py*W+px)*4;s+=lum(d[i],d[i+1],d[i+2]);m++;}return +(s/m).toFixed(1);};
  return {W,H,mean:+(sum/n).toFixed(1),top,
    wallUpper:region(0,0,W,H*0.25|0), floor:region(0,H*0.8|0,W,H), centre:region(W*0.35|0,H*0.3|0,W*0.65|0,H*0.7|0)};
}, b64);
await browser.close();
console.log(JSON.stringify(out,null,1));
