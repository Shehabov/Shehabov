/**
 * wrap_terminal.js · wrap any SVG inside the shared terminal-window chrome.
 *
 *   node scripts/wrap_terminal.js <input.svg> <output.svg> "<title>" [flat|nested]
 *
 * nested (default): embeds the input as a child <svg> with its own viewBox.
 *   Safe for complex SVGs (e.g. metrics isocalendar has many nested <svg>s).
 * flat: hoists the input's <style>/<defs> to the outer root and translates its
 *   drawable content under the title bar. Use for SINGLE-svg animated inputs
 *   (e.g. the snake) where flattening keeps CSS animations reliable as an <img>.
 */
const fs = require('fs');
const { C, MONO, BAR_H, esc } = require('./lib_term');

const [, , inp, outp, title = 'shehab@fdpm: ~', mode = 'nested'] = process.argv;
if (!inp || !outp) { console.error('usage: wrap_terminal.js input output "title" [flat|nested]'); process.exit(1); }

let s = fs.readFileSync(inp, 'utf8').replace(/^﻿/, '');
const m = s.match(/<svg[\s\S]*?>/i);
if (!m) { console.error('no <svg> found in ' + inp); process.exit(1); }
const openTag = m[0];
let inner = s.slice(m.index + openTag.length).replace(/<\/svg>\s*$/i, '');

const attr = a => { const r = new RegExp(a + '\\s*=\\s*"([^"]*)"', 'i').exec(openTag); return r ? r[1] : null; };
let vbRaw = attr('viewBox');
let iw = parseFloat(attr('width'));
let ih = parseFloat(attr('height'));
let vbX = 0, vbY = 0, vbW, vbH;
if (vbRaw) {
  [vbX, vbY, vbW, vbH] = vbRaw.trim().split(/[\s,]+/).map(Number);
  if (!iw) iw = vbW; if (!ih) ih = vbH;
} else {
  iw = iw || 800; ih = ih || 200; vbW = iw; vbH = ih; vbRaw = `0 0 ${iw} ${ih}`;
}

const PADX = 18, PADTOP = 14, PADBOT = 16;
const W = Math.round(iw + PADX * 2);
const H = Math.round(BAR_H + PADTOP + ih + PADBOT);

let defs = `<clipPath id="wrapClip"><rect x="${PADX}" y="${BAR_H + PADTOP}" width="${iw}" height="${ih}"/></clipPath>`;
let hoist = '';
let content;

if (mode === 'flat') {
  // hoist <style>/<defs> so animations run; translate drawable content
  const grabbed = [];
  inner = inner.replace(/<style[\s\S]*?<\/style>/gi, x => { grabbed.push(x); return ''; });
  inner = inner.replace(/<defs[\s\S]*?<\/defs>/gi, x => { grabbed.push(x); return ''; });
  hoist = grabbed.join('\n  ');
  const dx = (PADX - vbX).toFixed(1);
  const dy = (BAR_H + PADTOP - vbY).toFixed(1);
  content = `<g clip-path="url(#wrapClip)" transform="translate(${dx}, ${dy})">${inner}</g>`;
} else {
  // nested: embed the whole input untouched; its viewport clips overflow
  content = `<svg x="${PADX}" y="${BAR_H + PADTOP}" width="${iw}" height="${ih}" viewBox="${vbRaw}" preserveAspectRatio="xMidYMid meet" overflow="hidden">${inner}</svg>`;
}

const out = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}">
  <defs>
    <linearGradient id="glassWrap" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.04"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    ${defs}
  </defs>
  ${hoist}
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="12" fill="${C.bg}" stroke="${C.border}" stroke-width="1.5"/>
  <rect x="1" y="1" width="${W - 2}" height="${BAR_H}" rx="12" fill="${C.bar}"/>
  <rect x="1" y="${BAR_H - 12}" width="${W - 2}" height="12" fill="${C.bar}"/>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="12" fill="url(#glassWrap)"/>
  <line x1="1" y1="${BAR_H}" x2="${W - 1}" y2="${BAR_H}" stroke="${C.border}" stroke-width="1"/>
  <circle cx="25" cy="21" r="6" fill="#ff5f56"/>
  <circle cx="45" cy="21" r="6" fill="#ffbd2e"/>
  <circle cx="65" cy="21" r="6" fill="#21EA9D"/>
  <text x="${W / 2}" y="26" text-anchor="middle" fill="${C.gray}" font-family="${MONO}" font-size="13">${esc(title)}</text>
  ${content}
</svg>
`;
fs.writeFileSync(outp, out, 'utf8');
console.log(`${outp} written (${W}x${H}) ${mode}-wrapping ${inp} (${iw}x${ih})`);
