/**
 * gen_terminal.js
 * Generates an auto-playing, self-contained animated SVG "terminal" for the
 * GitHub profile README. No external services, no JS at runtime — pure SMIL
 * animation that renders natively on GitHub (like readme-typing-svg).
 *
 * Run:  node scripts/gen_terminal.js  ->  writes ./terminal.svg
 */

const fs = require('fs');
const path = require('path');

// ---- palette (GitHub-dark, looks good on light + dark READMEs) -------------
const C = {
  bg:      '#0d1117',
  bar:     '#161b22',
  border:  '#30363d',
  green:   '#3fb950', // user
  cyan:    '#39c5cf', // host
  blue:    '#58a6ff', // path / dirs
  gray:    '#8b949e', // punctuation / dim
  white:   '#e6edf3', // command / body
  purple:  '#d2a8ff', // accent (name)
  yellow:  '#e3b341',
};

// ---- layout ----------------------------------------------------------------
const W = 820, FONT = 15, LINE_H = 26, PAD_X = 26;
const BAR_H = 44;
const Y0 = BAR_H + 30;         // first baseline
const CHAR_W = 9.5;            // over-estimate advance so clip never crops text
const START = 0.6;             // initial delay before typing

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// prompt segments reused for command lines
const P = () => ([
  ['shehab', C.green], ['@', C.gray], ['fdpm', C.cyan],
  [':', C.gray], ['~', C.blue], ['$ ', C.gray],
]);

// A "line" = { segs: [[text,color],...], cmd: bool }  |  null for blank spacer
const L = (segs, cmd = false) => ({ segs, cmd });
const BLANK = null;

const lines = [
  L([...P(), ['whoami', C.white]], true),
  L([['Shehab Beram', C.purple], [' — Forward Deployed Product Manager', C.white]]),
  L([['Ships product where the customer is. Bridges eng ⇄ business.', C.gray]]),
  BLANK,
  L([...P(), ['cat focus.txt', C.white]], true),
  L([['▸ ', C.green], ['0→1 products · enterprise deployments · AI-native workflows', C.white]]),
  L([['▸ ', C.green], ['turns ambiguous field problems into shipped outcomes', C.white]]),
  BLANK,
  L([...P(), ['ls ~/links', C.white]], true),
  L([['product/  ', C.blue], ['business/  ', C.blue], ['website/  ', C.blue], ['linkedin/', C.blue]]),
  BLANK,
  L([...P(), ["./connect --lets-build", C.white]], true),
  L([['→ ', C.green], ['initializing session... ', C.gray], ['ready ✔', C.green]]),
  L([['→ ', C.green], ['scroll down to explore ↓', C.yellow]]),
  BLANK,
  L([...P()], true), // final prompt (blinking cursor lands here)
];

const H = Y0 + (lines.length - 1) * LINE_H + 26;

// ---- build timeline + svg body --------------------------------------------
let t = START;
const clips = [];
const body = [];
let lastPromptBaseline = Y0;

lines.forEach((ln, i) => {
  const baseline = Y0 + i * LINE_H;
  if (ln === null) { t += 0.18; return; }              // blank spacer

  const text = ln.segs.map(s => s[0]).join('');
  const chars = [...text].length;
  const width = chars * CHAR_W + 14;                    // clip target width
  const perChar = ln.cmd ? 0.05 : 0.014;
  const dur = Math.max(ln.cmd ? 0.5 : 0.28, chars * perChar);
  const clipId = `clip${i}`;

  // typewriter clip: rect grows 0 -> width, then freezes
  clips.push(
    `<clipPath id="${clipId}"><rect x="${PAD_X}" y="${baseline - LINE_H + 6}" ` +
    `width="0" height="${LINE_H}">` +
    `<animate attributeName="width" from="0" to="${width.toFixed(1)}" ` +
    `begin="${t.toFixed(2)}s" dur="${dur.toFixed(2)}s" fill="freeze" ` +
    `calcMode="linear"/></rect></clipPath>`
  );

  // the text, revealed through the clip
  const tspans = ln.segs
    .map(([txt, col]) => `<tspan fill="${col}">${esc(txt)}</tspan>`)
    .join('');
  body.push(
    `<text x="${PAD_X}" y="${baseline}" clip-path="url(#${clipId})" ` +
    `font-family="ui-monospace,SFMono-Regular,Consolas,'DejaVu Sans Mono',Menlo,monospace" ` +
    `font-size="${FONT}" xml:space="preserve">${tspans}</text>`
  );

  if (ln.cmd && i === lines.length - 1) lastPromptBaseline = baseline;
  t += dur + (ln.cmd ? 0.12 : 0.06);
});

// blinking cursor after the final prompt
const promptW = [...P()].map(s => s[0]).join('').length * CHAR_W;
const curX = PAD_X + promptW + 2;
const endT = t.toFixed(2);
const cursor =
  `<rect x="${curX.toFixed(1)}" y="${lastPromptBaseline - 14}" width="9" height="17" ` +
  `fill="${C.white}" opacity="0">` +
  `<animate attributeName="opacity" values="1;1;0;0;1" keyTimes="0;0.45;0.5;0.95;1" ` +
  `dur="1.05s" begin="${endT}s" repeatCount="indefinite"/></rect>`;

// ---- assemble --------------------------------------------------------------
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Animated terminal: Shehab Beram, Forward Deployed Product Manager">
  <defs>
    <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.04"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    ${clips.join('\n    ')}
  </defs>

  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="12" fill="${C.bg}" stroke="${C.border}" stroke-width="1.5"/>
  <rect x="1" y="1" width="${W - 2}" height="${BAR_H}" rx="12" fill="${C.bar}"/>
  <rect x="1" y="${BAR_H - 12}" width="${W - 2}" height="12" fill="${C.bar}"/>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="12" fill="url(#glass)"/>
  <line x1="1" y1="${BAR_H}" x2="${W - 1}" y2="${BAR_H}" stroke="${C.border}" stroke-width="1"/>

  <circle cx="26" cy="22" r="6" fill="#ff5f56"/>
  <circle cx="46" cy="22" r="6" fill="#ffbd2e"/>
  <circle cx="66" cy="22" r="6" fill="#27c93f"/>
  <text x="${W / 2}" y="27" text-anchor="middle" fill="${C.gray}"
        font-family="ui-monospace,SFMono-Regular,Consolas,monospace" font-size="13">
    shehab@fdpm: ~
  </text>

  ${body.join('\n  ')}
  ${cursor}
</svg>
`;

fs.writeFileSync(path.join(__dirname, '..', 'terminal.svg'), svg, 'utf8');
console.log(`terminal.svg written (${W}x${H}, ~${endT}s to type)`);
