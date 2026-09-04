---
name: context-optimization
license: MIT
description: >
  Stretch effective context without a bigger window: KV-cache ordering,
  observation masking, compaction, partitioning, token-budget triggers,
  retrieval scoping. Use when the user says "optimize context", "reduce
  tokens", "cut token cost", "context budget", "mask tool outputs", "improve
  cache hit rate", "compact the conversation", "split across sub-agents", or
  invokes /context-optimization.
---

Context is a finite token budget, not storage. Be lazy with tokens: "don't
write code you don't need" becomes "don't load context you don't need." Every
token on stale output, a duplicate header, or a done-its-job doc is stolen from
the answer. Load what earns its place; mask, compact, or evict the rest. Measure
both ends or you're guessing.

## Order of operations (cheapest, safest first)

| # | Move | When | Risk |
|---|------|------|------|
| 1 | **KV-cache ordering** | a stable prefix exists | none — pure win |
| 2 | **Observation masking** | tool outputs >50% of context | low (retrievable) |
| 3 | **Compaction** | utilization >70%, masking done | lossy |
| 4 | **Partitioning** | est. context >60% of window | coordination tax |

Mask *before* compaction. Partition before the window is on fire. Triggers:
utilization >80% → compact · repetition/missed instructions → mask + compact ·
quality below baseline → audit composition *before* optimizing. Keep a 5-10%
buffer; trigger on signal, not a clock.

## KV-cache ordering

Cached K/V tensors reuse only across an identical prefix, so order every prompt
stable→dynamic: system prompt → tool defs → reused templates/few-shot → history
→ current query + dynamic metadata (always last). One whitespace change in the
prefix invalidates everything downstream. Pin system prompts as immutable
strings — no interpolated timestamps, session IDs, or versions; push `Current
date:` into a user message. Target 70%+ hit rate → ~50% cost, ~40% latency.

## Observation masking

Mask by recency + ongoing relevance, never uniformly. Replace with `[Obs:{ref_id}
elided. Key: {summary}. Full content retrievable.]`

| Rule | Targets |
|------|---------|
| Never mask | current-task-critical, last turn, active reasoning chain, errors while debugging |
| Mask after 3+ turns | verbose outputs whose key points are already in the flow |
| Mask immediately | duplicates, boilerplate headers/footers, already-summarized output |

Target 60-80% reduction, <2% quality hit. Retrievability is the trick: store full content externally, keep the ref in context.

## Compaction

Summarize, then reinitialize with the summary. Preserve by message type:

| Type | Keep | Drop |
|------|------|------|
| Tool outputs | findings, metrics, error codes, conclusions | raw dumps, stack traces (unless debugging), boilerplate |
| Conversation | decisions, commitments, user prefs, context shifts | filler, concluded back-and-forth |
| Retrieved docs | task-relevant claims/facts | one-shot supporting elaboration |

Thresholds: warn 70% · compact 80% · aggressive 85%. Target 50-70% reduction,
<5% degradation; >70% → audit for lost state. Never compact the system prompt;
re-validate every summary against the live goal — stale summaries look authoritative.

## Partitioning

Split across sub-agents when one window can't hold the problem without aggressive compaction. Each gets clean context, returns a structured result to a coordinator. Break-even needs ~3+ independent subtasks — coordinator, aggregation, and error handling all cost tokens; estimate before committing.

## Lazy is not negligent

Lazy with tokens, never with the signal the next turn needs:
- Never mask/compact error outputs during active debugging (error in last 3 turns).
- Never compact above 85% utilization — the summarizer is itself starved and
  drops goals/constraints; trigger at 70-80% or summarize in a clean side-call.
- Never drop decisions, user prefs, or the live goal to hit a reduction target.
- If an optimization doesn't measurably move its metric, rip it out — the
  machinery costs tokens too.

Verdict: `mask → compact → partition, cheapest first. Measure both ends. Retrievable, not gone.`

## Boundaries

- Why attention/windows behave this way → `context-fundamentals`.
- Already-dropped quality (lost-in-middle, poisoning, distraction) → `context-degradation`.
- Lossy handoff summary for a long conversation → `context-compression`.
- Offloading full outputs/logs to files → `filesystem-context`.
- Did the optimization actually help → `evaluation`.

"stop ponytail" / "normal mode": revert to verbose context-optimization guidance.
