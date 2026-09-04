#!/usr/bin/env node
// ponytail — UserPromptSubmit hook to track which ponytail mode is active
// Inspects user input for /ponytail commands and writes mode to flag file

const { getDefaultMode } = require('./ponytail-config');
const { clearMode, setMode, writeHookOutput } = require('./ponytail-runtime');

let input = '';
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  try {
    // Strip UTF-8 BOM some shells prepend when piping (breaks JSON.parse)
    const data = JSON.parse(input.replace(/^\uFEFF/, ''));
    const prompt = (data.prompt || '').trim().toLowerCase();

    // Match /ponytail commands
    if (/^[/@$]ponytail/.test(prompt)) {
      const parts = prompt.split(/\s+/);
      const cmd = parts[0].replace(/^[@$]/, '/');
      const arg = parts[1] || '';

      let mode = null;

      if (cmd === '/ponytail-review' || cmd === '/ponytail:ponytail-review') {
        mode = 'review';
      } else if (cmd === '/ponytail' || cmd === '/ponytail:ponytail') {
        if (arg === 'lite') mode = 'lite';
        else if (arg === 'full') mode = 'full';
        else if (arg === 'ultra') mode = 'ultra';
        else if (arg === 'off') mode = 'off';
        else mode = getDefaultMode();
      }

      if (mode && mode !== 'off') {
        // The flag is best-effort (it only drives the statusline badge), same as in
        // ponytail-activate.js. Unguarded, a write failure threw into the outer catch
        // and suppressed the mode-change message too — so the switch that DID take
        // effect looked like it was ignored.
        try {
          setMode(mode);
        } catch (e) {
          process.stderr.write('ponytail: could not write mode flag (' + e.message + ')\n');
        }
        writeHookOutput(
          'UserPromptSubmit',
          mode,
          'PONYTAIL MODE CHANGED — level: ' + mode,
        );
      } else if (mode === 'off') {
        clearMode();
        writeHookOutput('UserPromptSubmit', 'off', 'PONYTAIL MODE OFF');
      }
    }

    // Detect deactivation
    if (/\b(stop ponytail|normal mode)\b/i.test(prompt)) {
      clearMode();
      writeHookOutput('UserPromptSubmit', 'off', 'PONYTAIL MODE OFF');
    }
  } catch (e) {
    // Silent fail
  }
});
