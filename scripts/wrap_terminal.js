/**
 * wrap_terminal.js · wrap any SVG (snake, isocalendar, ...) inside the shared
 * terminal-window chrome so externally generated graphics match the profile.
 *
 *   node scripts/wrap_terminal.js <input.svg> <output.svg> "<title>"
 *
 * FLAT injection: the input's <style>/<defs> are hoisted to the OUTER svg root
 * (so CSS animations run exactly like the original, including as a GitHub <img>),
 * and its drawable content is translated below a title bar via a <g>. No nested
 * <svg>, which is what kept animations reliable.
 */
const fs = require('fs');
const { C, MONO, BAR_H, esc } = require('./lib_term');

const [, , inp, outp, title = 'shehab@fdpm: ~'] = process.argv;
if (!inp || !outp) { console.error('usage: wrap_terminal.js input output "title"'); process.exit(1); }

let s = fs.readFileSync(inp, 'utf8').replace(/^﻿/, '');
const m = s.match(/<svg[\s\S]*?>/i);
if (!m) { console.error('no <svg> found in ' + inp); process.exit(1); }
const openTag = m[0];
let inner = s.slice(m.index + openTag.length).replace(/<\/svg>\s*$/i, '');

const attr = a => { const r = new RegExp(a + '\\s*=\\s*"([^"]*)"', 'i').exec(openTag); return r ? r[1] : null; };
let vb = attr('viewBox');
let iw = parseFloat(attr('width'));
let ih = parseFloat(attr('height'));
let vbX = 0, vbY = 0, vbW, vbH;
if (vb) {
  [vbX, vbY, vbW, vbH] = vb.trim().split(/[\s,]+/).map(Number);
  if (!iw) iw = vbW; if (!ih) ih = vbH;
} else {
  iw = iw || 800; ih = ih || 200; vbW = iw; vbH = ih;
}

// hoist <style> and <defs> to the outer root so animations keep working
const hoisted = [];
inner = inner.replace(/<style[\s\S]*?<\/style>/gi, m => { hoisted.push(m); return ''; });
inner = inner.replace(/<defs[\s\S]*?<\/defs>/gi, m => { hoisted.push(m); return ''; });

const PADX = 18, PADTOP = 14, PADBOT = 16;
const W = Math.round(iw + PADX * 2);
const H = Math.round(BAR_H + PADTOP + ih + PADBOT);
// map the child's viewBox origin (vbX,vbY) to (PADX, BAR_H+PADTOP)
const dx = (PADX - vbX).toFixed(1);
const dy = (BAR_H + PADTOP - vbY).toFixed(1);

const out = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}">
  <defs>
    <linearGradient id="glassWrap" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.04"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <clipPath id="wrapClip"><rect x="${PADX}" y="${BAR_H + PADTOP}" width="${iw}" height="${ih}"/></clipPath>
  </defs>
  ${hoisted.join('\n  ')}
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="12" fill="${C.bg}" stroke="${C.border}" stroke-width="1.5"/>
  <rect x="1" y="1" width="${W - 2}" height="${BAR_H}" rx="12" fill="${C.bar}"/>
  <rect x="1" y="${BAR_H - 12}" width="${W - 2}" height="12" fill="${C.bar}"/>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="12" fill="url(#glassWrap)"/>
  <line x1="1" y1="${BAR_H}" x2="${W - 1}" y2="${BAR_H}" stroke="${C.border}" stroke-width="1"/>
  <circle cx="25" cy="21" r="6" fill="#ff5f56"/>
  <circle cx="45" cy="21" r="6" fill="#ffbd2e"/>
  <circle cx="65" cy="21" r="6" fill="#27c93f"/>
  <text x="${W / 2}" y="26" text-anchor="middle" fill="${C.gray}" font-family="${MONO}" font-size="13">${esc(title)}</text>
  <g clip-path="url(#wrapClip)" transform="translate(${dx}, ${dy})">${inner}</g>
</svg>
`;
fs.writeFileSync(outp, out, 'utf8');
console.log(`${outp} written (${W}x${H}) flat-wrapping ${inp} (${iw}x${ih})`);
