---
name: context-degradation
license: MIT
description: >
  Diagnose and fix context failures: lost-in-middle, poisoning, distraction,
  confusion, clash. Detection signals + mitigation per pattern, degradation
  thresholds, the write/select/compress/isolate framework. Use when an agent
  degrades over a long conversation, "lost in the middle", "context poisoning",
  "context clash", "context confusion", "agent got worse", "ignoring earlier
  context", or invokes /context-degradation.
---

Context is a finite attention budget, not storage. A bigger window dilutes the
budget; it doesn't grow it. Being lazy with tokens IS the discipline: degradation
is every token you loaded that didn't earn its place now competing with the ones
that did. Fix == cut: load what's load-bearing, evict the rest, never trust a
window for being big.

## The five patterns

Degradation is not binary. It shows up as five named failures, each with its own
tell and its own fix.

| Pattern | Tell | Fix |
|---|---|---|
| **Lost-in-middle** | Right info is in context but ignored; replies contradict provided data | Put critical info at start/end, never the middle. U-curve costs 10–40% middle recall |
| **Poisoning** | A bad fact/tool error persists despite correction; quality drops on once-solid tasks | Truncate to before it entered. Reload verified-only. Don't layer corrections on top |
| **Distraction** | One irrelevant doc tanks a relevant task | Filter before loading. Even one distractor is a step-function hit, not linear |
| **Confusion** | Wrong-task constraints/tools applied to current task | Isolate tasks in separate windows. Explicit reset markers between segments |
| **Clash** | Two individually-correct sources contradict; model picks one silently | Version-filter first. Annotate conflict + precedence; don't let both in raw |

## Thresholds (design constraints, not truths)

- Expect onset at **60–70% of the advertised window** for complex retrieval. Only ~half of "32K+" models hold up at 32K (RULER).
- Degradation is **non-linear with a cliff** — flat, then a sharp drop. Set compaction triggers at **70% of known onset**, not at onset.
- 1M+ windows still follow the U-curve — bigger delays the cliff, doesn't remove it.
- Alert lines that travel: util warning **0.7**, critical **0.9**; middle-region or relevance floor **0.3**; **3** consecutive warnings = act.
- Re-benchmark per workload. Published thresholds go stale 20–50% on any model update.

## Standout technique — poisoning circuit breaker

Recovery is removal, not repair. Layered corrections fail because the original
error keeps its attention weight.

1. Find the first turn the bad claim entered.
2. Truncate or restart from before that point.
3. Reload verified sources only.
4. Record the rejected claim + provenance so it can't re-enter.

Strategic truncation order when you must shrink: keep system prompt + tools →
keep recent turns → keep critical docs → summarize old → cut from the middle.

## The four-bucket framework

Pick by active symptom — not all four at once.

- **Write** — offload to scratchpad/file when util > 70%. Keep active context lean.
- **Select** — pull only relevant context (distraction/confusion). Score, then drop below threshold.
- **Compress** — summarize while all content is still relevant (mask verbose tool output).
- **Isolate** — split across sub-agents/sessions (confusion/clash, or independent tasks). Most aggressive, often most effective.

## Counterintuitive — don't over-trust order

Shuffled haystacks sometimes beat coherent ones: coherent context invents false
associations; incoherent forces exact matching. Heavy structure is a hypothesis,
not a win — test both arrangements before committing.

## Lazy is not negligent

Never diagnose degradation from one bad run — baseline first, then look for
sustained decline correlated with context growth. Rule out the cheap causes
before blaming the window: if the prompt fails at 2K tokens, it's the prompt, not
degradation; needle-in-haystack at 99% says nothing about multi-fact production
work. Measure before you trust the window.

## Boundaries

- `context-fundamentals` — attention/window mechanics before any failure exists.
- `context-optimization` — masking/caching/partitioning tactics after diagnosis.
- `context-compression` — structured summaries/handoffs when accumulated context must compact.
- `filesystem-context` — offload raw logs/scratch so bulky or poisoned context leaves the prompt.
- `multi-agent-patterns` — task isolation to prevent confusion/clash.
- `evaluation` — degradation tests + production monitoring.

Verdict: name the pattern, apply its one fix, set the trigger at 70% of onset.

"stop ponytail" / "normal mode": revert to verbose context-degradation guidance.
