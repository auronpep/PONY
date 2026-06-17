# Claude Code Handoff: Install PONY Ponytail

## Target

Install the private local PONY fork of Ponytail into Claude Code from the machine-local marketplace:

- Marketplace root: `C:\GHL\PONY-MARKETPLACE`
- Marketplace manifest: `C:\GHL\PONY-MARKETPLACE\.agents\plugins\marketplace.json`
- Plugin source: `C:\GHL\PONY-MARKETPLACE\plugins\ponytail`
- Plugin source target: junction to `C:\GHL\PONY`

This avoids using the public `DietrichGebert/ponytail` marketplace/source for install.

## Preflight

Run in PowerShell:

```powershell
node --version
claude --version
Get-Item -LiteralPath 'C:\GHL\PONY-MARKETPLACE\plugins\ponytail' | Select-Object FullName,LinkType,Target
Get-Content -LiteralPath 'C:\GHL\PONY-MARKETPLACE\.agents\plugins\marketplace.json'
```

Expected here:

- Node is on PATH.
- Claude Code is installed.
- `plugins\ponytail` is a junction to `C:\GHL\PONY`.
- The marketplace source is local: `./plugins/ponytail`.

## Install In Claude Code

Open Claude Code and run:

```text
/plugin marketplace add C:\GHL\PONY-MARKETPLACE
/plugin install ponytail@pony-local
```

Then open:

```text
/hooks
```

Review and trust the Ponytail lifecycle hooks:

- `SessionStart`: runs `hooks\ponytail-activate.js`
- `UserPromptSubmit`: runs `hooks\ponytail-mode-tracker.js`

Start a new Claude Code session after trusting hooks.

## Smoke Test

In the new session:

```text
/ponytail-help
/ponytail
```

Useful fork commands to verify:

```text
/ponytail-skill
/ponytail-claude-md
/ponytail-critique
```

The plugin should also expose the context-engineering skills from `C:\GHL\PONY\skills`.

## Notes

- Use `ponytail@pony-local`, not `ponytail@ponytail`, if you want this private local fork.
- Do not add `DietrichGebert/ponytail` unless you intentionally want the public upstream plugin.
- If Claude Code does not reload the new marketplace immediately, restart Claude Code and repeat the install command.
