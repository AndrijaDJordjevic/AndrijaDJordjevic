#!/usr/bin/env node
// Static GitHub stats card (light + dark) covering every repository this account
// can reach - public, private and organization-owned.
//
// Every figure below was cross-verified against the GitHub API before being
// committed; see NUMBERS.md for the derivation and the rejected figures.
// Regenerate with:  node scripts/gen-stats-card.js
const fs = require('fs');
const path = require('path');

const DATA = {
  name: 'Andrija Djordjevic',
  subtitle: 'Activity across every repository I work in — public, private and organizations',
  hero: { value: 2513, label: 'contributions since 2023 — the large majority in private repositories' },
  tiles: [
    { value: '2,038', label: 'Commits authored' },
    { value: '295',   label: 'Pull requests opened' },
    { value: '106',   label: 'Issues opened' },
    { value: '13',    label: 'Repositories active in' },
  ],
  // Ordinal only. Byte-share percentages are NOT published: GitHub's Linguist
  // counts every byte on a default branch regardless of author, so a percentage
  // would credit teammates' and vendored code. The ORDER is what survives.
  langsLabel: 'Languages I work in — most used first',
  langs: ['Python', 'TypeScript', 'Go', 'JavaScript', 'HTML', 'CSS', 'C++', 'Vue'],
  footer: 'Measured 21 Aug 2026 across 37+ reachable repositories · regenerate with scripts/gen-stats-card.js',
};

// GitHub Primer surfaces and ink, so the card sits native on a profile README.
const THEMES = {
  light: { canvas:'#ffffff', border:'#d1d9e0', fg:'#1f2328', muted:'#59636e', accent:'#0969da', chip:'#f6f8fa' },
  dark:  { canvas:'#0d1117', border:'#3d444d', fg:'#f0f6fc', muted:'#9198a1', accent:'#4493f8', chip:'#161b22' },
};

const W = 840, H = 306, PAD = 28;
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
// Rough advance-width model for the system sans stack; used only for chip sizing.
const tw = (t, sz) => [...t].reduce((a,c) => a + (/[ ilj.,]/.test(c) ? 0.28 : /[A-Z0-9+]/.test(c) ? 0.62 : 0.53) * sz, 0);

function card(t) {
  const o = [];
  const txt = (x, y, s, { size = 12, fill = t.muted, weight = 400, anchor = 'start' } = {}) =>
    o.push(`<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${esc(s)}</text>`);

  o.push(`<rect x="0.5" y="0.5" width="${W-1}" height="${H-1}" rx="6" fill="${t.canvas}" stroke="${t.border}"/>`);

  txt(PAD, 40, DATA.name, { size: 17, fill: t.fg, weight: 600 });
  txt(PAD, 60, DATA.subtitle);

  // Hero figure — the one number the card leads with.
  txt(PAD, 130, DATA.hero.value.toLocaleString('en-US'), { size: 46, fill: t.accent, weight: 700 });
  txt(PAD, 152, DATA.hero.label, { size: 11 });

  // Stat tiles, 2x2.
  DATA.tiles.forEach((s, i) => {
    const x = 452 + (i % 2) * 190;
    const y = 110 + Math.floor(i / 2) * 44;
    txt(x, y, s.value, { size: 22, fill: t.fg, weight: 600 });
    txt(x, y + 17, s.label, { size: 11 });
  });

  o.push(`<line x1="${PAD}" y1="196" x2="${W-PAD}" y2="196" stroke="${t.border}"/>`);
  txt(PAD, 222, DATA.langsLabel, { size: 12, fill: t.fg, weight: 600 });

  // Ranked chips: position carries the ranking, nothing claims a magnitude.
  const CH = 26, PADX = 12, GAP = 8;
  let x = PAD, y = 244;
  DATA.langs.forEach((name, i) => {
    const w = Math.round(tw(name, 12) + PADX * 2);
    if (x + w > W - PAD) { x = PAD; y += CH + GAP; }
    o.push(`<rect x="${x}" y="${y}" width="${w}" height="${CH}" rx="13" fill="${t.chip}" stroke="${t.border}"/>`);
    txt(x + w / 2, y + 17, name, { size: 12, fill: i === 0 ? t.accent : t.fg, weight: i === 0 ? 600 : 400, anchor: 'middle' });
    x += w + GAP;
  });

  txt(PAD, H - 16, DATA.footer, { size: 10.5 });

  const aria = `${DATA.name}. ${DATA.hero.value} ${DATA.hero.label}. `
    + DATA.tiles.map(s => `${s.value} ${s.label}`).join(', ')
    + `. ${DATA.langsLabel}: ${DATA.langs.join(', ')}.`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(aria)}">\n${o.join('\n')}\n</svg>\n`;
}

const dir = path.join(__dirname, '..', 'assets');
fs.mkdirSync(dir, { recursive: true });
for (const [mode, t] of Object.entries(THEMES)) {
  const f = path.join(dir, `stats-${mode}.svg`);
  fs.writeFileSync(f, card(t));
  console.log('wrote', f, fs.statSync(f).size, 'bytes');
}
