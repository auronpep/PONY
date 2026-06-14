---
name: latent-briefing
license: MIT
description: >
  Share orchestrator state with workers at the KV-cache level instead of
  replaying the trajectory as text. Task-guided Attention Matching compaction:
  keep the positions the worker's current task attends to, drop the rest. Use
  when the user says "share memory between agents", "KV cache compaction for
  multi-agent", "orchestrator worker context", "latent briefing", "reduce worker
  tokens", "cross-agent memory without summarization", or invokes
  /latent-briefing. Also: Attention Matching, recursive language models with
  workers, token explosion in hierarchical agents.
---

Ponytail for tokens: don't load context the worker doesn't need. A hierarchical
agent pays for the trajectory twice — orchestrator grows it, every worker call
re-reads it. The lazy move is at the representation level: keep the KV positions
this task attends to, drop the rest. Context is a finite attention budget, not storage.

## The problem

Recursive orchestrator → worker loops grow the trajectory with dead ends, tool
output, prior replies. Three text-layer fixes, each leaks:

| Approach | Leak |
|---|---|
| Pass full trajectory | Cost scales per worker call; noise degrades the worker |
| LLM summarization | Latency + lossy; may drop what the next subtask needs |
| Retrieval / RAG | Chunk-bound; misses cross-step dependencies |

Fits when the waste is **moving orchestrator state into a worker**, not
retrieving documents.

## The move

Operate on the worker's KV cache, not its prompt. More than prefix caching:
prefix caching reuses an identical prefix; this does **task-conditioned selective
retention** *inside* the reused trajectory. Engine is Attention Matching (AM):
find a smaller cache `t < S` whose attention outputs approximate the full one.
Three inference-time changes adapt it for handoff:

1. **Task-guided queries.** Score trajectory positions by how the *current
   worker task prompt* attends to them — not generic context-sampled queries.
2. **Shared mask.** Aggregate scores across layers/heads into one per-position
   keep/drop mask. Per-head masks force hundreds of incompatible solves; the
   shared mask is what makes it batchable and fast.
3. **MAD threshold.** Keep position `i` if `score[i] > median + tau * MAD`.
   Retention adapts to the score shape; higher `tau` = more aggressive.

## Pick the mechanism

| Need | Use |
|---|---|
| Stable repeated prefix, minimal logic change | Prefix caching |
| Human-readable / auditable cross-step state | Structured notes or summary |
| Sparse lookup over a large external corpus | Retrieval / RAG |
| Worker needs task-specific slices of orchestrator state AND you control the runtime | Latent Briefing |

## Threshold regimes

Tuning hypotheses from long-doc QA, not laws — re-measure on your workload:
longer docs → lighter compaction (keep coverage); harder questions → more
aggressive (prune speculative branches); short/easy → moderate (cut redundancy).
Reported: large worker-token cut, material total savings, low-single-digit-second
overhead — workload-specific, not a guarantee.

## Lazy is not negligent

- **Infra is gate zero.** Can't inspect/rewrite worker KV state → research idea,
  not deployable. API-only stack → use a text handoff.
- **Same model space.** KV compaction lives in one model's attention space.
  Different tokenizer/architecture across the handoff → don't assume it transfers.
- **Never trust the window before measuring.** One global `tau` rarely holds
  across long/short and easy/hard. Track accuracy, worker tokens, total tokens,
  retention, AND overhead together — token count alone lies. Baseline against
  prefix caching/notes/retrieval, not "send everything"; average over trials.

## Verdict

Use IFF you control the runtime, the handoff shares model space, and the
bottleneck is state replay (not retrieval). Else text handoff. Co-design with
eval — a small quality drop erases a large token win.

## Boundaries

- `context-optimization` — prefix caching / observation masking that doesn't
  transform KV state; the default first move.
- `context-compression` — text-layer summaries when human-readable, portable, or
  auditable state matters more.
- `multi-agent-patterns` — whether to be orchestrator-worker at all.
- `memory-systems` — external persistent memory vs in-worker latent state.

"stop ponytail" / "normal mode": revert to verbose latent-briefing guidance.
