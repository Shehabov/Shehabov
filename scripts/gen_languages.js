/**
 * gen_languages.js · "Languages" as a terminal window (languages.svg).
 * Real language mix across Shehab's repositories.
 *   node scripts/gen_languages.js
 */
const fs = require('fs');
const path = require('path');
const { C, SANS, esc, windowSvg } = require('./lib_term');

const LANGS = [
  { name: 'HTML',       pct: 29, color: '#e34c26' },
  { name: 'JavaScript', pct: 12, color: '#f1e05a' },
  { name: 'Python',     pct: 12, color: '#3572A5' },
  { name: 'Jupyter',    pct: 29, color: '#DA5B0B' },
  { name: 'Java',       pct: 6,  color: '#b07219' },
  { name: 'Dart',       pct: 6,  color: '#00B4AB' },
  { name: 'CSS',        pct: 6,  color: '#663399' },
];

const W = 840, H = 170, PAD = 40;
const barY = 92, barH = 16, barX = PAD, barW = W - 2 * PAD;

let acc = 0;
const segs = LANGS.map(l => {
  const x = barX + (acc/100)*barW, w = (l.pct/100)*barW;
  acc += l.pct;
  return `<rect x="${x.toFixed(1)}" y="${barY}" width="${(w+0.6).toFixed(1)}" height="${barH}" fill="${l.color}"/>`;
}).join('');

const legendY = barY + 42;
let lx = PAD;
const legend = LANGS.map(l => {
  const label = `${l.name} ${l.pct}%`, w = 22 + label.length*7.1;
  const item = `<circle cx="${lx+6}" cy="${legendY-4}" r="5" fill="${l.color}"/><text x="${lx+18}" y="${legendY}" font-family="${SANS}" font-size="13" fill="${C.white}">${esc(label)}</text>`;
  lx += w + 16;
  return item;
}).join('');

const inner = `
  <clipPath id="barclip"><rect x="${barX}" y="${barY}" width="${barW}" height="${barH}" rx="8"/></clipPath>
  <rect x="${barX}" y="${barY}" width="${barW}" height="${barH}" rx="8" fill="${C.track}"/>
  <g clip-path="url(#barclip)">${segs}</g>
  ${legend}`;

fs.writeFileSync(path.join(__dirname, '..', 'languages.svg'),
  windowSvg({ W, H, title: 'shehab@fdpm: ~/languages', command: 'scc --by-repo', inner, aria: 'Languages across my repositories' }), 'utf8');
console.log(`languages.svg written (${W}x${H})`);
