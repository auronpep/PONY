#!/usr/bin/env node
// The statusline scripts are the only consumer of the .ponytail-active flag, and
// until now nothing executed them. That is why the hardcoded ~/.claude path (which
// ignored CLAUDE_CONFIG_DIR, unlike every other reader) went unnoticed.
//
// Each interpreter is skipped when it isn't installed, so this stays green on a
// machine with no bash or no PowerShell.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.join(__dirname, '..');

function has(cmd, args) {
  try {
    return spawnSync(cmd, args, { encoding: 'utf8' }).status === 0;
  } catch (e) {
    return false;
  }
}

// Strip the SGR colour codes so assertions read on the text, not the escapes.
const plain = (s) => String(s || '').replace(/\[[0-9;]*m/g, '');

const SHELLS = [
  {
    name: 'bash',
    available: () => has('bash', ['-c', 'exit 0']),
    run: (env) => spawnSync('bash', [path.join(root, 'hooks', 'ponytail-statusline.sh')],
      { env, encoding: 'utf8' }),
  },
  {
    name: 'pwsh',
    available: () => has('pwsh', ['-NoProfile', '-Command', 'exit 0']),
    run: (env) => spawnSync('pwsh',
      ['-NoProfile', '-File', path.join(root, 'hooks', 'ponytail-statusline.ps1')],
      { env, encoding: 'utf8' }),
  },
];

for (const shell of SHELLS) {
  const skip = shell.available() ? false : `${shell.name} not installed`;

  test(`${shell.name}: renders the mode from the flag file`, { skip }, () => {
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'ponytail-statusline-'));
    try {
      fs.mkdirSync(path.join(temp, '.claude'), { recursive: true });
      fs.writeFileSync(path.join(temp, '.claude', '.ponytail-active'), 'ultra');
      const env = { ...process.env, HOME: temp, USERPROFILE: temp };
      assert.equal(plain(shell.run(env).stdout), '[PONYTAIL:ULTRA]');
    } finally {
      fs.rmSync(temp, { recursive: true, force: true });
    }
  });

  test(`${shell.name}: full mode renders the bare badge`, { skip }, () => {
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'ponytail-statusline-'));
    try {
      fs.mkdirSync(path.join(temp, '.claude'), { recursive: true });
      fs.writeFileSync(path.join(temp, '.claude', '.ponytail-active'), 'full');
      const env = { ...process.env, HOME: temp, USERPROFILE: temp };
      assert.equal(plain(shell.run(env).stdout), '[PONYTAIL]');
    } finally {
      fs.rmSync(temp, { recursive: true, force: true });
    }
  });

  test(`${shell.name}: no flag file renders nothing`, { skip }, () => {
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'ponytail-statusline-'));
    try {
      const env = { ...process.env, HOME: temp, USERPROFILE: temp };
      const result = shell.run(env);
      assert.equal(plain(result.stdout), '');
      assert.equal(result.status, 0, 'must exit 0 so it never breaks the status line');
    } finally {
      fs.rmSync(temp, { recursive: true, force: true });
    }
  });
}
