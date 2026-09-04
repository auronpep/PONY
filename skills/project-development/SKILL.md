---
name: project-development
license: MIT
description: >
  Project-level decisions for LLM systems: is an LLM even the right primitive,
  what shape the pipeline takes, what it costs, single vs multi-agent, structured
  output as a cross-stage contract. Use when the unit of work is a whole project
  or multi-stage pipeline. Use when the user says "design this pipeline", "should
  I use an LLM for this", "estimate the token cost", "single or multi-agent",
  "batch processing pipeline", "shape this LLM project", or invokes
  /project-development. Per-tool design routes to tool-design; per-trajectory
  context tactics route to context-optimization.
---

# Project Development

Context engineering is ponytail for tokens: don't load context you don't need. At
project scale, don't build the LLM stage you don't need, don't add the tool the
model doesn't need, don't pay for the pass you can cache. A pipeline is a budget;
every stage, tool, and token earns its place or gets cut.

## First gate: should this be an LLM at all

Any load-bearing STOP trait → don't build it.

| Proceed (LLM earns it) | Stop (wrong primitive) |
|---|---|
| Synthesis across sources | Precise computation / counting |
| Subjective judgment with a rubric | Real-time / sub-second latency |
| Natural-language output | Perfect-accuracy requirement |
| Error-tolerant (one bad item ≠ broken system) | Proprietary data not in prompt or training |
| Batch, no conversational state | Tight sequential dependency (errors compound) |
| Domain knowledge already in training | Deterministic output (same in → same out) |

**Manual prototype before any code.** Paste one representative input into the
model: does it know the task, hit the format, clear the quality bar? A failed
paste-test predicts a failed pipeline; a passing one is your prompt template and
baseline. Minutes spent, days saved.

## Pipeline shape

`acquire → prepare → process → parse → render`. Only **process** is LLM —
expensive, non-deterministic; the other four are plain code, iterate them free.
**File system is the state machine** (no DB): `data/{id}/ {raw,prompt,response,parsed}`.
Output file exists → stage done (skip). Delete a stage's file + downstream → re-run
that slice. Existence-check + delete = idempotency + caching + resume + debug, free.

## Structured output as a contract

The prompt determines parse reliability. Every structured prompt: explicit
**section markers**, a **format example**, the line *"I will parse this
programmatically"*, **constrained values** (enums, score ranges). Build parsers
that bend — regex tolerant of drift, defaults for missing sections, log not
crash. The parser absorbs the model's format slack.

## Cost and agent count

`cost ≈ items × (in_tok + out_tok) × price + 20–30% buffer`. Over budget?
Truncate, smaller model per easy item, cache partials, parallelize for wall-clock
(not cost). **KV-cache is the lever**: cached input ~10x cheaper — keep context
append-only and prefix-stable; a timestamp atop the system prompt voids the whole
run's cache. Default single-agent (≈4x a chat turn); go multi-agent (≈15x) only
for context isolation single can't reach — parallel exploration, work exceeding
one window, a benchmarked quality lift. Multi buys fresh windows, not role cosplay.

## Subtract, then iterate

Start with the fewest tools; add only on production evidence. Vercel's text-to-SQL agent cut 17
tools → 2 (bash + SQL): 80%→100% success, 3.5x faster, 37% fewer tokens — the
docs were already legible, the tools just re-summarized them. Reduce when data is
well-documented and the model can reason over it; add only for messy data,
missing domain knowledge, or hard safety limits. Expect to refactor (Manus: 5x) —
keep it simple so refactoring stays cheap, test across model generations so
today's scaffolding isn't tomorrow's cage.

## Lazy is not negligent

- Never skip the manual paste-test — cheapest signal you'll get.
- Never ship without an eval gate — set quality metrics first, run on every model/prompt change; unmeasured pipelines regress silently.
- Keep errors in context — the model adapts from its own failures; erasing them removes the evidence.
- One run = one directory (evidence → transforms → outputs), or provenance drifts and the result is unauditable.

## Verdict

`fit: proceed|stop · shape: <stages> · tools: <N, each justified> · cost: $<est> · agents: single|multi+reason`. Minimal that ships the outcome → build; can't name what a stage/tool buys → cut it.

## Boundaries

- `tool-design` — per-tool interface (descriptions, schemas, errors), not pipeline shape.
- `multi-agent-patterns` — topology once you've picked multi (supervisor/swarm, handoffs).
- `harness-engineering` — the autonomous control loop (locked metrics, run-for-days).
- `context-optimization` — per-trajectory token tactics (masking, partitioning).
- `evaluation` — the quality gates this skill requires you run.

"stop ponytail" / "normal mode": revert to verbose project-development guidance.
