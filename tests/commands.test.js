#!/usr/bin/env node
// Every ponytail command the pi extension registers must also ship as a
// file-based command for the hosts that need one: Claude Code (commands/*.toml,
// which Gemini CLI reuses) and OpenCode (.opencode/command/*.md). /ponytail-help
// was advertised in the README and the help card but missing both files; this
// guards that drift -- a registered command with no adapter file fails here.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

// pi-extension registers the canonical command set.
const piSource = fs.readFileSync(path.join(root, 'pi-extension', 'index.js'), 'utf8');
const commands = [...piSource.matchAll(/registerCommand\(["']([\w-]+)["']/g)].map((m) => m[1]);

test('pi registers at least the base command', () => {
  assert.ok(commands.includes('ponytail'), 'expected pi to register a ponytail command');
});

// The two tests below iterate `commands`, so anything the regex fails to scrape is
// simply not checked. A refactor to a loop or a template literal would shrink the
// list and let those tests pass over whatever survived. Pin the scrape against the
// command files so a partial scrape is a failure rather than reduced coverage.
test('the pi command scrape matches commands/*.toml', () => {
  const onDisk = fs.readdirSync(path.join(root, 'commands'))
    .filter((f) => f.endsWith('.toml'))
    .map((f) => f.slice(0, -'.toml'.length))
    .sort();

  assert.deepEqual(
    [...commands].sort(),
    onDisk,
    'pi registrations and commands/*.toml disagree — either the regex scrape broke, or a command ships on only one side',
  );
});

test('every registered command ships a Claude commands/*.toml', () => {
  for (const name of commands) {
    assert.ok(
      fs.existsSync(path.join(root, 'commands', `${name}.toml`)),
      `missing commands/${name}.toml`,
    );
  }
});

test('every registered command ships an OpenCode .opencode/command/*.md', () => {
  for (const name of commands) {
    assert.ok(
      fs.existsSync(path.join(root, '.opencode', 'command', `${name}.md`)),
      `missing .opencode/command/${name}.md`,
    );
  }
});
