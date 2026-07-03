#!/usr/bin/env node
/* PRD 8.1: assert no ScriptProcessorNode anywhere in /src (worklets only if
 * ever needed). Fails the build on any match in real code. Comments and the
 * checks/ directory itself are excluded so documentation of the rule doesn't
 * trip the rule. */
'use strict';
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..'); // /src
const checksDir = path.resolve(__dirname); // exclude self
const pattern = /createScriptProcessor|new\s+ScriptProcessorNode/;

function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (full.startsWith(checksDir)) continue;
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(js|mjs)$/.test(entry.name)) out.push(full);
  }
}

const files = [];
walk(root, files);

const hits = [];
files.forEach((file) => {
  const code = stripComments(fs.readFileSync(file, 'utf8'));
  code.split('\n').forEach((line, i) => {
    if (pattern.test(line)) hits.push(path.relative(root, file) + ':' + (i + 1) + '  ' + line.trim());
  });
});

if (hits.length) {
  console.error('FAIL: ScriptProcessorNode found in /src:');
  hits.forEach((h) => console.error('    ' + h));
  process.exit(1);
}
console.log('OK: no ScriptProcessorNode in /src (' + files.length + ' files scanned)');
