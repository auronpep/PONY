---
name: evaluation
license: MIT
description: >
  Build evaluation for agent systems: deterministic gates, multi-dimensional
  rubrics, regression suites, quality gates, baseline comparison, production
  monitoring, outcome measurement. Use when the user says "evaluate this agent",
  "build an eval", "eval suite", "quality gate", "rubric", "regression suite",
  "is the agent good enough", "measure agent quality", "score the output", or
  invokes /evaluation. Routes judge-prompt design to advanced-evaluation.
---

Context engineering is ponytail for tokens, and so is evaluation: measure only
what changes a decision. Every dimension, test case, and judge call is attention
spent — load what earns its place, cut the rest. Don't run a model judge where an
`assert` settles it. Don't average five scores into one that hides the failure.
The leanest eval that catches the real regression beats the dashboard nobody reads.

## Run order (cheap gate first)

Deterministic before judged, always. A subjective score can't launder a broken
artifact.

1. **Deterministic gate** — schema valid, required files/evidence present, no dup IDs, rubric math checks. Machine-checkable → fail fast, spend zero judge tokens.
2. **Rubric** — per-dimension scores, weighted aggregate, thresholds.
3. **LLM judge** — only when no deterministic check exists and only after the gate passes. Different model family than the agent (self-enhancement bias).
4. **Human** — edge cases + random production sample. Feed findings back into 1–3.

## Score outcomes, not paths

Agents reach goals by different valid routes. Define outcome criteria (correct,
complete, quality); treat the execution path as informational, never a pass/fail
check. For stateful agents, assert the final state, not the steps that built it.

## Rubric (canonical weights + ladder)

One number hides dimension failures. Score each, weight per use case, report the
breakdown. Fail the eval if any single dimension drops below its floor — don't
let a high aggregate paper over it.

| Dimension | Default weight | Weight heavily when |
|---|---|---|
| Factual accuracy | 0.30 | knowledge tasks |
| Completeness | 0.25 | research tasks |
| Tool efficiency | 0.20 | cost-sensitive systems |
| Citation accuracy | 0.15 | trust-sensitive output |
| Source quality | 0.10 | authoritative output |

Level ladder per dimension: `1.0` excellent · `0.8` good · `0.6` acceptable ·
`0.3` poor · `0.0` failed. Overall = weighted average. Pass threshold: `0.7`
general, `0.9` high-stakes.

Per-dimension floor: `0.6` (acceptable) general, `0.8` (good) high-stakes. One
dimension under its floor fails the run regardless of the weighted average —
that is the gate the Verdict blocks on.

## Test set

- Size: 20–30 cases early (changes are dramatic), 50+ for reliable signal.
- Stratify by complexity, report per stratum so easy cases don't inflate the score: **simple** (1 call, lookup) · **medium** (multi-call, comparison) · **complex** (many calls, ambiguity) · **very complex** (extended, synthesis).
- Source from real usage + known edge cases. Version it; keep it out of prompts/training (contamination).

## Performance drivers (browse-agent research)

Token usage is the primary variance driver; tool-call count secondary; model
choice secondary-but-multiplicative. Implications: set production-realistic token
budgets (not unlimited), weigh a model upgrade against a bigger budget, and
benchmark every extra agent against the single-agent baseline.

## Continuous

Eval is not a launch gate — quality drifts as models, tools, and usage change.
Run on every significant change against a stored baseline; block regressions.
Sample production continuously; alert at `<0.85` pass (warning), `<0.70`
(critical).

## Lazy is not negligent

Never skip the deterministic gate (it's the cheapest check and the one that
catches structural breakage). Never single-score — always report per-dimension.
Use a different judge model family. Keep eval sets versioned and uncontaminated.
Cross-check automated metrics against human judgment, or you optimize the metric
instead of the quality.

## Verdict line

End an eval run with: `pass-rate: <X>  failed-dims: <list>  vs-baseline: <±Δ>`.
No regression and floors held → ship. Any floor breached → blocked, name it.

## Boundaries

- **advanced-evaluation** — judge-prompt design, pairwise comparison, calibration, bias mitigation. This skill *uses* a judge; that one *builds* it.
- **context-degradation** — diagnosing a context failure mode; here you only measure it.
- **harness-engineering** — locked evaluators, rollback, PR-approval boundaries (control loop, not measurement).
- **context-optimization** — token/cost/latency effect of a change; eval supplies the quality half.

"stop ponytail" / "normal mode": revert to verbose evaluation guidance.
