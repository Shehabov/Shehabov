/**
 * gen_stats.js · "Impact in the field" card (impact.svg).
 * Self-contained SVG, never a broken image. Numbers are Shehab's real,
 * self-reported field metrics from shehabberam.com. Refresh + re-run:
 *   node scripts/gen_stats.js
 */
const fs = require('fs');
const path = require('path');

const C = { bg:'#0d1117', border:'#30363d',
  blue:'#58a6ff', green:'#3fb950', purple:'#d2a8ff', cyan:'#39c5cf',
  yellow:'#e3b341', white:'#e6edf3', gray:'#8b949e' };

const SANS = "Segoe UI,-apple-system,Helvetica,Arial,sans-serif";
const MONO = "ui-monospace,SFMono-Regular,Consolas,monospace";
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const TILES = [
  { big: '15+',    label: 'Product launches',        color: C.blue },
  { big: '$4M+',   label: 'Revenue generated',       color: C.green },
  { big: '6M+',    label: 'Users impacted',          color: C.purple },
  { big: '100+',   label: 'PMs & founders coached',  color: C.cyan },
  { big: '2+',     label: 'Teams built & scaled',    color: C.yellow },
  { big: '$500K+', label: 'Efficiencies unlocked',   color: C.blue },
];

const W = 840, H = 288, PAD = 40, R = 12;
const cols = 3, rows = 2;
const gridTop = 74, gridBot = H - 40;
const colW = (W - 2 * PAD) / cols;
const rowH = (gridBot - gridTop) / rows;

const tilesSvg = TILES.map((t, i) => {
  const c = i % cols, r = Math.floor(i / cols);
  const cx = PAD + colW * (c + 0.5);
  const cy = gridTop + rowH * (r + 0.5);
  return `
  <text x="${cx.toFixed(1)}" y="${(cy - 4).toFixed(1)}" text-anchor="middle" font-family="${SANS}" font-size="42" font-weight="700" fill="${t.color}">${esc(t.big)}</text>
  <text x="${cx.toFixed(1)}" y="${(cy + 22).toFixed(1)}" text-anchor="middle" font-family="${SANS}" font-size="13" fill="${C.gray}" letter-spacing="0.3">${esc(t.label)}</text>`;
}).join('');

// column dividers
const dividers = [1, 2].map(c => {
  const x = PAD + colW * c;
  return `<line x1="${x.toFixed(1)}" y1="${gridTop + 6}" x2="${x.toFixed(1)}" y2="${gridBot - 6}" stroke="${C.border}" stroke-width="1"/>`;
}).join('');
// row divider
const rowDiv = `<line x1="${PAD + 6}" y1="${gridTop + rowH}" x2="${W - PAD - 6}" y2="${gridTop + rowH}" stroke="${C.border}" stroke-width="1"/>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Impact in the field: Shehab Beram">
  <defs>
    <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.04"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="${R}" fill="${C.bg}" stroke="${C.border}" stroke-width="1.5"/>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="${R}" fill="url(#sheen)"/>

  <rect x="${PAD}" y="34" width="4" height="18" rx="2" fill="${C.blue}"/>
  <text x="${PAD + 14}" y="49" font-family="${SANS}" font-size="16" font-weight="600" fill="${C.white}">Impact in the field</text>
  <text x="${W - PAD}" y="49" text-anchor="end" font-family="${MONO}" font-size="13" fill="${C.gray}">shehabberam.com</text>

  ${dividers}
  ${rowDiv}
  ${tilesSvg}
</svg>
`;

fs.writeFileSync(path.join(__dirname, '..', 'impact.svg'), svg, 'utf8');
console.log(`impact.svg written (${W}x${H})`);
