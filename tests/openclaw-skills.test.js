#!/usr/bin/env node
// The OpenClaw skill package (.openclaw/skills/) is generated from skills/ by
// scripts/build-openclaw-skills.js. These tests fail if the committed copies are
// stale (ruleset drift) or if a description breaks OpenClaw's one-line <160 rule.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { NAMES, render, outPath, sourceBody, DESCRIPTIONS } = require('../scripts/build-openclaw-skills');

const SKILLS_DIR = path.join(__dirname, '..', '.openclaw', 'skills');

// The generator writes every name in DESCRIPTIONS but never prunes. Dropping a name
// leaves its directory on disk, still shipped and no longer regenerated — and every
// other test here iterates NAMES, so nothing would look at it again.
test('no orphaned OpenClaw skills', () => {
  const onDisk = fs.readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  assert.deepEqual(onDisk, [...NAMES].sort(),
    'stale directory in .openclaw/skills/ — delete it, or add the name to DESCRIPTIONS');
});

for (const name of NAMES) {
  test(`${name}: committed OpenClaw skill matches the generator`, () => {
    const onDisk = fs.readFileSync(outPath(name), 'utf8').replace(/\r\n/g, '\n');
    assert.equal(onDisk, render(name), 'stale — run: node scripts/build-openclaw-skills.js');
  });

  test(`${name}: body is the canonical skills/${name} body, verbatim`, () => {
    const onDisk = fs.readFileSync(outPath(name), 'utf8').replace(/\r\n/g, '\n');
    assert.ok(onDisk.endsWith(sourceBody(name)), 'body drifted from skills/' + name);
  });

  test(`${name}: description is one line under 160 chars`, () => {
    const d = DESCRIPTIONS[name];
    assert.ok(d.length <= 160 && !d.includes('\n'), 'description too long or multiline');
  });
}
