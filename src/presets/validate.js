#!/usr/bin/env node
/* Dependency-free preset validator (PRD §3.1 rules + §8.3 finite-number guard).
 * Deliberately NOT ajv: there is no node_modules in this project and the dev
 * server is plain Express, so `npm test` must run with zero install. Supports
 * only the JSON-Schema subset this project's schema actually uses. */
'use strict';
const fs = require('fs');
const path = require('path');

const presetsDir = __dirname;
const schemaPath = path.join(presetsDir, 'schema', 'preset.schema.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

function resolveRef(ref, root) {
  // supports "#/definitions/foo"
  const parts = ref.replace(/^#\//, '').split('/');
  return parts.reduce((o, k) => o[k], root);
}

function validate(node, sch, root, pathStr, errors) {
  if (sch.$ref) sch = resolveRef(sch.$ref, root);

  if (sch.type) {
    const t = sch.type;
    const ok =
      (t === 'object' && node !== null && typeof node === 'object' && !Array.isArray(node)) ||
      (t === 'array' && Array.isArray(node)) ||
      (t === 'string' && typeof node === 'string') ||
      (t === 'number' && typeof node === 'number') ||
      (t === 'integer' && typeof node === 'number' && Number.isInteger(node)) ||
      (t === 'boolean' && typeof node === 'boolean');
    if (!ok) {
      errors.push(pathStr + ': expected ' + t + ', got ' + describe(node));
      return; // type mismatch: further checks are meaningless
    }
  }

  if (typeof node === 'number' && !Number.isFinite(node)) {
    errors.push(pathStr + ': not a finite number');
  }
  if (sch.enum && !sch.enum.includes(node)) {
    errors.push(pathStr + ': "' + node + '" not in [' + sch.enum.join(', ') + ']');
  }
  if (typeof node === 'number') {
    if (sch.minimum !== undefined && node < sch.minimum) errors.push(pathStr + ': ' + node + ' < min ' + sch.minimum);
    if (sch.maximum !== undefined && node > sch.maximum) errors.push(pathStr + ': ' + node + ' > max ' + sch.maximum);
  }
  if (typeof node === 'string' && sch.minLength !== undefined && node.length < sch.minLength) {
    errors.push(pathStr + ': string shorter than ' + sch.minLength);
  }

  if (sch.type === 'object' && node && typeof node === 'object') {
    (sch.required || []).forEach((key) => {
      if (!(key in node)) errors.push(pathStr + ': missing required "' + key + '"');
    });
    if (sch.additionalProperties === false && sch.properties) {
      Object.keys(node).forEach((key) => {
        if (!(key in sch.properties)) errors.push(pathStr + ': unexpected property "' + key + '"');
      });
    }
    if (sch.properties) {
      Object.keys(sch.properties).forEach((key) => {
        if (key in node) validate(node[key], sch.properties[key], root, pathStr + '.' + key, errors);
      });
    }
  }

  if (sch.type === 'array' && Array.isArray(node)) {
    if (sch.minItems !== undefined && node.length < sch.minItems) errors.push(pathStr + ': fewer than ' + sch.minItems + ' items');
    if (sch.items) node.forEach((item, i) => validate(item, sch.items, root, pathStr + '[' + i + ']', errors));
  }
}

function describe(v) {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  return typeof v;
}

function getDeep(obj, dotted) {
  return dotted.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

const presetFiles = fs
  .readdirSync(presetsDir)
  .filter((f) => f.endsWith('.json'));

let failed = 0;
presetFiles.forEach((file) => {
  const full = path.join(presetsDir, file);
  const errors = [];
  let preset;
  try {
    preset = JSON.parse(fs.readFileSync(full, 'utf8'));
  } catch (e) {
    console.error('✗ ' + file + ': invalid JSON — ' + e.message);
    failed++;
    return;
  }

  validate(preset, schema, schema, file, errors);

  // every exposedKnobs path must resolve to a value inside params
  (preset.exposedKnobs || []).forEach((knobPath) => {
    if (getDeep(preset.params, knobPath) === undefined) {
      errors.push(file + ': exposedKnobs path "' + knobPath + '" does not resolve in params');
    }
  });

  if (errors.length) {
    console.error('✗ ' + file);
    errors.forEach((e) => console.error('    ' + e));
    failed++;
  } else {
    console.log('✓ ' + file + ' (' + preset.status + ')');
  }
});

if (failed) {
  console.error('\n' + failed + ' preset(s) failed validation.');
  process.exit(1);
}
console.log('\nAll ' + presetFiles.length + ' preset(s) valid.');
