/* Regenerates the Crave cartouche outline from brand_assets/crave-logo-official-320.jpg.
   The mark is 4-fold symmetric, so ONE quadrant is traced and mirrored — that is what
   guarantees the plaque cannot come out lopsided, which a whole-outline trace of a
   320px JPEG does. Run from the project root. */
import puppeteer from 'puppeteer';
import fs from 'fs';

const browser = await puppeteer.launch();
const page = await browser.newPage();
const b64 = fs.readFileSync('brand_assets/crave-logo-official-320.jpg').toString('base64');
const t = await page.evaluate(async (b64) => {
  const img = new Image(); img.src='data:image/jpeg;base64,'+b64; await img.decode();
  const W=img.naturalWidth,H=img.naturalHeight;
  const c=document.createElement('canvas');c.width=W;c.height=H;
  const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(img,0,0);
  const d=x.getImageData(0,0,W,H).data;
  const on=(px,py)=>{const i=(py*W+px)*4;return 0.2126*d[i]+0.7152*d[i+1]+0.0722*d[i+2]>128;};
  const top=[],bot=[],lef=[],rig=[];
  for(let px=0;px<W;px++){let a=-1,b=-1;for(let py=0;py<H;py++)if(on(px,py)){if(a<0)a=py;b=py;}
    if(a>=0){top.push([px,a]);bot.push([px,b+1]);}}
  for(let py=0;py<H;py++){let a=-1,b=-1;for(let px=0;px<W;px++)if(on(px,py)){if(a<0)a=px;b=px;}
    if(a>=0){lef.push([py,a]);rig.push([py,b+1]);}}
  return {W,H,top,bot,lef,rig};
}, b64);
await browser.close();

const {W,H,top,bot,lef,rig}=t;
// --- centre of symmetry, from the extents
const xs=top.map(p=>p[0]), ys=lef.map(p=>p[0]);
const cx=(Math.min(...xs)+Math.max(...xs)+1)/2, cy=(Math.min(...ys)+Math.max(...ys)+1)/2;
const halfW=(Math.max(...xs)+1-Math.min(...xs))/2, halfH=(Math.max(...ys)+1-Math.min(...ys))/2;
console.log(`# centre (${cx.toFixed(1)}, ${cy.toFixed(1)})  half ${halfW.toFixed(1)} x ${halfH.toFixed(1)}  aspect ${(halfW/halfH).toFixed(4)}`);

// --- fold all four quadrants of the TOP/BOTTOM traces onto one, in normalised
//     quadrant coords u=(x-cx)/halfW in [0,1], v=(cy-y)/halfH in [0,1].
const fold=new Map();
const add=(u,v)=>{ if(u<0||u>1.0001)return; const k=Math.round(u*400); const e=fold.get(k)||[0,0]; e[0]+=v;e[1]++; fold.set(k,e); };
for(const [px,py] of top){ add(Math.abs(px+0.5-cx)/halfW, (cy-py)/halfH); }
for(const [px,py] of bot){ add(Math.abs(px+0.5-cx)/halfW, (py-cy)/halfH); }
const prof=[...fold.entries()].map(([k,e])=>[k/400, e[0]/e[1]]).sort((a,b)=>a[0]-b[0]);

console.log('\n# folded quadrant profile  u (half-width fraction) -> v (half-height fraction)');
for(const [u,v] of prof) if(Math.round(u*400)%10===0) console.log(`  ${u.toFixed(3)}  ${v.toFixed(4)}`);
fs.writeFileSync('cartouche-profile.json', JSON.stringify(prof));
console.log(`\n# ${prof.length} folded samples -> cartouche-profile.json`);

/* ---------------------------------------------------------------------------
   Fit the folded quadrant with a chain of cubic Beziers.

   Anchors are the STRUCTURAL points read off the profile, not an even spacing:
   the plaque is five lobes across its top (tip-lobe, shoulder, crown, shoulder,
   tip-lobe) and the two flats at v=0.7228 and v=0.356 are real, measured flats
   ~13% and ~5% of the half-width wide. An even sampling rounds both of them off
   and the mark stops reading as a scalloped cartouche at all.

   Handle LENGTHS are least-squares solved per segment; handle DIRECTIONS come
   from the profile's own finite differences, with the apex forced horizontal so
   the mirrored halves meet smoothly instead of in a point.
--------------------------------------------------------------------------- */
const P = JSON.parse(fs.readFileSync('cartouche-profile.json','utf8'));
const at = u => { let best=P[0], bd=Infinity;
  for (const p of P){ const d=Math.abs(p[0]-u); if(d<bd){bd=d;best=p;} } return best[1]; };

const ANCH = [0.000, 0.500, 0.630, 0.775, 0.850, 0.900, 1.000]
  .map(u => [u, u===1 ? 0 : at(u)]);
ANCH[0][1] = 1.0;                                   // apex is the datum

const tangent = (u) => {                            // central difference on the profile
  const h = 0.045, a = at(Math.max(0,u-h)), b = at(Math.min(1,u+h));
  const du = Math.min(1,u+h) - Math.max(0,u-h);
  const v = [du, b-a], m = Math.hypot(...v);        // note: v decreases with u
  return [v[0]/m, v[1]/m];
};

const bez = (p0,p1,p2,p3,t) => { const m=1-t;
  return [m*m*m*p0[0]+3*m*m*t*p1[0]+3*m*t*t*p2[0]+t*t*t*p3[0],
          m*m*m*p0[1]+3*m*m*t*p1[1]+3*m*t*t*p2[1]+t*t*t*p3[1]]; };

