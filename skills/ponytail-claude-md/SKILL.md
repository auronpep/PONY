---
name: ponytail-claude-md
description: >
  Update CLAUDE.md the lazy way. CLAUDE.md loads into context every session —
  every line is a permanent token tax, so it must change behavior or it's rent
  with no tenant. Adds only what overrides a default, routes the rest to its
  right home (memory, settings.json, a skill, or nowhere), edits in place over
  appending, deletes stale lines on touch. Use when the user says "update
  CLAUDE.md", "add to CLAUDE.md", "put this in CLAUDE.md", "trim CLAUDE.md",
  "ponytail claude.md", or invokes /ponytail-claude-md.
---

CLAUDE.md is read on every session for the life of the repo. A line that
doesn't change behavior is paid for forever and buys nothing. Default behavior
is to append a tidy verbose section; the discipline is to add less, route
better, and shorten what's already there.

## The add test

Before adding anything, three gates. Fail one → don't add it.

1. **Behavior-changing?** Would the model already do this when asked plainly?
   If yes, it's a default in costume — drop it.
2. **Right home?** CLAUDE.md is *only* for project instructions that override a
   default and can't live in code. Route everything else:
   - standing personal preference / cross-project fact → memory
   - settings, permissions, hooks, env → `settings.json`
   - reusable procedure → a skill
   - fact derivable from code, tests, or git history → nowhere; the repo says it
3. **Terse?** One line if one line carries it. No preamble, no rationale prose
   unless the rule is surprising enough to need a "why".

## Edit moves

- Edit in place. Find the section it belongs to and tighten it; don't append a
  near-duplicate at the bottom.
- Touch a section → delete its stale/contradicted lines in the same pass.
- Match the file's existing voice and heading style. Don't introduce a new
  format for one rule.
- A new top-level section is the last resort, not the reflex. Prefer a line
  under an existing heading.

## Smells

`<thing>: <why it's tax>. <fix>.`

- `restate:` "write clean code", "be helpful", "use good names". Model default. Delete.
- `misfiled:` a permission, hook, or personal pref sitting in CLAUDE.md. Move to its home.
- `stale:` rule contradicted by current code or a later rule. Delete the loser.
- `dup:` second section saying what an existing one says. Merge.
- `prose:` paragraph where a one-line rule works. Shrink to the rule.

## Procedure

1. Run the add test (one line per gate). Failed gate 2 → state the right home
   and put it there instead. Don't write to CLAUDE.md.
2. Read the target section first; edit in place.
3. Report: `claude.md: +<N>/-<M> lines. <what changed>.` Surface any stale
   lines you deleted.

## Boundaries

Optimizes for the leanest CLAUDE.md that steers behavior, not completeness.
User explicitly wants a verbose section, a rationale block, or a rule kept that
you'd cut? Add it, no re-arguing. Never delete a load-bearing instruction
(security, a real override, an explicit constraint) just to save lines — confirm
before cutting anything you're unsure is dead. "stop ponytail" / "normal mode":
revert to plain CLAUDE.md editing.
