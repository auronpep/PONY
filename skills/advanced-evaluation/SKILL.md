---
name: advanced-evaluation
license: MIT
description: >
  LLM-as-judge design the lazy way: pick direct-scoring vs pairwise, mitigate
  judge bias, calibrate rubrics and confidence, validate against humans. A judge
  call is context spend — load only the criteria, evidence, and passes that earn
  the verdict. Use when the user says "LLM as judge", "score this output",
  "pairwise comparison", "evaluator bias", "rubric calibration", "is my eval
  reliable", "A/B my prompt", or invokes /advanced-evaluation.
---

# Advanced Evaluation

A judge is a prompt, and every prompt is a context budget. Don't bolt on a
five-model panel before a single swapped pass earns its keep. Load the criteria
that decide the verdict, the evidence that anchors it, the second pass that
de-biases it — nothing else. Most evals are one judge, two passes, a rubric.

## Pick the approach

| Have ground truth? | Use | For | Watch |
|---|---|---|---|
| Yes — objective criterion | **Direct scoring** | accuracy, instruction-follow, format, toxicity | scale drift |
| No — preference/quality | **Pairwise** | tone, style, persuasiveness, creativity | position + length bias |
| Reference exists | **Reference-based** | summary vs source, translation vs gold | — |

Pairwise beats direct scoring on subjective tasks. Don't reach past the first row that fits.

## Direct scoring

Evidence before score — cite observable output features, then emit the number.

- Scale: **1-3** lowest load · **1-5** best granularity/reliability · **1-10** only with per-level rubrics.
- One criterion = one measurable aspect. Overloaded → unreliable score.
- Per criterion: cite evidence → score to rubric → justify → one fix.

## Pairwise — always swap positions

Single-pass pairwise is corrupted by position bias. The standout technique — run it every time:

1. Deterministic pre-checks first — both candidates meet the same schema, scope, evidence rules. Fail = out, no judge call.
2. Pass A: A first, B second.
3. Pass B: B first, A second; map winner back (A↔B).
4. Agree → winner stands, confidence = average of the two.
5. Disagree → **TIE, confidence 0.5** (bias detected).

Confidence is never 100% — cap 0.99, reduce on inconsistency, raise with evidence count.

## Bias landscape

| Bias | Mitigation |
|---|---|
| Position — first slot wins | swap passes, consistency check |
| Length — longer scores higher | explicit "ignore length" + length as its own criterion |
| Self-enhancement — rates own output up | different model for gen vs eval; strip attribution |
| Verbosity — irrelevant detail wins | rubric penalizes off-scope content |
| Authority — confident tone wins | require evidence; hedged+sourced beats confident+bare |

## Metrics — match to task, read the bands

| Task | Primary | vs humans |
|---|---|---|
| Binary pass/fail | Precision, Recall, F1 | Cohen's κ |
| Ordinal 1-5 | Spearman ρ | weighted κ |
| Pairwise | agreement rate, position consistency | — |

Bands (validate, then trust): Spearman ρ good >0.8 / bad <0.6 · Cohen's κ >0.7 /
<0.5 · position consistency >0.9 / <0.8 · length-score correlation <0.2 / >0.4.
Chase systematic disagreement, not raw agreement — a judge consistently wrong on
one criterion beats one with random noise.

## Scale only when stakes pay

Default: one judge. **PoLL** (multi-model, median-aggregate) for high-stakes.
**Hierarchical** (cheap screen → expensive on edge cases) for volume.
**Human-in-loop** routes low-confidence to people. Each adds tokens — make the
stakes justify them.

## Lazy is not negligent

Never skip: the deterministic pre-check gate, position swapping on pairwise,
evidence-before-score, and validation against human labels — an eval nobody
checked against humans is decoration. Version-control judge prompts (wording
swings scores); re-anchor rubrics against fresh human examples as standards drift.

## Boundaries

- `evaluation` — deterministic checks, regression suites, production gates. This skill owns the judge.
- `harness-engineering` — locked rubrics, rollback, autonomous-loop governance.
- `tool-design` — schemas/error handling for eval tools; `context-optimization` — token/latency budget for high-volume judges.

Verdict: one judge, two swapped passes, evidence-anchored scores, validated
against humans. Add a panel only when stakes outweigh the tokens.
