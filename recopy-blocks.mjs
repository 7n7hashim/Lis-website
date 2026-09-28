/* Re-copies the reserve and ending blocks from index.html to the other three
   pages. Run from the project root after ANY edit to those blocks in
   index.html:  node recopy-blocks.mjs  [--check]

   --check verifies without writing, and is what the CLAUDE.md diff snippet does.

   EVERY RANGE IS RE-DERIVED IN BOTH FILES, AND BOTH ENDS ARE ANCHORED.
   Bounding a block by a LENGTH carried from index.html is the trap this tool
   exists to stop, and it has now fired twice:

     · A fixed-length window over the ending CSS once reported about.html
       differing on its last line. The copy was byte-identical; the window had
       run one line past the block's true end into the whitespace belonging to
       the adaptation block that follows.

     · On 2026-09-28 the reserve MARKUP grew eight lines in index.html, and a
       length-based splice therefore ate eight lines PAST the end of each
       target's older, shorter block — taking `</main>`, the ending marker and
       `<footer class="ending">` with it on all three pages at once. Nothing
       errored. The pages still rendered, because a browser closes an unclosed
       <footer> at </body> for you.

   So: find the START anchor and the END anchor in the target independently,
   and replace what lies between them. */
import fs from 'fs';

const CHECK = process.argv.includes('--check');

/* start anchor, end anchor, and how far past the end match the block runs */
const BLOCKS = [
  { name: 'reserve CSS', start: /^  \/\* -+ reserve \*\//,            end: /^  \/\* ={10,}/, endOffset: -1 },
  { name: 'ending CSS',  start: /^  \/\* ={10,} ending/,              end: /^  \/\* ={10,}/, endOffset: -2, endFrom: 1 },
  { name: 'reserve mk',  start: /^  <section class="reserve" id="reserve"/, end: /^  <\/section>/, endOffset: 0 },
  { name: 'ending mk',   start: /^<!-- ={10,} ending ==== -->/,       end: /^<\/footer>/,    endOffset: 0 },
];

const range = (lines, b) => {
  const s = lines.findIndex(l => b.start.test(l));
  if (s < 0) throw new Error(`start anchor not found: ${b.name}`);
  let e = -1;
  for (let i = s + 1 + (b.endFrom || 0); i < lines.length; i++)
    if (b.end.test(lines[i])) { e = i + b.endOffset; break; }
  if (e < 0) throw new Error(`end anchor not found: ${b.name}`);
  return [s, e];
};

const src = fs.readFileSync('index.html', 'utf8').split('\n');
const blocks = BLOCKS.map(b => {
  const [s, e] = range(src, b);
  return { ...b, lines: src.slice(s, e + 1) };
});

let bad = 0;
for (const page of ['menu.html', 'about.html', 'contact.html']) {
  const d = fs.readFileSync(page, 'utf8').split('\n');
  // Splice back-to-front so an earlier block's length change cannot move a
  // later block's range out from under it.
  const plan = blocks.map(b => ({ b, r: range(d, b) })).sort((x, y) => y.r[0] - x.r[0]);
  for (const { b, r } of plan) {
    const have = d.slice(r[0], r[1] + 1);
    const same = have.length === b.lines.length && have.every((l, i) => l === b.lines[i]);
    if (CHECK) {
      console.log(`${page.padEnd(13)} ${b.name.padEnd(12)} ` +
        (same ? 'IDENTICAL' : `DIFFERS (${have.length} lines here, ${b.lines.length} in index.html)`));
      if (!same) {
        bad++;
        for (let i = 0; i < Math.max(have.length, b.lines.length) && i < 400; i++)
          if (have[i] !== b.lines[i]) {
            console.log(`    index.html:${JSON.stringify(b.lines[i] ?? null)}`);
            console.log(`    ${page}:${JSON.stringify(have[i] ?? null)}`);
            break;
          }
      }
    } else if (!same) {
      d.splice(r[0], r[1] - r[0] + 1, ...b.lines);
    }
  }
  if (!CHECK) fs.writeFileSync(page, d.join('\n'));
}
if (!CHECK) console.log('re-copied 4 blocks into 3 pages');
process.exit(bad ? 1 : 0);
