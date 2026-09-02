/**
 * wrap_terminal.js · wrap any SVG (snake, isocalendar, ...) inside the shared
 * terminal-window chrome so externally generated graphics match the profile.
 *
 *   node scripts/wrap_terminal.js <input.svg> <output.svg> "<title>"
 *
 * The input is embedded as a nested <svg> (its own viewBox is preserved, so
 * SMIL/CSS animations keep working).
 */
const fs = require('fs');
const { BAR_H, windowSvg } = require('./lib_term');

const [, , inp, outp, title = 'shehab@fdpm: ~'] = process.argv;
if (!inp || !outp) { console.error('usage: wrap_terminal.js input output "title"'); process.exit(1); }

let s = fs.readFileSync(inp, 'utf8').replace(/^﻿/, '');
const m = s.match(/<svg[\s\S]*?>/i);
if (!m) { console.error('no <svg> found in ' + inp); process.exit(1); }
const openTag = m[0];
const inner = s.slice(m.index + openTag.length).replace(/<\/svg>\s*$/i, '');

const attr = a => { const r = new RegExp(a + '\\s*=\\s*"([^"]*)"', 'i').exec(openTag); return r ? r[1] : null; };
let vb = attr('viewBox');
let iw = parseFloat(attr('width'));
let ih = parseFloat(attr('height'));
if (vb) {
  const p = vb.trim().split(/[\s,]+/).map(Number);
  if (!iw) iw = p[2];
  if (!ih) ih = p[3];
} else {
  iw = iw || 800; ih = ih || 200; vb = `0 0 ${iw} ${ih}`;
}

const PADX = 18, PADTOP = 14, PADBOT = 16;
const W = Math.round(iw + PADX * 2);
const H = Math.round(BAR_H + PADTOP + ih + PADBOT);

const nested = `<svg x="${PADX}" y="${BAR_H + PADTOP}" width="${iw}" height="${ih}" viewBox="${vb}" preserveAspectRatio="xMidYMid meet" overflow="visible">${inner}</svg>`;

fs.writeFileSync(outp, windowSvg({ W, H, title, command: null, inner: nested, aria: title }), 'utf8');
console.log(`${outp} written (${W}x${H}) wrapping ${inp} (${iw}x${ih})`);
