#!/usr/bin/env node
// Smoke test for the Copilot plugin adapter: it declares the shared command
// directory, and that directory stays in step with the other adapter that ships
// the same commands in a different format.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function readJSON(relPath) {
  return JSON.parse(fs.readFileSync(path.join(root, relPath), 'utf8'));
}

function basenames(dir, ext) {
  return fs.readdirSync(path.join(root, dir))
    .filter((f) => f.endsWith(ext))
    .map((f) => f.slice(0, -ext.length))
    .sort();
}

test('copilot plugin declares the shared command directory', () => {
  const manifest = readJSON('.github/plugin/plugin.json');
  assert.equal(manifest.name, 'ponytail');
  assert.equal(manifest.commands, 'commands/');
  assert.ok(
    fs.existsSync(path.join(root, manifest.commands)),
    `declared commands directory is missing: ${manifest.commands}`,
  );
});

// Replaces a hardcoded REQUIRED_COMMAND_FILES list. That list had already gone stale
// (it omitted ponytail-help.toml) and by construction could never catch a command
// added later. Comparing the two adapters that ship the same command set catches
// both staleness and one-sided additions.
test('every command ships for both Copilot (.toml) and OpenCode (.md)', () => {
  const copilot = basenames('commands', '.toml');
  const opencode = basenames(path.join('.opencode', 'command'), '.md');

  assert.ok(copilot.length >= 5, 'command scrape found nothing — check the directory layout');
  assert.deepEqual(
    copilot,
    opencode,
    'a command exists for one adapter but not the other',
  );
});
