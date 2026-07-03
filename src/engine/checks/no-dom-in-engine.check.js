#!/usr/bin/env node
/* Enforces the core refactor guarantee: nothing under /src/engine or
 * /src/voicings may touch the DOM. That's what makes the engine instantiable
 * headlessly (OfflineAudioContext determinism test, no page required).
 *
 * We flag `document` usage. `window` is allowed ONLY for `window.AudioContext`
 * (context.js) — that's a global API, not the DOM. Any other window.* is flagged. */
'use strict';
const fs = require('fs');
const path = require('path');

const srcRoot = path.resolve(__dirname, '..', '..'); // /src
const scanDirs = [path.join(srcRoot, 'engine'), path.join(srcRoot, 'voicings')];
const checksDir = path.resolve(__dirname); // exclude self (documents the rule)

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (full.startsWith(checksDir)) continue;
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(js|mjs)$/.test(entry.name)) out.push(full);
  }
}

const files = [];
scanDirs.forEach((d) => walk(d, files));

const hits = [];
files.forEach((file) => {
  fs.readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      const code = line.replace(/\/\/.*$/, ''); // ignore line comments
      if (/\bdocument\b/.test(code)) {
        hits.push(path.relative(srcRoot, file) + ':' + (i + 1) + '  ' + line.trim());
      }
      const winMatch = code.match(/\bwindow\.(\w+)/);
      if (winMatch && winMatch[1] !== 'AudioContext' && winMatch[1] !== 'webkitAudioContext') {
        hits.push(path.relative(srcRoot, file) + ':' + (i + 1) + '  (window.' + winMatch[1] + ') ' + line.trim());
      }
    });
});

if (hits.length) {
  console.error('✗ DOM access found in engine/voicings (must stay headless):');
  hits.forEach((h) => console.error('    ' + h));
  process.exit(1);
}
console.log('✓ no DOM access in /src/engine or /src/voicings (' + files.length + ' files scanned)');
