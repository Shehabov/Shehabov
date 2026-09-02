/**
 * lib_term.js · shared "terminal window" chrome so every section on the
 * profile (terminal, about, impact, languages) looks like the same app.
 */
// Brand palette: deep navy #021449 + mint #21EA9D
const C = {
  bg:'#021449', bar:'#0a1f5e', border:'#1b3a7a', track:'#0a1f5e',
  green:'#21EA9D', cyan:'#4fd6e0', blue:'#5a9dff', gray:'#8f9cc4',
  white:'#eaf1ff', purple:'#c9a9ff', yellow:'#ffd166', red:'#ff8a80',
};
const SANS = "Segoe UI,-apple-system,Helvetica,Arial,sans-serif";
const MONO = "ui-monospace,SFMono-Regular,Consolas,'DejaVu Sans Mono',Menlo,monospace";
const BAR_H = 42;
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

// prompt segments: shehab@fdpm:~$
function promptTspans(){
  return `<tspan fill="${C.green}">shehab</tspan><tspan fill="${C.gray}">@</tspan>`
       + `<tspan fill="${C.cyan}">fdpm</tspan><tspan fill="${C.gray}">:</tspan>`
       + `<tspan fill="${C.blue}">~</tspan><tspan fill="${C.gray}">$ </tspan>`;
}

/**
 * windowSvg({ W, H, title, command, inner, cursorAfter })
 *  - title: text shown centred in the title bar
 *  - command: the "typed" command shown on the prompt line (plain text)
 *  - inner: raw SVG for the body (positioned by the caller, below ~BAR_H+52)
 *  - cursorAfter: if set, a blinking cursor is drawn after the command
 */
function windowSvg({ W, H, title, command = '', inner = '', promptY = BAR_H + 30, aria = '' }){
  let promptLine = '';
  if (command !== null) {
    const cmdW = (promptText().length + command.length) * 8.6;
    const cursor = `<rect x="${(26 + cmdW + 4).toFixed(0)}" y="${promptY - 13}" width="8" height="15" fill="${C.white}">`
      + `<animate attributeName="opacity" values="1;1;0;0;1" keyTimes="0;0.45;0.5;0.95;1" dur="1.05s" repeatCount="indefinite"/></rect>`;
    promptLine = `<text x="26" y="${promptY}" font-family="${MONO}" font-size="13.5" xml:space="preserve">${promptTspans()}<tspan fill="${C.white}">${esc(command)}</tspan></text>${cursor}`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(aria||title)}">
  <defs>
    <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.04"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect x="1" y="1" width="${W-2}" height="${H-2}" rx="12" fill="${C.bg}" stroke="${C.border}" stroke-width="1.5"/>
  <rect x="1" y="1" width="${W-2}" height="${BAR_H}" rx="12" fill="${C.bar}"/>
  <rect x="1" y="${BAR_H-12}" width="${W-2}" height="12" fill="${C.bar}"/>
  <rect x="1" y="1" width="${W-2}" height="${H-2}" rx="12" fill="url(#glass)"/>
  <line x1="1" y1="${BAR_H}" x2="${W-1}" y2="${BAR_H}" stroke="${C.border}" stroke-width="1"/>
  <circle cx="25" cy="21" r="6" fill="#ff5f56"/>
  <circle cx="45" cy="21" r="6" fill="#ffbd2e"/>
  <circle cx="65" cy="21" r="6" fill="#21EA9D"/>
  <text x="${W/2}" y="26" text-anchor="middle" fill="${C.gray}" font-family="${MONO}" font-size="13">${esc(title)}</text>
  ${promptLine}
  ${inner}
</svg>
`;
}
function promptText(){ return 'shehab@fdpm:~$ '; }

module.exports = { C, SANS, MONO, BAR_H, esc, windowSvg };
