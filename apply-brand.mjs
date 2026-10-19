/* Re-points the whole site at a different restaurant.

   Reproduce:  node apply-brand.mjs <brand-id>      e.g. node apply-brand.mjs demo
               node apply-brand.mjs --check
               node apply-brand.mjs --list

   WHY THIS EXISTS. The site was built for one real client off researched
   facts, and sending that build to another restaurant would hand the
   recipient a competitor's name, phone number, Instagram handle and 166 real
   prices. This tool swaps every one of those for another brand's, so a
   prospect sees a site with THEIR name on it.

   IT NEVER TOUCHES A COMMENT, and that is deliberate. About half the weight
   of about.html and contact.html is CSS comments, and those comments are the
   project's record of what was measured and why — the same reason build.mjs
   is comment-removal rather than minification. Rewriting them to move a
   brand would destroy the record and change nothing a guest can see, since
   build.mjs strips every one of them out of dist/ anyway.

   THE SWAP IS SYMMETRIC. brands/*.json all carry an identical key set, so
   every value of the outgoing brand has a counterpart in the incoming one
   and the move reverses exactly. apply-brand.mjs demo && apply-brand.mjs
   lapranzo returns the four pages byte-for-byte.

   THE CHECK IS THE POINT. After a swap, NO value of the outgoing brand may
   survive outside a comment. That is the invariant that actually protects
   the client: not "did the name change" but "is any of their data still on
   a page I am about to send to two hundred strangers".

   TOKEN NAMES ARE NOT BRAND DATA. --brand-accent / --brand-device /
   --brand-amber were renamed off --lp-* once, by hand, and stay put. A brand
   file carries VALUES only; renaming a token to move a palette is how a
   rebrand breaks a layout, which this project has learned three times.
*/
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';

const PAGES = ['index.html', 'menu.html', 'about.html', 'contact.html'];

/* NOT HTML, but it carries the brand's name and build.mjs parses and ships
   it — an HTML-only sweep never sees this one. JSON has no comments, so the
   comment-masking below is a no-op on it. */
const EXTRA = ['assets/site.webmanifest'];
const TARGETS = [...PAGES, ...EXTRA];
const STATE = '.brand-state.json';

const args = process.argv.slice(2);
const flag = n => args.includes(n);
const brandFile = id => `brands/${id}.json`;
const load = id => {
  if (!existsSync(brandFile(id))) die(`no such brand: brands/${id}.json`);
  return JSON.parse(readFileSync(brandFile(id), 'utf8'));
};
const die = m => { console.error('apply-brand: ' + m); process.exit(1); };

const list = () => readdirSync('brands').filter(f => f.endsWith('.json') && !f.includes('-menu'))
  .map(f => f.replace('.json', ''));

if (flag('--list')) {
  const cur = currentId();
  for (const id of list()) {
    const b = load(id);
    console.log((id === cur ? '* ' : '  ') + id.padEnd(12) + b.label);
  }
  process.exit(0);
}

function currentId() {
  if (existsSync(STATE)) return JSON.parse(readFileSync(STATE, 'utf8')).brand;
  return 'lapranzo';              /* the build this repo shipped at */
}

/* --- comment-safe transform -------------------------------------------- */
/* Everything between <!-- --> or slash-star star-slash is handed through
   untouched. The pages carry both kinds: HTML comments in the markup, CSS
   comments inside <style>. */
const COMMENT = /<!--[\s\S]*?-->|\/\*[\s\S]*?\*\//g;

function outsideComments(src, fn) {
  let out = '', last = 0, m;
  COMMENT.lastIndex = 0;
  while ((m = COMMENT.exec(src)) !== null) {
    out += fn(src.slice(last, m.index)) + m[0];
    last = m.index + m[0].length;
  }
  return out + fn(src.slice(last));
}

/* Code outside comments, with every comment blanked to equal-length
   whitespace so offsets and line numbers survive. Used by the checks. */
const codeOnly = src => src.replace(COMMENT, m => m.replace(/[^\n]/g, ' '));

