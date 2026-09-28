// Contrast helper. `node contrast.mjs '#111' '#fff' ...` prints the matrix.
const srgb = c => { c/=255; return c<=0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055,2.4); };
const hex2rgb = h => { h=h.replace('#',''); if(h.length===3)h=[...h].map(c=>c+c).join('');
  return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16)); };
export const lum = h => { const [r,g,b]=hex2rgb(h); return 0.2126*srgb(r)+0.7152*srgb(g)+0.0722*srgb(b); };
export const ratio = (a,b) => { const [x,y]=[lum(a),lum(b)].sort((p,q)=>q-p); return (x+0.05)/(y+0.05); };
if (process.argv[2]) {
  const cs = process.argv.slice(2);
  const w = 10;
  console.log(''.padEnd(w) + cs.map(c=>c.padStart(w)).join(''));
  for (const a of cs) console.log(a.padEnd(w) + cs.map(b=>ratio(a,b).toFixed(2).padStart(w)).join(''));
}
