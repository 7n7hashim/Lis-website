/* Generates menu.html's carte from Crave's own published menu.

   Source: crave-menu.json, fetched 2026-09-28 from
   https://api.oddmenu.com/place/EN/cravekenya — the endpoint behind the QR
   menu Crave links from its Google listing. 262 items, 38 categories, four
   menus. Nothing here is invented.

   Three things this encodes:

   - Crave's own descriptions are set in MATHEMATICAL-BOLD UNICODE
     (U+1D400 block: "ð“ð°ð¨ ð¬ð¥ð¢ðœðžð¬"). That is styling smuggled into text.
     A screen reader says nothing useful for it, a browser cannot find it,
     and it is not a typeface. NFKC normalises it back to letters.

   - An item priced 0 is a GAP IN THE SOURCE, not a free dish. Five of them
     sit beside near-identical siblings that do carry a price (Pink Lemonade
     against four lemonades at 500). They are kept, with the price left as an
     em dash and flagged in the carte's note, because dropping a real menu
     item to tidy a table is worse than admitting the price is unpublished.

   - An item carrying VARIANTS is one row in the source and several dishes on
     a menu. TEAS is a single record with eighteen options.

   Run from the project root:  node build-carte.mjs
*/
import fs from 'fs';

const d = JSON.parse(fs.readFileSync('crave-menu.json', 'utf8'));
const norm = s => (s || '').normalize('NFKC').replace(/\s+/g, ' ').trim();

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };
const esc = s => s.replace(/[&<>]/g, c => ESC[c])
                  .replace(/'/g, '&rsquo;').replace(/ - /g, ' &mdash; ');

/* Crave writes its own category and item names in a mix of ALL CAPS, Title
   Case and lower case. Title-casing them is the one place this file changes
   the source, and the exceptions list is why it is safe to. */
const KEEP = { c3:'C3', bbq:'BBQ', xl:'XL', vip:'VIP', v60:'V60', '&':'&' };
const LOWER = new Set(['and','or','of','the','a','with','in','on','&']);
const title = s => norm(s).toLowerCase().split(' ').map((w, i) => {
  const bare = w.replace(/[^a-z0-9&]/g, '');
  if (KEEP[bare]) return w.replace(bare, KEEP[bare]);
  if (i && LOWER.has(bare)) return w;
  // Capitalise the first letter of the word, where "first" means at the
  // start or after a non-alphanumeric. Anchoring at ^ alone left "(loaded
  // fries)" lower case; capitalising the first letter ANYWHERE turned the
  // times into "6Am" and "12Pm".
  return w.replace(/(^|[^a-z0-9])([a-z])/i, (m, a, b) => a + b.toUpperCase());
}).join(' ');

const money = p => {
  const list = Array.isArray(p) ? p : [p];
  const ns = list.map(Number).filter(n => n && !Number.isNaN(n));
  if (!ns.length) return '&mdash;';
  return 'KSh ' + ns.map(n => n.toLocaleString('en-US')).join(' &middot; ');
};

/* MOMBASA SPECIALS is moved up to sit with the food rather than after
   fourteen categories of drinks, which is where the source puts it. It is
   food, and it is the one part of the carte that exists at one branch only —
   burying it at the foot of the page hides the most branch-specific fact on
   the site. */
const ORDER = ['FOOD', 'MOMBASA SPECIALS', 'DESSERTS', 'DRINKS'];

/* Two category HEADINGS carry plain typos in the source. Headings are
   structural labels rather than the menu's own wording, so these two are
   corrected; every ITEM name is left exactly as Crave writes it, including
   "Crossaintwich", "Eggs Benedits" and "Ceaser Salad", which are theirs. */
const HEADING_FIX = { 'Iced Coffes': 'Iced Coffees', 'Sea Food': 'Seafood' };

const slug = s => norm(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

let out = [], nDish = 0, nZero = 0;

/* The wide opening course. These four are the items Google's listing badges
   "Popular" and the ones TripAdvisor reviewers name most; every price is the
   carte's own. */
const SIG = [
  ['Seafood Platter', 9500, 'The top of the carte. Lobster, prawns and fish on one plate, and the dish both branches point at when they talk about the coast.'],
  ['Lobster Thermidor', 4500, 'Split, the meat folded back into its own shell under a mustard cream and browned.'],
  ['Chicken Loaded Fries', 1000, 'The C3 chips. What Crave is known for and what reviewers name before anything else.'],
  ['BBQ Chicken Pizza', 1100, 'On Google’s listing as one of three items badged Popular, alongside the platter.'],
];
out.push(`        <section class="course course--wide" aria-labelledby="course-signatures">
          <h3 class="course__name" id="course-signatures">Signatures</h3>
          <div class="course__list">`);
for (const [n, p, note] of SIG) {
  out.push(`            <div class="dish">
              <p class="dish__name">${esc(n)}</p>
              <p class="dish__price">${money(p)}</p>
              <p class="dish__note">${esc(note)}</p>
            </div>`);
}
out.push(`          </div>
        </section>
`);

for (const menuName of ORDER) {
  const m = d.menus.find(x => norm(x.info.name).toUpperCase() === menuName);
  if (!m) throw new Error('menu not found: ' + menuName);
  const cats = d.menuCategories.filter(c => c.menuId === m.id).sort((a, b) => a.position - b.position);
  for (const c of cats) {
    const items = d.menuItems.filter(i => i.menuCategoryId === c.id && i.isVisible !== false)
                             .sort((a, b) => a.position - b.position);
    if (!items.length) continue;
    const name = (x => HEADING_FIX[x] || x)(title(c.info.name));
    const id = 'course-' + slug(c.info.name);
    const rows = [];
    for (const it of items) {
      const opts = it.variant && it.variant.options || [];
      /* A variant list is one of two different things and they cannot be
         rendered the same way. "V60 {HOT, COLD}" is ONE dish at two prices —
         the shape the old carte already had for "Peking Duck  KSh 2,900 ·
         4,900". "TEAS {BLACK TEA, MASALA TEA, ...}" is a CONTAINER whose
         eighteen options are eighteen dishes. Expanding the first kind gives
         you a dish called "Cold"; merging the second gives you one row with
         eighteen prices on it. */
      const MODIFIER = /^(hot|cold|iced|small|large|regular)$/i;
      const isModifier = opts.length && opts.every(o => MODIFIER.test(norm(o.info.title)));
      if (opts.length && !isModifier) {
        for (const o of opts) rows.push([title(o.info.title), o.price, '']);
      } else if (isModifier) {
        const ps = [...new Set(opts.map(o => Number(o.price)).filter(Boolean))]
                     .sort((a, b) => a - b);
        rows.push([title(it.info.name), ps, norm(it.info.description)]);
      } else {
        rows.push([title(it.info.name), it.price, norm(it.info.description)]);
      }
    }
    out.push(`        <section class="course" aria-labelledby="${id}">
          <h3 class="course__name" id="${id}">${esc(name)}</h3>
          <div class="course__list">`);
    for (const [n, p, note] of rows) {
      nDish++; if (money(p) === '&mdash;') nZero++;
      out.push(`            <div class="dish">
              <p class="dish__name">${esc(n)}</p>
              <p class="dish__price">${money(p)}</p>${note ? `
              <p class="dish__note">${esc(note)}</p>` : ''}
            </div>`);
    }
    out.push(`          </div>
        </section>
`);
  }
}

fs.writeFileSync('carte.generated.html', out.join('\n'));
console.log(`${nDish} dishes, ${nZero} with no published price -> carte.generated.html`);
