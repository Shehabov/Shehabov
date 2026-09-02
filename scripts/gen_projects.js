/**
 * gen_projects.js · animated "projects" terminal (projects.svg).
 * Demos querying projects; in the README it links to the live interactive
 * terminal so visitors can query any project themselves. Brand palette.
 *   node scripts/gen_projects.js
 */
const fs = require('fs');
const path = require('path');
const { C } = require('./lib_term');

const W = 840, FONT = 15, LINE_H = 25, PAD_X = 26, BAR_H = 44;
const Y0 = BAR_H + 30, CHAR_W = 9.2, START = 0.5;
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const P = () => ([
  ['shehab', C.green], ['@', C.gray], ['fdpm', C.cyan],
  [':', C.gray], ['~/projects', C.blue], ['$ ', C.gray],
]);
const L = (segs, opts = {}) => ({ segs, cmd: !!opts.cmd, fast: !!opts.fast });
const BLANK = null;

const lines = [
  L([...P(), ['ls', C.white]], { cmd: true }),
  L([['pre-ai/', C.blue], ['   ', C.gray], ['ml-and-data/', C.blue], ['   ', C.gray], ['ai-workflows/', C.blue], ['   ', C.gray], ['ai-era/', C.blue]], { fast: true }),
  BLANK,
  L([...P(), ['info heartly', C.white]], { cmd: true }),
  L([['▸ ', C.green], ['Heartly', C.white], ['  heart-attack risk predictor (ML + web)', C.gray]]),
  L([['  github.com/Shehabov/Heartly', C.blue]], { fast: true }),
  BLANK,
  L([...P(), ['info competitor-intel', C.white]], { cmd: true }),
  L([['▸ ', C.green], ['Competitor Intelligence', C.white], ['  weekly AI reports, on n8n', C.gray]]),
  L([['  scrapes site, LinkedIn, X, reviews → GPT analysis → emailed', C.gray]], { fast: true }),
  BLANK,
  L([...P(), ['open --live', C.white]], { cmd: true }),
  L([['→ ', C.green], ['launching explorer... ', C.gray], ['click to query any project ↓', C.yellow]]),
  BLANK,
  L([...P()], { cmd: true }),
];

const H = Y0 + (lines.length - 1) * LINE_H + 24;

let t = START;
const clips = [], body = [];
let lastPromptBaseline = Y0;

lines.forEach((ln, i) => {
  const baseline = Y0 + i * LINE_H;
  if (ln === null) { t += 0.16; return; }
  const text = ln.segs.map(s => s[0]).join('');
  const chars = [...text].length;
  const width = chars * CHAR_W + 14;
  const perChar = ln.cmd ? 0.05 : ln.fast ? 0.008 : 0.014;
  const dur = Math.max(ln.cmd ? 0.5 : ln.fast ? 0.18 : 0.26, chars * perChar);
  const clipId = `pclip${i}`;
  clips.push(
    `<clipPath id="${clipId}"><rect x="${PAD_X}" y="${baseline - LINE_H + 6}" width="0" height="${LINE_H}">` +
    `<animate attributeName="width" from="0" to="${width.toFixed(1)}" begin="${t.toFixed(2)}s" dur="${dur.toFixed(2)}s" fill="freeze" calcMode="linear"/></rect></clipPath>`
  );
  const tspans = ln.segs.map(([txt, col]) => `<tspan fill="${col}">${esc(txt)}</tspan>`).join('');
  body.push(
    `<text x="${PAD_X}" y="${baseline}" clip-path="url(#${clipId})" ` +
    `font-family="ui-monospace,SFMono-Regular,Consolas,'DejaVu Sans Mono',Menlo,monospace" font-size="${FONT}" xml:space="preserve">${tspans}</text>`
  );
  if (ln.cmd && i === lines.length - 1) lastPromptBaseline = baseline;
  t += dur + (ln.cmd ? 0.12 : ln.fast ? 0.03 : 0.05);
});

const promptW = [...P()].map(s => s[0]).join('').length * CHAR_W;
const curX = PAD_X + promptW + 2;
const cursor =
  `<rect x="${curX.toFixed(1)}" y="${lastPromptBaseline - 14}" width="9" height="17" fill="${C.white}" opacity="0">` +
  `<animate attributeName="opacity" values="1;1;0;0;1" keyTimes="0;0.45;0.5;0.95;1" dur="1.05s" begin="${t.toFixed(2)}s" repeatCount="indefinite"/></rect>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Projects terminal: query my projects">
  <defs>
    <linearGradient id="glassP" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.04"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    ${clips.join('\n    ')}
  </defs>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="12" fill="${C.bg}" stroke="${C.border}" stroke-width="1.5"/>
  <rect x="1" y="1" width="${W - 2}" height="${BAR_H}" rx="12" fill="${C.bar}"/>
  <rect x="1" y="${BAR_H - 12}" width="${W - 2}" height="12" fill="${C.bar}"/>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="12" fill="url(#glassP)"/>
  <line x1="1" y1="${BAR_H}" x2="${W - 1}" y2="${BAR_H}" stroke="${C.border}" stroke-width="1"/>
  <circle cx="26" cy="22" r="6" fill="#ff5f56"/>
  <circle cx="46" cy="22" r="6" fill="#ffbd2e"/>
  <circle cx="66" cy="22" r="6" fill="#21EA9D"/>
  <text x="${W / 2}" y="27" text-anchor="middle" fill="${C.gray}" font-family="ui-monospace,SFMono-Regular,Consolas,monospace" font-size="13">shehab@fdpm: ~/projects · query me</text>
  ${body.join('\n  ')}
  ${cursor}
</svg>
`;

fs.writeFileSync(path.join(__dirname, '..', 'projects.svg'), svg, 'utf8');
console.log(`projects.svg written (${W}x${H})`);