/* --- the pair list ------------------------------------------------------ */
/* Ordered LONGEST FROM FIRST. "La Pranzo &amp; Al-Diwan" has to go before
   "La Pranzo", and "lapranzoke" before "lapranzo", or the short key eats the
   head of the long one and leaves a tail behind. */
function pairs(from, to, page) {
  const p = [];
  const add = (a, b) => { if (a && b && a !== b) p.push([a, b]); };

  for (const k of Object.keys(from.identity))     add(from.identity[k],     to.identity[k]);
  for (const k of Object.keys(from.palette))      add(from.palette[k],      to.palette[k]);
  for (const k of Object.keys(from.wordmarkType)) add(from.wordmarkType[k], to.wordmarkType[k]);
  for (const k of Object.keys(from.blocks))       add(from.blocks[k],       to.blocks[k]);

  const fp = from.pages[page], tp = to.pages[page];
  if (fp && tp) { add(fp.title, tp.title); add(fp.description, tp.description); }

  /* ONE FROM MUST NOT HAVE TWO TOS. When a brand uses the same string for
     several roles — a one-word restaurant whose full name, short name and
     copyright line are all "Mezani" — the reverse swap is ambiguous and a
     value-based replace silently picks whichever sorted first. That is how
     "La Pranzo & Al-Diwan" came back as "La Pranzo" and the round trip still
     looked byte-identical, because the loss was symmetric. Anchor the field
     to its markup (a block) instead, and fail loudly until somebody does. */
  const byFrom = new Map();
  for (const [a, b] of p) {
    if (byFrom.has(a) && byFrom.get(a) !== b)
      die(`ambiguous on ${page}: ${JSON.stringify(a)} maps to both ` +
          `${JSON.stringify(byFrom.get(a))} and ${JSON.stringify(b)}.\n` +
          `  Give one of them a context-anchored block instead of a bare value.`);
    byFrom.set(a, b);
  }

  return [...byFrom].sort((a, b) => b[0].length - a[0].length);
}

/* --- check -------------------------------------------------------------- */
/* Every brand this repo has ever carried, so a stray string from any of them
   is caught rather than only the one we happen to be coming from. */
