---
name: context-fundamentals
license: MIT
description: >
  The mental models behind context engineering: what context is, the anatomy of
  a context window, attention mechanics, the U-shaped (lost-in-middle) curve, and
  why signal density beats volume. Conceptual grounding, not operational tactics.
  Use when the user says "what is context engineering", "explain context windows",
  "attention budget", "lost in the middle", "why does quality beat quantity",
  "onboard me on context", or invokes /context-fundamentals.
---

Context is ponytail for tokens. The window is a finite attention budget, not a
storage bin — every token you load competes with every other token and dilutes
the ones that matter. "Don't write code you don't need" becomes "don't load
context you don't need." Load what earns its place; cut the rest. This skill is
the *why* under every other context skill — for the *how*, route out (Boundaries).

## What context is

Everything the model sees at inference: system prompt, tool defs, retrieved docs,
message history, tool outputs. Engineering it = curating the smallest high-signal
token set that gets the outcome.

## The four laws

1. **Informativity over exhaustiveness** — load only what this decision needs; retrieve the rest on demand.
2. **Position-aware placement** — critical constraints go at the top and bottom; the middle leaks (see curve).
3. **Progressive disclosure** — load names/summaries at startup; load full content only when a thing activates.
4. **Iterative curation** — re-curate every time you pass content, not once at prompt-write time.

## Attention mechanics

- Attention is n² pairwise over n tokens. Quality degrades as a **gradient**, not a cliff.
- **U-shaped / lost-in-middle:** middle-position info recalls 10-40% worse than the edges.
- **Effective capacity < nominal window.** A big advertised window does not mean it attends evenly. Budget below the limit until your own degradation test on the target workload proves otherwise.

## Signal-density test

For each chunk: *would removing it change the output?* No → remove it. Redundant
context doesn't just waste tokens, it actively pulls attention off the high-signal
content. Smaller high-signal beats larger low-signal, every time.

## Anatomy + tactics per component

| Component | Default move | Watch for |
|---|---|---|
| System prompt | XML/MD sections; constraints at top+bottom | mixed altitudes → conflicting signals |
| Tool defs | answer what/when/returns; keep set minimal | JSON schemas inflate 2-3x vs plain text |
| Retrieved docs | strong identifiers (`customer_rates.json`), JIT load, chunk on semantic breaks | weak ids (`file1.json`) force needless loads |
| Message history | scratchpad; compact stale tool results to refs | balloons to 70-80% in agentic loops |
| Tool outputs | observation-masking: swap verbose output for a ref once processed | often dominates the trajectory |

**Instruction altitude:** too low = brittle hardcoded logic; too high = vague.
Aim heuristic-driven — numbered steps with room for judgment. Start minimal, add
reactively on observed failures, not preemptively.

## Budget allocation (planning baseline, measure to confirm)

| Component | Typical | Note |
|---|---|---|
| System prompt | 500-2000 tok | stable across session |
| Tool defs | 100-500 / tool | grows with count |
| Retrieved docs | variable | often largest |
| History + tool outputs | variable | grows; cap it |

Token math drifts: ~4 chars/tok for prose, but 2-3 for code, ~1 token per
slash/dot in paths. Use the real tokenizer for any budget-critical number.

## Lazy is not negligent

Trimming context is not the same as trimming safety. Never bury safety
constraints, output-format rules, or behavioral guardrails in the middle — anchor
them top or bottom. And measure before you trust the window: design *for*
degradation, don't hope to avoid it. Compaction trigger: 70-80% utilization.

## Verdict

Finite budget, diminishing returns. Edges over middle. Defer loading until
needed. Signal density over volume. If a token wouldn't change the output, it's rent.

## Boundaries

This is the *why*; the operational skills own the *how*:

- Diagnosing lost-in-middle / poisoning / distraction → `context-degradation`.
- Token-efficiency (masking, partitioning, caching, budgets) → `context-optimization`.
- Compacting a long session into a handoff → `context-compression`.
- Offloading big outputs / durable scratchpad → `filesystem-context`.
- Cross-session memory + entity tracking → `memory-systems`.
- Writing tool descriptions/schemas → `tool-design`.
- Shaping an LLM project/pipeline → `project-development`.

"stop ponytail" / "normal mode": revert to verbose context-engineering guidance.
