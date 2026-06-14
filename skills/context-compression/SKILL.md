---
name: context-compression
license: MIT
description: >
  Compress long agent sessions and oversized codebases without losing
  load-bearing facts — structured summaries, compaction triggers, artifact-trail
  preservation, durable handoff summaries. Use when the user says "compress
  context", "summarize this session", "compaction strategy", "handoff summary",
  "the agent forgot what files it edited", "context window is full", "tokens per
  task", or invokes /context-compression.
---

# Context Compression

Context is a finite budget, not storage. Be lazy with tokens: keep only what the
next step reads, cut the rest. Wrong kind of lazy: fewest tokens *per request* —
drop a path, the agent re-explores, you pay it back twentyfold. Right kind: fewest
*per task*, re-fetch included.

## Pick the method

| Method | Ratio | Quality/5 | Use when |
|---|---|---|---|
| Anchored iterative | 98.6% | 3.70 | Long session (100+ msgs), file tracking matters. **Default.** |
| Regenerative full | 98.7% | 3.44 | Human-readable summary, clear phase boundaries |
| Opaque | 99.3% | 3.35 | Short session, cheap re-fetch, max savings, no debugging |

Ratios are benchmarks, not laws. Artifact trail scores weak (~2.2-2.5) on *every*
method — handle separately (below).

## Anchored iterative (the standout technique)

Don't regenerate the whole summary each cycle — that drifts, shedding details
every pass. Summarize only the newly-truncated span, merge into a persistent
structured summary, dedup by file path and decision identity, tag the source cycle.
Each section is a checklist the summarizer fills, so omissions show.

```markdown
## Session Intent   [what the user wants accomplished]
## Files Modified   [path: what changed — include function names]
## Decisions Made   [choice + why]
## Current State    [tests passing/failing, where we are]
## Next Steps       [ordered, actionable]
```

Swap sections to domain: debugging → Root Cause + Error Messages; migration →
Source/Target Schema. Any explicit schema beats freeform.

**Trigger** on a sliding window (last N turns + summary) for predictable size. Else:
fixed threshold at 70-80% used (simple, fires early), importance-based (signal
first), or task-boundary (clean cuts, unpredictable timing).

## Large codebases: three phases

Each phase narrows context for the next (5M tokens → ~2,000-word spec): **Research**
(arch/docs/interfaces → one analysis doc) → **Plan** (spec: signatures, types, data
flow) → **Implement** (against spec + active files only). Seed with a reference PR /
migration example — it encodes essential-vs-accidental complexity static analysis misses.

## Lazy is not negligent — never compress these

- **Tool defs / schemas** — immutable anchors; summarize a param away, the tool dies.
- **Artifact trail** — files created/modified (paths + function names), read-only, identifiers (vars, error codes). Dedicated section/index.
- **Early-turn constraints** — task setup, user constraints, arch calls; pin to a preamble that survives every cycle.
- **Identifiers verbatim** — never paraphrase paths/SHAs/snippets into prose.
- **Code vs prose** — compress prose hard, keep code/structured data verbatim.
- **Repeats** — ratios compound: 95% three times leaves 0.0125%. Calibrate for it.

## Evaluate with probes, not metrics

ROUGE / embedding similarity score high while losing the one path you need. Probe
whether critical info survived. **Blind the judge** to which method produced the
answer — known-method bias is real.

| Probe | Tests | Example |
|---|---|---|
| Recall | facts | "What was the original error message?" |
| Artifact | file tracking | "Which files did we modify?" |
| Continuation | planning | "What's next?" |
| Decision | reasoning | "Why connection pooling?" |

Score six dimensions: accuracy, context-awareness, artifact-trail, completeness,
continuity, instruction-following. Rotate probe sets so file-name checks don't
mask signature loss. Live signal: agent re-asking for files it saw = too hard.

## Boundaries

- Masking / prefix-caching / partitioning → `context-optimization`.
- Diagnosing *why* a long context fails before mitigating → `context-degradation`.
- Raw outputs/logs to disk un-summarized → `filesystem-context`.
- Long-term semantic memory across sessions → `memory-systems` (invalidate stale, don't discard live).

"stop ponytail" / "normal mode": revert to verbose context-compression guidance.
