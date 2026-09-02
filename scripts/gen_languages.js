/**
 * gen_languages.js · dark "Languages" card (languages.svg).
 * Matches impact.svg / terminal.svg so the Stats section stays cohesive.
 * Data is the real language mix across Shehab's repositories. Re-run:
 *   node scripts/gen_languages.js
 */
const fs = require('fs');
const path = require('path');

const C = { bg:'#0d1117', border:'#30363d', track:'#21262d',
  blue:'#58a6ff', white:'#e6edf3', gray:'#8b949e' };
const SANS = "Segoe UI,-apple-system,Helvetica,Arial,sans-serif";
const MONO = "ui-monospace,SFMono-Regular,Consolas,monospace";
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// real mix by repository, ordered for colour contrast
const LANGS = [
  { name: 'HTML',       pct: 29, color: '#e34c26' },
  { name: 'JavaScript', pct: 12, color: '#f1e05a' },
  { name: 'Python',     pct: 12, color: '#3572A5' },
  { name: 'Jupyter',    pct: 29, color: '#DA5B0B' },
  { name: 'Java',       pct: 6,  color: '#b07219' },
  { name: 'Dart',       pct: 6,  color: '#00B4AB' },
  { name: 'CSS',        pct: 6,  color: '#663399' },
];

const W = 840, H = 150, PAD = 40, R = 12;
const barY = 78, barH = 16, barX = PAD, barW = W - 2 * PAD;

let acc = 0;
const segs = LANGS.map(l => {
  const x = barX + (acc / 100) * barW;
  const w = (l.pct / 100) * barW;
  acc += l.pct;
  return `<rect x="${x.toFixed(1)}" y="${barY}" width="${(w + 0.6).toFixed(1)}" height="${barH}" fill="${l.color}"/>`;
}).join('');

const legendY = barY + 42;
let lx = PAD;
const legend = LANGS.map(l => {
  const label = `${l.name} ${l.pct}%`;
  const w = 22 + label.length * 7.1;
  const item = `
    <circle cx="${lx + 6}" cy="${legendY - 4}" r="5" fill="${l.color}"/>
    <text x="${lx + 18}" y="${legendY}" font-family="${SANS}" font-size="13" fill="${C.white}">${esc(label)}</text>`;
  lx += w + 16;
  return item;
}).join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Languages across Shehab's repositories">
  <defs>
    <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.04"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <clipPath id="barclip"><rect x="${barX}" y="${barY}" width="${barW}" height="${barH}" rx="8"/></clipPath>
  </defs>

  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="${R}" fill="${C.bg}" stroke="${C.border}" stroke-width="1.5"/>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="${R}" fill="url(#sheen)"/>

  <rect x="${PAD}" y="30" width="4" height="18" rx="2" fill="${C.blue}"/>
  <text x="${PAD + 14}" y="45" font-family="${SANS}" font-size="16" font-weight="600" fill="${C.white}">Languages</text>
  <text x="${W - PAD}" y="45" text-anchor="end" font-family="${MONO}" font-size="13" fill="${C.gray}">across my repositories</text>

  <rect x="${barX}" y="${barY}" width="${barW}" height="${barH}" rx="8" fill="${C.track}"/>
  <g clip-path="url(#barclip)">${segs}</g>
  ${legend}
</svg>
`;

fs.writeFileSync(path.join(__dirname, '..', 'languages.svg'), svg, 'utf8');
console.log(`languages.svg written (${W}x${H})`);
