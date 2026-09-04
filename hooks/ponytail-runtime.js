const fs = require('fs');
const path = require('path');
const { getClaudeDir } = require('./ponytail-config');

const STATE_FILE = '.ponytail-active';
const isCopilot = Boolean(process.env.COPILOT_PLUGIN_DATA);
const isCodex = !isCopilot && Boolean(process.env.PLUGIN_DATA);

let stateDir = getClaudeDir();
if (isCodex) stateDir = process.env.PLUGIN_DATA;
if (isCopilot) stateDir = process.env.COPILOT_PLUGIN_DATA;

const statePath = path.join(stateDir, STATE_FILE);

function setMode(mode) {
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(statePath, mode);
}

function clearMode() {
  try {
    fs.unlinkSync(statePath);
  } catch (e) {
    // Already gone is the normal case for a repeated "stop ponytail" — stay quiet.
    // Anything else (EPERM, EBUSY) leaves a stale flag while the caller goes on to
    // report PONYTAIL MODE OFF, so the badge keeps showing a mode that is no longer
    // active with nothing to explain it.
    if (e.code !== 'ENOENT') {
      process.stderr.write('ponytail: could not remove mode flag at ' + statePath + ' (' + e.message + ')\n');
    }
  }
}

function writeHookOutput(event, mode, context = '') {
  if (isCopilot) {
    // Copilot reads additionalContext on SessionStart; ignores output elsewhere.
    process.stdout.write(JSON.stringify(
      event === 'SessionStart' && context ? { additionalContext: context } : {}));
    return;
  }
  if (isCodex) {
    const output = { systemMessage: `PONYTAIL:${mode.toUpperCase()}` };
    if (context) {
      output.hookSpecificOutput = {
        hookEventName: event,
        additionalContext: context,
      };
    }
    process.stdout.write(JSON.stringify(output));
    return;
  }
  process.stdout.write(context);
}

module.exports = {
  clearMode,
  isCodex,
  isCopilot,
  setMode,
  writeHookOutput,
};
