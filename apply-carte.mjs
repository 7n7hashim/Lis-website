/* Splices carte.generated.html into menu.html, between the <div
   class="carte__grid"> that opens the grid and the </div> that closes it.

   This exists because build-carte.mjs writes the grid but nothing used to
   put it into the page, so the splice was done by hand — and a hand splice
   of a 1,500-line block is exactly the kind of thing that eats a closing tag
   and still renders, because a browser will close a <div> at </body> for you.

   Both ends are anchored independently in the target, for the same reason
   recopy-blocks.mjs anchors both ends of its blocks: a length-based splice
   has failed twice on this project.

   Run from the project root, after build-carte.mjs:  node apply-carte.mjs
*/
import fs from 'fs';

const grid = fs.readFileSync('carte.generated.html', 'utf8').replace(/\n+$/, '');
const page = fs.readFileSync('menu.html', 'utf8').split('\n');

const open = page.findIndex(l => /^\s*<div class="carte__grid">\s*$/.test(l));
if (open < 0) throw new Error('menu.html: <div class="carte__grid"> not found');

/* The close is the first </div> at the grid's OWN indentation after it.
   Matching "the next </div>" would take the first dish's. */
const indent = page[open].match(/^\s*/)[0];
const close = page.findIndex((l, i) => i > open && l === indent + '</div>');
if (close < 0) throw new Error('menu.html: the grid\'s closing </div> not found');

const before = close - open - 1;
page.splice(open + 1, before, ...grid.split('\n'));
fs.writeFileSync('menu.html', page.join('\n'));

const courses = (grid.match(/<section class="course/g) || []).length;
const dishes  = (grid.match(/<div class="dish">/g) || []).length;
console.log(`spliced ${dishes} dishes in ${courses} sections ` +
            `(${before} lines out, ${grid.split('\n').length} in)`);
