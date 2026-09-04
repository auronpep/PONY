---
name: ponytail-skill
description: >
  Write a new agent skill the lazy way: one SKILL.md, minimal frontmatter,
  no bundled scripts or templates until something actually needs them. Applies
  the ponytail ladder to skill authoring itself — the best skill is the one you
  don't write, the second best is one file. Use when the user says "make a
  skill", "write a skill", "new skill the lazy way", "minimal skill",
  "ponytail skill", or invokes /ponytail-skill.
---

A skill earns its tokens only if it changes behavior the model wouldn't already
default to. Most "skills" are a CLAUDE.md line, a memory, or a model default
wearing a costume. Apply the ladder before writing one.

## The skill ladder

Stop at the first rung that holds.

1. **Does it need to exist?** Would the model already do this correctly when
   asked plainly? Then it's a default in costume — skip it. Say so in one line.
2. **Is it a one-liner elsewhere?** A standing preference → memory or CLAUDE.md.
   A one-off → just ask in the prompt. Neither needs a skill.
3. **Does an existing skill cover it?** Extend that skill's description or body
   before adding a sibling that overlaps.
4. **One SKILL.md?** Almost always yes. No bundled files yet.
5. **Only then:** add a bundled script/reference *when a step is too long to
   inline or must run deterministically* — never "for later."

## Frontmatter

Two fields. `name` (kebab-case, matches the dir) and `description`. Add
`license: MIT` — the OpenClaw generator emits it for every skill anyway.

The description is the whole routing layer — it's all the model sees when
deciding to load the skill. Pack it: what the skill does, plus the literal
trigger phrases and `/slash` form. No marketing adjectives; they don't match
user words, so they don't route.

## Body rules

- Shortest instructions that change behavior. If a line restates a model
  default ("be helpful", "write clean code"), delete it.
- Concrete over abstract: a tag scheme, a format string, 3 worked examples
  beat a paragraph of philosophy.
- Imperative voice, present tense. The skill *is* the instruction, not a
  description of one.
- One responsibility per skill. Two jobs → two skills, or one with a clear mode
  switch — not a grab-bag.
- If the body is longer than what it replaces, the skill is the bloat.

## Smells — the over-engineered skill

`<thing>: <why it's bloat>. <what replaces it>.`

- `scaffold:` empty `scripts/`, `templates/`, `resources/` dirs with nothing real in them. Delete until a file earns its place.
- `restate:` instructions telling the model to do what it already does. Delete.
- `config:` intensity levels / knobs nobody will set. Ship one behavior; add a mode when a second is actually requested.
- `overlap:` near-duplicate of an existing skill. Merge into it.
- `prose:` philosophy paragraphs where a format string or example would do. Replace with the example.

## Procedure

1. Run the ladder out loud (one line per rung until one holds). If it stops
   above rung 4, **don't write the skill** — say what replaces it.
2. Write `skills/<name>/SKILL.md`. One file.
3. Done. No registry edit needed — skills auto-discover from the dir. No README
   churn unless the user asks.

End with: `skill: <name>, 1 file, <N> lines. skipped: <bundled X>, add when <Y>.`

## Boundaries

This is the lazy counterpart to a full skill-authoring guide — it optimizes for
the smallest skill that works, not exhaustive structure. User wants the full
treatment (bundled scripts, progressive disclosure, resource dirs)? Build it,
no re-arguing. Don't strip away trigger phrases, security/validation steps, or
an explicitly requested file — those are load-bearing, not bloat.
"stop ponytail" / "normal mode": revert to verbose skill-authoring style.
