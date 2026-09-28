import puppeteer from 'puppeteer';
import fs from 'fs';
const mark = fs.readFileSync('brand_assets/crave-mark.svg','utf8').replace(/currentColor/g,'#ffffff');
const src  = fs.readFileSync('brand_assets/crave-logo-official-320.jpg').toString('base64');
const browser = await puppeteer.launch(); const page = await browser.newPage();
const r = await page.evaluate(async (mark, src) => {
  const scan = (data) => {
    const L=(i)=>0.2126*data[i]+0.7152*data[i+1]+0.0722*data[i+2];
    const on=(px,py)=>L((py*320+px)*4)>128;
    let minX=320,maxX=0,minY=320,maxY=0;
    for(let py=0;py<320;py++)for(let px=0;px<320;px++)
      if(on(px,py)){if(px<minX)minX=px;if(px>maxX)maxX=px;if(py<minY)minY=py;if(py>maxY)maxY=py;}
    const rows={};
    for(const f of [0.30,0.40,0.50,0.60,0.70]){
      const py=Math.round(f*320); const runs=[]; let inR=false,s=0;
      for(let px=0;px<320;px++){const o=on(px,py); if(o&&!inR){inR=true;s=px;} else if(!o&&inR){inR=false;runs.push([s,px-1]);}}
      if(inR)runs.push([s,319]);
      rows[f]=runs;
    }
    return {box:{minX,maxX,minY,maxY}, rows};
  };
  const c=document.createElement('canvas'); c.width=c.height=320;
  const x=c.getContext('2d',{willReadFrequently:true});
  const img=new Image(); img.src='data:image/jpeg;base64,'+src; await img.decode();
  x.drawImage(img,0,0,320,320); const A=scan(x.getImageData(0,0,320,320).data);
  const m=new Image(); m.src=URL.createObjectURL(new Blob([mark],{type:'image/svg+xml'})); await m.decode();
  x.fillStyle='#000'; x.fillRect(0,0,320,320); x.drawImage(m,0,0,320,320);
  const B=scan(x.getImageData(0,0,320,320).data);
  return {A,B};
}, mark, src);
await browser.close();
const fmt = o => `box x${o.box.minX}-${o.box.maxX} y${o.box.minY}-${o.box.maxY}`;
console.log('official      ', fmt(r.A));
console.log('reconstruction', fmt(r.B));
for (const f of ['0.3','0.4','0.5','0.6','0.7']) {
  const a=r.A.rows[f], b=r.B.rows[f];
  const w = rs => rs.length ? `L[${rs[0][0]}-${rs[0][1]}]w${rs[0][1]-rs[0][0]+1} R[${rs.at(-1)[0]}-${rs.at(-1)[1]}]w${rs.at(-1)[1]-rs.at(-1)[0]+1}` : 'none';
  console.log(`y=${f}  off: ${w(a)}\n       rec: ${w(b)}`);
}
