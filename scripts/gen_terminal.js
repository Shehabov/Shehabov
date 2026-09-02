/**
 * gen_terminal.js
 * Generates an auto-playing, self-contained animated SVG "terminal" for the
 * GitHub profile README. Pure SMIL animation, renders natively on GitHub.
 * Re-run (or let the GitHub Action run it) with:  node scripts/gen_terminal.js
 * It date-stamps the boot line, so every scheduled regeneration is fresh.
 */

const fs = require('fs');
const path = require('path');

// ---- palette ---------------------------------------------------------------
// Brand palette: deep navy #021449 + mint #21EA9D
const C = {
  bg:     '#021449',
  bar:    '#0a1f5e',
  border: '#1b3a7a',
  green:  '#21EA9D',
  cyan:   '#4fd6e0',
  blue:   '#5a9dff',
  gray:   '#8f9cc4',
  white:  '#eaf1ff',
  purple: '#c9a9ff',
  yellow: '#ffd166',
  red:    '#ff8a80',
};

// ---- layout ----------------------------------------------------------------
const W = 840, FONT = 15, LINE_H = 25, PAD_X = 26;
const BAR_H = 44;
const Y0 = BAR_H + 30;
const CHAR_W = 9.2;
const START = 0.5;

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// login date stamp
const now = new Date();
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const mons = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const stamp = `${days[now.getUTCDay()]} ${mons[now.getUTCMonth()]} ${String(now.getUTCDate()).padStart(2, ' ')} ${now.getUTCFullYear()}`;

const P = () => ([
  ['shehab', C.green], ['@', C.gray], ['fdpm', C.cyan],
  [':', C.gray], ['~', C.blue], ['$ ', C.gray],
]);
const OK = () => [['[', C.gray], ['  OK  ', C.green], ['] ', C.gray]];

const L = (segs, opts = {}) => ({ segs, cmd: !!opts.cmd, fast: !!opts.fast });
const BLANK = null;

const lines = [
  L([...OK(), ['Reached target ', C.gray], ['shehab-os v3.0', C.white], [' (forward-deployed)', C.gray]], { fast: true }),
  L([...OK(), ['Started ', C.gray], ['customer-proximity.service', C.white]], { fast: true }),
  L([...OK(), ['Mounted ', C.gray], ['/product', C.blue], [' and ', C.gray], ['/business', C.blue]], { fast: true }),
  BLANK,
  L([['last login: ', C.gray], [`${stamp} on ttys001`, C.gray]], { fast: true }),
  L([['fdpm login: ', C.gray], ['shehab', C.white]], { cmd: true }),
  L([['password: ', C.gray], ['••••••••••••', C.gray]], { fast: true }),
  L([['Welcome to ', C.gray], ['shehab-os', C.green], [' 🚀', C.white]], { fast: true }),
  BLANK,
  L([...P(), ['neofetch', C.white]], { cmd: true }),
  L([['┌─ ', C.gray], ['shehab', C.green], ['@', C.gray], ['fdpm', C.cyan]]),
  L([['│  role   ', C.gray], ['Forward Deployed Product Manager', C.white]]),
  L([['│  focus  ', C.gray], ['0→1 products · enterprise · AI-native workflows', C.white]]),
  L([['│  uptime ', C.gray], ['shipping since 2017', C.white]]),
  L([['└─ ', C.gray], ['bridges eng ', C.gray], ['⇄', C.yellow], [' business ', C.gray], ['⇄', C.yellow], [' the user', C.cyan]]),
  BLANK,
  L([...P(), ['./connect --lets-build', C.white]], { cmd: true }),
  L([['→ ', C.green], ['booting session... ', C.gray], ['ready ✔', C.green]]),
  L([['→ ', C.green], ['type ', C.gray], ["'help'", C.purple], [' in the live terminal, or scroll down ↓', C.yellow]]),
  BLANK,
  L([...P()], { cmd: true }),
];

const H = Y0 + (lines.length - 1) * LINE_H + 24;

// ---- build -----------------------------------------------------------------
let t = START;
const clips = [];
const body = [];
let lastPromptBaseline = Y0;

lines.forEach((ln, i) => {
  const baseline = Y0 + i * LINE_H;
  if (ln === null) { t += 0.16; return; }

  const text = ln.segs.map(s => s[0]).join('');
  const chars = [...text].length;
  const width = chars * CHAR_W + 14;
  const perChar = ln.cmd ? 0.05 : ln.fast ? 0.008 : 0.014;
  const dur = Math.max(ln.cmd ? 0.5 : ln.fast ? 0.18 : 0.26, chars * perChar);
  const clipId = `clip${i}`;

  clips.push(
    `<clipPath id="${clipId}"><rect x="${PAD_X}" y="${baseline - LINE_H + 6}" ` +
    `width="0" height="${LINE_H}">` +
    `<animate attributeName="width" from="0" to="${width.toFixed(1)}" ` +
    `begin="${t.toFixed(2)}s" dur="${dur.toFixed(2)}s" fill="freeze" calcMode="linear"/></rect></clipPath>`
  );

  const tspans = ln.segs
    .map(([txt, col]) => `<tspan fill="${col}">${esc(txt)}</tspan>`)
    .join('');
  body.push(
    `<text x="${PAD_X}" y="${baseline}" clip-path="url(#${clipId})" ` +
    `font-family="ui-monospace,SFMono-Regular,Consolas,'DejaVu Sans Mono',Menlo,monospace" ` +
    `font-size="${FONT}" xml:space="preserve">${tspans}</text>`
  );

  if (ln.cmd && i === lines.length - 1) lastPromptBaseline = baseline;
  t += dur + (ln.cmd ? 0.12 : ln.fast ? 0.03 : 0.05);
});

const promptW = [...P()].map(s => s[0]).join('').length * CHAR_W;
const curX = PAD_X + promptW + 2;
const endT = t.toFixed(2);
const cursor =
  `<rect x="${curX.toFixed(1)}" y="${lastPromptBaseline - 14}" width="9" height="17" ` +
  `fill="${C.white}" opacity="0">` +
  `<animate attributeName="opacity" values="1;1;0;0;1" keyTimes="0;0.45;0.5;0.95;1" ` +
  `dur="1.05s" begin="${endT}s" repeatCount="indefinite"/></rect>`;

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
  <circle cx="66" cy="22" r="6" fill="#21EA9D"/>
  <text x="${W / 2}" y="27" text-anchor="middle" fill="${C.gray}"
        font-family="ui-monospace,SFMono-Regular,Consolas,monospace" font-size="13">shehab@fdpm: ~ · zsh</text>

  ${body.join('\n  ')}
  ${cursor}
</svg>
`;

fs.writeFileSync(path.join(__dirname, '..', 'terminal.svg'), svg, 'utf8');
console.log(`terminal.svg written (${W}x${H}, ~${endT}s to type)`);
