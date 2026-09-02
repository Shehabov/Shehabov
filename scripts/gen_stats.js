/**
 * gen_stats.js · "Impact" as a terminal window (impact.svg).
 * Numbers are Shehab's real, self-reported field metrics from shehabberam.com.
 *   node scripts/gen_stats.js
 */
const fs = require('fs');
const path = require('path');
const { C, SANS, BAR_H, esc, windowSvg } = require('./lib_term');

const TILES = [
  { big: '15+',    label: 'Product launches',        color: C.blue },
  { big: '$4M+',   label: 'Revenue generated',       color: C.green },
  { big: '6M+',    label: 'Users impacted',          color: C.purple },
  { big: '100+',   label: 'PMs & founders coached',  color: C.cyan },
  { big: '2+',     label: 'Teams built & scaled',    color: C.yellow },
  { big: '$500K+', label: 'Efficiencies unlocked',   color: C.blue },
];

const W = 840, H = 300, PAD = 40;
const cols = 3, rows = 2;
const gridTop = 96, gridBot = H - 26;
const colW = (W - 2 * PAD) / cols;
const rowH = (gridBot - gridTop) / rows;

const tiles = TILES.map((t, i) => {
  const c = i % cols, r = Math.floor(i / cols);
  const cx = PAD + colW * (c + 0.5);
  const cy = gridTop + rowH * (r + 0.5);
  return `
  <text x="${cx.toFixed(1)}" y="${(cy-4).toFixed(1)}" text-anchor="middle" font-family="${SANS}" font-size="42" font-weight="700" fill="${t.color}">${esc(t.big)}</text>
  <text x="${cx.toFixed(1)}" y="${(cy+22).toFixed(1)}" text-anchor="middle" font-family="${SANS}" font-size="13" fill="${C.gray}" letter-spacing="0.3">${esc(t.label)}</text>`;
}).join('');

const dividers = [1,2].map(c => {
  const x = PAD + colW*c;
  return `<line x1="${x.toFixed(1)}" y1="${gridTop+4}" x2="${x.toFixed(1)}" y2="${gridBot-4}" stroke="${C.border}" stroke-width="1"/>`;
}).join('');
const rowDiv = `<line x1="${PAD+6}" y1="${gridTop+rowH}" x2="${W-PAD-6}" y2="${gridTop+rowH}" stroke="${C.border}" stroke-width="1"/>`;

const inner = `${dividers}\n  ${rowDiv}\n  ${tiles}`;

fs.writeFileSync(path.join(__dirname, '..', 'impact.svg'),
  windowSvg({ W, H, title: 'shehab@fdpm: ~/impact', command: 'cat impact.md', inner, aria: 'Impact in the field' }), 'utf8');
console.log(`impact.svg written (${W}x${H})`);
