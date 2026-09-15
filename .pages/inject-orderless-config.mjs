import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const siteRoot = resolve(process.argv[2] ?? '_site');
const assetsRoot = join(siteRoot, 'OrderLess', 'Buy', 'assets');
const replacements = [
  {
    marker: 'rcb_INJECTATDEPLOY12345',
    value: process.env.VITE_RC_PUBLIC_WEB_KEY ?? '',
    valid: value => /^rcb_[a-zA-Z0-9_.-]+$/.test(value) && !value.startsWith('rcb_sb_'),
    label: 'production RevenueCat public web key',
  },
  {
    marker: 'INJECTTIKTOKID12345',
    value: process.env.VITE_TIKTOK_PIXEL_ID ?? '',
    valid: value => /^[A-Z0-9]{10,30}$/i.test(value),
    label: 'TikTok Pixel ID',
  },
];

for (const replacement of replacements) {
  if (!replacement.valid(replacement.value)) {
    throw new Error(`Missing or invalid ${replacement.label}.`);
  }
}

const javascriptFiles = (await readdir(assetsRoot))
  .filter(name => name.endsWith('.js'))
  .map(name => join(assetsRoot, name));

const counts = new Map(replacements.map(({ marker }) => [marker, 0]));
for (const file of javascriptFiles) {
  let source = await readFile(file, 'utf8');
  let changed = false;
  for (const { marker, value } of replacements) {
    const occurrences = source.split(marker).length - 1;
    if (!occurrences) continue;
    counts.set(marker, counts.get(marker) + occurrences);
    source = source.replaceAll(marker, value);
    changed = true;
  }
  if (changed) await writeFile(file, source);
}

for (const { marker, label } of replacements) {
  if (counts.get(marker) !== 1) {
    throw new Error(`Expected exactly one ${label} deployment marker.`);
  }
}

console.log('Injected two browser-public identifiers into the Pages artifact.');
