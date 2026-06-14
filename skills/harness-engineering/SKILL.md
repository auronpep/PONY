---
name: harness-engineering
license: MIT
description: >
  Design the control system around an autonomous agent: locked vs editable
  surfaces, durable logs, novelty gates, pruning, rollback, PR-without-merge,
  and human approval boundaries. Use when the user says "design a harness",
  "research loop", "autonomous agent loop", "what can the agent edit", "lock
  the eval", "stop the agent gaming the metric", "durable agent state", or
  invokes /harness-engineering.
---

# Harness Engineering

Context is a finite token budget, and an unwatched agent spends it carelessly — the harness is what stays lazy with tokens on its behalf. Same lazy law as ponytail, one level up: don't grant a surface the agent doesn't need, don't keep state in a window compaction will eat, don't add a metric the agent can edit. Grant the minimum that lets it self-correct; everything else is leak that drifts a multi-day loop off its objective.

## Surface classes

Separate the agent from the environment. Agent proposes; harness decides what's touchable.

| Surface | Examples | Rule |
| --- | --- | --- |
| Locked | metric, rubric, validator, merge policy | reads + proposes; never scores itself with edited rules |
| Editable | skill draft, experiment file, prompt, config under test | mutate freely in the loop |
| Append-only | results log, thread, rejected ideas | append, never rewrite |
| Human-controlled | merge, deploy, credentials, destructive ops | explicit human approval |

## The autoresearch core

Minimal loop that earns autonomy (Karpathy): one editable file, one locked evaluator, fixed wall-clock budget, one scalar metric, git rollback, durable log.

```
read locked context → pick hypothesis → edit allowed surface → checkpoint
→ run evaluator → log → keep if better, rollback if worse → repeat
```

The point is not "one metric" — it's that ambiguous feedback buys ambiguous autonomy. For open-ended work, swap the scalar for locked rubrics + deterministic structure checks + source traceability + a human-review threshold. Evaluator lives OUTSIDE the editable surface, cadence fixed enough to compare attempts, every failed attempt leaves a trail, rollback cheap.

## Durable state

Long runs externalize state — chat history dies at compaction. Write a `THREAD.md` before the loop starts (Prime Intellect nanoGPT pattern). Append-only logs capture: what was tried, what improved/failed, why a candidate was kept/discarded/escalated, which sources were checked, what the next agent does. TSV/JSONL for machine logs, Markdown for handoffs.

## Search discipline

Agents exploit the nearest surface, stack complexity, under-prune. Enforce:

1. Refresh upstream sources on a schedule.
2. Novelty check before spending a large budget.
3. Keep rejected attempts — no rediscovery.
4. Leave-one-out prune any multi-addition stack.
5. Reward simplification at equal quality.
6. Separate verifier before promotion.

**Mechanism registry** beats keyword overlap for novelty: track accepted mechanisms as records (`mechanism_id`, `owning_skill`, `status`, activation, behavior change, evidence, failure modes). Keyword overlap catches stale phrasing; mechanism comparison catches real duplication.

## Metric gaming — assume the agent learns the harness

| Exploit | Mitigation |
| --- | --- |
| edits eval/rubric then self-approves | lock rubrics per run |
| verbose filler that pleases a judge | report per-dimension scores, not just aggregate |
| cites unretrieved sources | require retrieval evidence before citation |
| wins aggregate, fails a critical dimension | gate on every dimension |
| hides failed results | preserve rejected log |

Monitoring agents stay read-only and must cite the file/log behind every claim, else they report stale state.

## Lazy is not negligent

Lock evaluators before the loop — a mutable metric means the agent optimizes the benchmark, not the task. "Prepare a PR" is never "merge a PR": agents draft, run checks, write the summary, and stop at human approval unless explicitly granted the specific action. A stopped autonomous loop is a harness failure, not a personality quirk — debug the harness.

## Design checklist

1. Objective in one sentence.
2. Sort every surface: locked / editable / append-only / human.
3. Pick feedback: scalar, rubric, deterministic tests, human review, or mix.
4. Define keep / discard / crash / timeout / review states.
5. Create the thread log before the loop.
6. Long loops: add source refresh + registry novelty + pruning.
7. Name what runs without asking vs what needs approval.
8. Validate on one known-good and one known-bad artifact.

Verdict: locked eval + narrow editable surface + durable log + per-dimension scores + PR≠merge. Miss one → the loop drifts or self-deals.

## Boundaries

- Quality gates / rubrics with no autonomous control surface → `evaluation`.
- Pairwise comparison + bias mitigation for proposal review → `advanced-evaluation`.
- Durable logs, scratchpads, thread files mechanics → `filesystem-context`.
- Whether the window itself still holds before you trust it → `context-degradation`.

"stop ponytail" / "normal mode": revert to verbose harness-engineering guidance.
