/* Generates menu.html's carte from La Pranzo's own published menu.

   Source: lapranzo-menu.json, read 2026-09-30 from the twelve menu boards
   La Pranzo publishes on its own site, la-pranzo-al-diwan.odoo.com, which is
   linked from its Instagram bio and is the only menu it publishes anywhere.
   166 dishes, 19 courses. Nothing here is invented.

   THE SOURCE IS PHOTOGRAPHS, NOT AN API, AND THAT IS THE ONE REAL DIFFERENCE
   FROM THE CARTE THIS REPLACES. Crave's carte came off a JSON endpoint and
   could not be mistranscribed; these prices were read off twelve images. The
   figures are sound, but they carry a transcription risk an endpoint does
   not, and re-reading them is the first item on the client list rather than
   the last.

   Three things this encodes:

   - THE BOARDS' OWN TYPOS ARE KEPT. "Fajta", "Brest", "Mini pancke",
     "Frappucino", "Iced Macciato", "Wafal", "white Mocha". They are the
     client's wording on the client's menu, and silently correcting a menu is
     how a site starts disagreeing with the room it describes. Only COURSE
     headings are normalised, because those are structural labels rather than
     the menu's own words.

   - A PRICE PAIR IS A SIZE, NOT TWO DISHES. Pizza is printed with an M and
     an L column; that is one dish at two prices, set "KSh 900 - 1,100", and
     the course carries the note that says which is which.

   - THE SIGNATURES COURSE IS NOT A PICK. Seven items on this carte are named
     after the house, and the four that open the page are the showpiece, the
     chips reviewers name first, the rice dish the grill is built around and
     the top of the kunafa board.

   Run from the project root:  node build-carte.mjs
*/
import fs from 'fs';

const d = JSON.parse(fs.readFileSync('lapranzo-menu.json', 'utf8'));

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };
const esc = s => s.replace(/[&<>]/g, c => ESC[c]).replace(/'/g, '&rsquo;');

const money = p => 'KSh ' + [].concat(p).map(n => n.toLocaleString('en-US')).join(' &middot; ');

const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/* The wide opening course. Every price is the carte's own. */
const SIG = [
  ['Mix Grilled Platter', 2500, 'The top of the carte and the table everyone else in the room is looking at. Half at 1,500.'],
  ['La Pranzo Chips', 650, 'The house chips. Seven things on this menu are named after the house and these are the ones reviewers name first.'],
  ['Mandi', 800, 'Mutton, on rice cooked under it. Also chicken, breast or legs, and beside it zurbian, hanith and madhabi.'],
  ['Kunafa Pistachio', 800, 'The top of a board with five kunafas on it, which is four more than most kitchens attempt.'],
];

let out = [], nDish = 0;

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

for (const c of d.courses) {
  const id = 'course-' + slug(c.name);
  out.push(`        <section class="course" aria-labelledby="${id}">
          <h3 class="course__name" id="${id}">${esc(c.name)}</h3>${c.note ? `
          <p class="course__note">${esc(c.note)}</p>` : ''}
          <div class="course__list">`);
  for (const it of c.items) {
    nDish++;
    out.push(`            <div class="dish">
              <p class="dish__name">${esc(it.name)}</p>
              <p class="dish__price">${money(it.price)}</p>
            </div>`);
  }
  out.push(`          </div>
        </section>
`);
}

fs.writeFileSync('carte.generated.html', out.join('\n'));
console.log(`${nDish} dishes across ${d.courses.length} courses -> carte.generated.html`);
