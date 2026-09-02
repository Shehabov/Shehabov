/**
 * gen_about.js · "About" as a terminal window (about.svg).
 * A short, human terminal session. No AI-looking bullet lists.
 *   node scripts/gen_about.js
 */
const fs = require('fs');
const path = require('path');
const { C, MONO, BAR_H, esc, windowSvg } = require('./lib_term');

const W = 840, PAD = 26, FONT = 13.5, LINE_H = 25;
const Y0 = BAR_H + 34;

const P = () => ([['shehab',C.green],['@',C.gray],['fdpm',C.cyan],[':',C.gray],['~',C.blue],['$ ',C.gray]]);
const L = segs => ({ segs });
const BLANK = null;

const lines = [
  L([...P(), ['shehab --how-i-work', C.white]]),
  L([['  the whole arc ..: ', C.cyan], ['discovery, strategy, specs, delivery, the ugly trade-offs', C.white]]),
  L([['  ai-native ......: ', C.cyan], ['LLMs inside the workflow, not bolted on for the demo', C.white]]),
  L([['  translator .....: ', C.cyan], ['"the customer is annoyed" becomes a roadmap eng can ship', C.white]]),
  L([['  metrics-first ..: ', C.cyan], ['activation, retention, revenue, the stuff that pays the bills', C.white]]),
  L([['  right now ......: ', C.cyan], ['shipping 0 to 1, coaching PMs and founders, rewriting a PRD', C.white]]),
  BLANK,
  L([...P(), ['shehab --tldr', C.white]]),
  L([['  interim head of product ', C.white], ['·', C.gray], [' growth consultant ', C.white], ['·', C.gray], [' coach', C.white]]),
  L([['  15+ launches ', C.yellow], ['·', C.gray], [' $4M+ generated ', C.yellow], ['·', C.gray], [' 6M+ humans impacted', C.yellow]]),
  BLANK,
  L([...P()]),
];

const H = Y0 + (lines.length - 1) * LINE_H + 22;

const body = lines.map((ln, i) => {
  const y = Y0 + i * LINE_H;
  if (ln === null) return '';
  const tspans = ln.segs.map(([t,c]) => `<tspan fill="${c}">${esc(t)}</tspan>`).join('');
  return `<text x="${PAD}" y="${y}" font-family="${MONO}" font-size="${FONT}" xml:space="preserve">${tspans}</text>`;
}).join('\n  ');

// blinking cursor at the last prompt
const lastY = Y0 + (lines.length - 1) * LINE_H;
const curX = PAD + 'shehab@fdpm:~$ '.length * 8.1;
const cursor = `<rect x="${curX.toFixed(0)}" y="${lastY-13}" width="8" height="15" fill="${C.white}"><animate attributeName="opacity" values="1;1;0;0;1" keyTimes="0;0.45;0.5;0.95;1" dur="1.05s" repeatCount="indefinite"/></rect>`;

fs.writeFileSync(path.join(__dirname, '..', 'about.svg'),
  windowSvg({ W, H, title: 'shehab@fdpm: ~/about', command: null, inner: body + '\n  ' + cursor, aria: "About Shehab Beram" }), 'utf8');
console.log(`about.svg written (${W}x${H})`);
