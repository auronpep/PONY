<p align="center">
  <img src="assets/logo.jpeg" width="220" alt="Ponytail, the lazy senior dev">
</p>

<h1 align="center">NWBZPWNR — a Ponytail fork</h1>

<p align="center">
  <em>He says nothing. He writes one line. It works.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/github/stars/DietrichGebert/ponytail?style=flat-square&color=111111&label=stars" alt="Stars">
  <img src="https://img.shields.io/github/v/release/DietrichGebert/ponytail?style=flat-square&color=111111&label=release" alt="Release">
  <img src="https://img.shields.io/badge/works%20with-10%20agents-111111?style=flat-square" alt="Works with 10 agents">
  <img src="https://img.shields.io/badge/license-MIT-111111?style=flat-square" alt="MIT license">
</p>

<p align="center">
  <strong>80-94% less code &middot; 3-6&times; faster &middot; 47-77% cheaper</strong><br>
  <sub>Median of 10 runs across Haiku, Sonnet, and Opus. <a href="benchmarks/">Reproduce it yourself.</a></sub>
</p>

---

> **NWBZPWNR** — a fork of [ponytail](https://github.com/DietrichGebert/ponytail). Same lazy senior dev, plus extra skills (`ponytail-skill`, `ponytail-claude-md`).

You know him. Long ponytail. Oval glasses. Has been at the company longer than the version control. You show him fifty lines; he looks at them, says nothing, and replaces them with one.

Ponytail puts him inside your AI agent.

## Before / after

You ask for a date picker. Your agent installs flatpickr, writes a wrapper component, adds a stylesheet, and starts a discussion about timezones.

With ponytail:

```html
<!-- ponytail: browser has one -->
<input type="date">
```

More survivors in [examples/](examples/).

## Numbers

Five everyday tasks (email validator, debounce, CSV sum, countdown timer, rate limiter), three models, three arms: no skill, the [caveman](https://github.com/JuliusBrussee/caveman) skill, and ponytail. Ten runs per cell, median reported.

<p align="center">
  <img src="assets/benchmark-3model.svg" width="860" alt="Median lines of code per arm across Haiku, Sonnet and Opus; ponytail writes 80-94% less code than the no-skill baseline">
</p>

**80-94% less code, 47-77% less cost, and 3-6× faster than a no-skill agent, on every model.** Every shortcut ponytail takes is marked in the code with a `ponytail:` comment naming its upgrade path. Reproduce it yourself: `npx promptfoo eval -c benchmarks/promptfooconfig.yaml`. Method and raw numbers: [benchmarks/](benchmarks/). Production-grade tasks, where an unconstrained agent bloats far more, are written up in [benchmarks/results/](benchmarks/results/).

## How it works

Before writing code, the agent stops at the first rung that holds:

```
1. Does this need to exist?   → no: skip it (YAGNI)
2. Stdlib does it?            → use it
3. Native platform feature?   → use it
4. Installed dependency?      → use it
5. One line?                  → one line
6. Only then: the minimum that works
```

Lazy, not negligent: trust-boundary validation, data-loss handling, security, and accessibility are never on the chopping block.

## Install

The most effort ponytail will ever ask of you:

### Claude Code

```
/plugin marketplace add DietrichGebert/ponytail
/plugin install ponytail@ponytail
```

### Codex

```bash
codex plugin marketplace add DietrichGebert/ponytail
codex
```

Open `/plugins`, select the Ponytail marketplace, and install Ponytail. Then
open `/hooks`, review and trust its two lifecycle hooks, and start a new thread.

### Pi agent harness

```
pi install git:github.com/DietrichGebert/ponytail
```

### OpenCode

Run OpenCode from a checkout of this repo (the plugin reuses its `hooks/` and `skills/`), and add to `opencode.json`:

```json
{ "plugin": ["./.opencode/plugins/ponytail.mjs"] }
```

Injects the ruleset every turn at the active level; adds `/ponytail` and `/ponytail-review`. OpenCode also auto-loads this repo's `AGENTS.md`, so the rules hold even without the plugin. The plugin adds the `lite/full/ultra/off` levels.

That was it. He'd be proud. He won't say it.

Active every session. `/ponytail-review` finds what to delete in your diff. `/ponytail ultra` exists for when the codebase has wronged you personally. `/ponytail-help` explains the rest.

This fork adds three more. `/ponytail-skill` writes a new skill the lazy way — runs the ladder first and tells you when the skill shouldn't exist at all. `/ponytail-claude-md` updates CLAUDE.md without bloating it: every line is a per-session token tax, so it adds only what overrides a default and routes the rest elsewhere. `/ponytail-critique` audits a plan *before* you build it — keep / cut / shrink / defer verdicts on whether each piece is worth the code, the forward gate to `/ponytail-review`'s backward one.

### Context-engineering skills

Context engineering is ponytail for tokens: context is a finite attention budget, not storage — load what earns its place, cut the rest. This fork ports the [agent-skills-for-context-engineering](https://github.com/muratcankoylan/agent-skills-for-context-engineering) collection (MIT) into the ponytail house style — single-file, terse, tables over prose, lazy-with-tokens framing, no scripts. Fifteen skills:

| Skill | What |
|---|---|
| `/context-fundamentals` | Finite attention budget, U-shaped curve, position-aware placement — the conceptual anchor. |
| `/context-optimization` | Token tactics: KV-cache → mask → compact → partition, at measured thresholds. |
| `/context-compression` | Summarize long sessions by tokens-per-task; probe survival, not text overlap. |
| `/context-degradation` | Five named failure modes (lost-in-middle, poisoning, distraction, confusion, clash) + detection. |
| `/filesystem-context` | File-backed overflow: scratch pads, plans, sub-agent coordination, grep/glob over semantic search. |
| `/memory-systems` | Cross-session memory; start filesystem, climb only on retrieval decay; invalidate, don't discard. |
| `/tool-design` | Tool descriptions agents route on; consolidate to one purpose each; primitives over wrappers. |
| `/multi-agent-patterns` | Topologies to partition context; the telephone-game cliff and the `forward_message` fix. |
| `/evaluation` | Outcome-not-path rubrics, stratified test sets, deterministic gate before the judge. |
| `/advanced-evaluation` | LLM-as-judge: position-swap protocol, bias taxonomy, calibration. |
| `/harness-engineering` | Control surfaces: locked rubrics, append-only logs, novelty gates, rollback. |
| `/hosted-agents` | Hosted-agent infra: warm pools, image registries, snapshots, keystroke pre-warm. |
| `/project-development` | Task-model fit, manual-prototype-first, the acquire→render pipeline, cost estimation. |
| `/latent-briefing` | KV-cache state sharing between agents (only when you control worker inference runtime). |
| `/bdi-mental-states` | Formal belief/desire/intention ontology — RDF/SPARQL agent reasoning (niche). |

In Codex, invoke the skills as `@ponytail`, `@ponytail-review`, and
`@ponytail-help`. Startup and mode-change text shows the current mode.

Cursor, Windsurf, Cline, Copilot, Aider, Kiro: copy the matching rules file from this repo ([`.cursor/rules/`](.cursor/rules/), [`.windsurf/rules/`](.windsurf/rules/), [`.clinerules/`](.clinerules/), [`.github/copilot-instructions.md`](.github/copilot-instructions.md), [`AGENTS.md`](AGENTS.md), [`.kiro/steering/`](.kiro/steering/)).

Kiro: copy `.kiro/steering/ponytail.md` to `~/.kiro/steering/` (global) or `.kiro/steering/` in your project.

Which files map to which agent: [Agent portability](docs/agent-portability.md).

## Development

When changing the compact rule text, keep the agent copies aligned:

```bash
node scripts/check-rule-copies.js
```

## FAQ

**Does it need a config file?**
No.

**What if I really need the 120-line cache class?**
You don't. Insist anyway and he'll build it. Slowly. Correctly. While looking at you.

**Does it scale?**
The code you never wrote scales infinitely. Zero bugs, zero CVEs, 100% uptime since forever.

**Why "ponytail"?**
You know exactly why.

## License

[MIT](LICENSE). The shortest license that works.