const FOREIGN = [
  ['La Pranzo',      /La Pranzo|LA PRANZO|lapranzo/g],
  ['Al-Diwan',       /Al-Diwan/g],
  ["La Pranzo phone", /254\s?768\s?818833/g],
  ['Haile Selassie', /Haile Selassie/g],
  /* The LANDMARK and the BUILDING are brand data too, and a visual pass is
     what caught them rather than this list: "Next to Ola" sat on the locale
     card through a clean --check because only the street was being looked
     for. A address is not one string. */
  ['Ola station',    /[Nn]ext to Ola|Ola petrol/g],
  ['United Meat',    /United Meat/g],
  ['Crave',          /\bCrave\b|\bCRAVE\b|crave-/g],
  ["Li's",           /Li&rsquo;s|Li's Chinese/g],
  ['Misono',         /\bMisono\b|misono-/g],
];

function check() {
  const cur = currentId();
  const b = load(cur);
  console.log(`current brand: ${cur}  (${b.label})\n`);
  let bad = 0;

  /* 1. the incoming brand's own values are present */
  for (const page of PAGES) {
    const code = codeOnly(readFileSync(page, 'utf8'));
    const want = [b.identity.wordmark, b.pages[page].title];
    for (const w of want) {
      if (!code.includes(w)) { console.log(`  MISSING  ${page}: ${JSON.stringify(w.slice(0, 48))}`); bad++; }
    }
  }

  /* 2. no other brand's data survives outside a comment */
  for (const page of TARGETS) {
    const code = codeOnly(readFileSync(page, 'utf8'));
    for (const [name, re] of FOREIGN) {
      if (name.startsWith(b.identity.shortName) || b.identity.shortName.startsWith(name)) continue;
      const hits = code.match(re);
      if (hits) {
        /* which lines, so it is fixable rather than just reported */
        const lines = [];
        code.split('\n').forEach((l, i) => { if (new RegExp(re.source).test(l)) lines.push(i + 1); });
        console.log(`  FOREIGN  ${page}: ${hits.length}x ${name}  lines ${lines.slice(0, 8).join(', ')}`);
        bad++;
      }
    }
  }

  /* 3. placeholder CTA, which is a warning rather than a failure */
  const idx = codeOnly(readFileSync('index.html', 'utf8'));
  if (idx.includes('254XXXXXXXXX')) {
    console.log('\n  PLACEHOLDER  the reserve CTA points at 254XXXXXXXXX — the primary');
    console.log('               booking link is inert until a real number is set in');
    console.log(`               ${brandFile(cur)}  (identity.phoneE164 / telHref / phoneDisplay)`);
  }

  console.log(bad === 0 ? '\nOK — no foreign brand data outside comments.'
                        : `\n${bad} problem(s).`);
  process.exit(bad === 0 ? 0 : 1);
}

if (flag('--check')) check();

/* --- apply -------------------------------------------------------------- */
const target = args.find(a => !a.startsWith('-'));
if (!target) die('usage: node apply-brand.mjs <brand-id> | --check | --list');

const from = load(currentId());
const to = load(target);
if (from.id === to.id) die(`${target} is already applied`);

if (to.identity.phoneE164.includes('X') && !flag('--allow-placeholder')) {
  console.error(`apply-brand: ${target} has a PLACEHOLDER phone number (${to.identity.phoneE164}).`);
  console.error('  The reserve CTA is the primary booking path on all four pages and it');
  console.error('  would ship dead. Set identity.phoneE164 / telHref / phoneDisplay in');
  console.error(`  ${brandFile(target)}, or pass --allow-placeholder to preview anyway.`);
  process.exit(1);
}

/* A pair whose FROM string is nowhere in any page does NOTHING and says
   nothing — the one failure mode of a find-and-replace brand swap, and the
   reason a block's whitespace has to match the page byte for byte. Tracked
   across all four pages and reported at the end. */
const seen = new Set();

let total = 0;
for (const page of TARGETS) {
  const src = readFileSync(page, 'utf8');
  const ps = pairs(from, to, page);
  let n = 0;
  const out = outsideComments(src, seg => {
    for (const [a, b] of ps) {
      if (!seg.includes(a)) continue;
      seen.add(a);
      n += seg.split(a).length - 1;
      seg = seg.split(a).join(b);
    }
    return seg;
  });
  writeFileSync(page, out);
  console.log(`${page.padEnd(14)} ${String(n).padStart(3)} replacements`);
  total += n;
}

/* Which declared pairs never fired anywhere. */
const declared = new Set();
for (const page of TARGETS) for (const [a] of pairs(from, to, page)) declared.add(a);
const dead = [...declared].filter(a => !seen.has(a));
if (dead.length) {
  console.log(`\n${dead.length} declared value(s) matched NOTHING on any page:`);
  for (const a of dead) console.log('  ' + JSON.stringify(a.length > 70 ? a.slice(0, 70) + '...' : a));
  console.log('  Either the value is unused in the markup (harmless) or its');
  console.log('  whitespace no longer matches the page (the block did nothing).');
}

writeFileSync(STATE, JSON.stringify({ brand: to.id, appliedAt: new Date().toISOString() }, null, 2) + '\n');
console.log(`\n${from.id} -> ${to.id}, ${total} replacements.`);

/* THE CARTE IS NOT PART OF THE SWAP, and forgetting that ships the previous
   restaurant's dishes and prices under the new one's name — the single worst
   leak this tool could leave, because a price list is the most checkable
   thing on the site. menu.html's grid is generated, not hand-written, so it
   moves by regenerating it rather than by find-and-replace. */
const menuFile = `brands/${to.id}-menu.json`;
const menuHint = existsSync(menuFile) ? menuFile
               : to.id === 'lapranzo' ? 'lapranzo-menu.json'
               : `brands/${to.id}-menu.json  (does not exist yet — copy one and edit it)`;
console.log(`\nNEXT, and it is not optional — the carte is generated separately and`);
console.log(`still holds ${from.id}'s dishes and prices:`);
console.log(`  node build-carte.mjs ${menuHint.split(' ')[0]} && node apply-carte.mjs`);
console.log(`  node apply-brand.mjs --check`);