const segs=[]; let worst=0;
for (let i=0;i<ANCH.length-1;i++){
  const p0=ANCH[i], p3=ANCH[i+1];
  const d0 = i===0 ? [1,0] : tangent(p0[0]);
  // The tip is the widest row and the apex the highest column, so BOTH are
  // extrema and both tangents follow from that rather than from the samples:
  // a central difference underestimates each, because the curve turns inside
  // one sample and the fit then overshoots the point it is turning around.
  const d1 = i===ANCH.length-2 ? [0,-1] : tangent(p3[0]);
  const pts = P.filter(([u])=>u>=p0[0]&&u<=p3[0]);
  // chord-length parametrise, then grid-search the two handle lengths
  let best=null;
  const span = p3[0]-p0[0];
  const aMax = d0[0]>1e-6 ? span/d0[0] : 0.75, bMax = d1[0]>1e-6 ? span/d1[0] : 0.75;
  for (let a=0.02;a<=Math.min(0.75,aMax);a+=0.005) for (let b=0.02;b<=Math.min(0.75,bMax);b+=0.005){
    const P1=[p0[0]+d0[0]*a, p0[1]+d0[1]*a], P2=[p3[0]-d1[0]*b, p3[1]-d1[1]*b];
    let e=0;
    for (const [u,v] of pts){
      // find t whose x matches u (monotone in x for all our segments)
      let lo=0,hi=1,t=0.5;
      for(let k=0;k<24;k++){ t=(lo+hi)/2; (bez(p0,P1,P2,p3,t)[0]<u)?lo=t:hi=t; }
      e += (bez(p0,P1,P2,p3,t)[1]-v)**2;
    }
    e=Math.sqrt(e/pts.length);
    if(!best||e<best.e) best={e,P1,P2};
  }
  worst=Math.max(worst,best.e);
  const outOfRange = best.P1[0]<p0[0]-1e-6 || best.P1[0]>p3[0]+1e-6
                  || best.P2[0]<p0[0]-1e-6 || best.P2[0]>p3[0]+1e-6;
  segs.push({p0,p3,...best,outOfRange});
  console.log(`seg ${i}  u ${p0[0].toFixed(3)}->${p3[0].toFixed(3)}  rms ${best.e.toFixed(5)}`
    + (outOfRange?'   !! handle leaves segment x-range':''));
}
console.log(`\n# worst segment RMS ${worst.toFixed(5)} of half-height  (= ${(worst*92).toFixed(2)}px at 320)`);
fs.writeFileSync('cartouche-fit.json', JSON.stringify(segs));

/* ---------------------------------------------------------------------------
   Emit the path in the official artwork's own 100-unit square.

   The real logo is a SQUARE: a 320x320 black tile with the plaque inside it at
   84.4% x 57.5%. Keeping the square viewBox is what preserves that lockup, and
   it is also what lets the file drop into the slot the old mark had without
   touching --mark-size anywhere.

   The trace is the plaque's OUTER edge, so the emitted path is offset inward by
   half a stroke: a stroke centred on the traced edge would paint the mark half a
   stroke too big in every direction.
--------------------------------------------------------------------------- */
const SEGS = JSON.parse(fs.readFileSync('cartouche-fit.json','utf8'));
/* Stroke and centre are SOLVED against the traced boundary, not read off a cut.

   The centre had been rounded to (50,50) where the trace put it at (50.6, 49.4).
   Two pixels of the 320 source, and it cost more than the curve fit did: mean
   boundary error 2.90px against 0.84px.

   The stroke must be swept by RE-EMITTING the path, never by changing the
   stroke-width attribute on a path already emitted. The emitted path is the
   stroke's CENTRELINE and its inset is a function of the stroke, so the two move
   together; a sweep that varies only the attribute reported an optimum at 4.6
   that measured 1.97px once it was actually generated. Swept properly the curve
   runs 2.86px at 4.2 to a minimum 0.88px at 5.2 and back up to 0.91px at 5.4. */
const STROKE = 5.2;
const emit = (stroke) => {
  const HW = 42.19 - stroke/2, HH = 28.75 - stroke/2, CX = 50.6, CY = 49.4;
  const map = (sx, sy) => ([u,v]) => [ (CX + sx*u*HW), (CY - sy*v*HH) ];
  const n = x => (Math.round(x*1000)/1000);
  const quad = (sx, sy, rev) => {                   // one quadrant, apex -> tip
    const s = SEGS.map(g=>({p0:g.p0,P1:g.P1,P2:g.P2,p3:g.p3}));
    const list = rev ? [...s].reverse() : s;
    const m = map(sx,sy);
    return list.map(g => rev
      ? `C${[m(g.P2),m(g.P1),m(g.p0)].map(p=>p.map(n).join(' ')).join(',')}`
      : `C${[m(g.P1),m(g.P2),m(g.p3)].map(p=>p.map(n).join(' ')).join(',')}`).join('');
  };
  const apex = map(1,1)([0,1]), tipR = map(1,1)([1,0]), tipL = map(-1,1)([1,0]);
  // top-right (apex->tipR), bottom-right (tipR->apex'), bottom-left, top-left
  return `M${apex.map(n).join(' ')}` + quad(1,1,false)      // apex -> right tip
       + quad(1,-1,true)                                    // right tip -> bottom apex
       + quad(-1,-1,false)                                  // bottom apex -> left tip
       + quad(-1,1,true) + 'Z';                             // left tip -> apex
};
const d = emit(STROKE), dFat = emit(10.6);
fs.writeFileSync('cartouche-path.json', JSON.stringify({d, dFat, stroke: STROKE}, null, 1));
console.log('\n# outline (stroke 5.0):\n' + d);
console.log('\n# thickened for 16px (stroke 11.0):\n' + dFat);
