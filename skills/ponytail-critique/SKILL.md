---
name: ponytail-critique
description: >
  Pre-implementation plan audit for ponytail. Given a proposed change, feature,
  abstraction, or plan, returns a keep / cut / shrink / defer verdict on whether
  it's actually worth adding to the code or is waste that should be cut. Burden of
  proof is on the addition; uncertain defaults to cut or defer (YAGNI). What
  survives the audit is then redesigned to the best standard — the leanest
  correct, idiomatic, tested form — before it's built. The forward gate to
  ponytail-review's backward one. Use when the user says "is this
  worth building", "should I add this", "audit this plan", "cut or keep", "is
  this a waste", "ponytail critique", or invokes /ponytail-critique.
---

Audit a proposed change before it's written. Two stages. First: should this
exist at all — the addition carries the burden of proof; unclear value → cut or
defer. Then, for what survives: build it to the best standard — the leanest
version that's actually correct, not whatever's quickest to type.

## Verdict per item

One line each, verdict first:

`<item>: <VERDICT> — <reason>. <replacement | trigger>.`

- `KEEP` — earns its place now. Name the current caller or requirement that needs it.
- `CUT` — speculative, unused, or duplicate. Nothing replaces it.
- `SHRINK` — real need, oversized build. Name the smaller form (stdlib, native, inline, fewer lines).
- `DEFER` — plausible later, not now. Name the trigger that flips it to KEEP ("add when <Y>").

## Gates

Run each proposed item through these. First failure decides the verdict.

1. **Need now?** A current caller or requirement uses it — not "for later." Fail → DEFER.
2. **Adds behavior?** Does what the code can't already do. Restates an existing default/path → CUT.
3. **Smallest form?** Could be stdlib, native, an installed dep, inlined, or fewer lines → SHRINK.
4. **Not a dup?** No existing function/abstraction already covers it. Dup → CUT (merge).
5. **Value > tax?** Benefit beats its maintenance surface, new deps, and complexity cost. No → CUT.

Auto-KEEP, never audited away: input validation at trust boundaries, data-loss
handling, security, accessibility. Lazy is not negligent.

## Output

End with the tally and the call:

`keep: <N>  cut: <M>  shrink: <K>  defer: <J>`
`build: <the keepers + shrunk forms>. skip: <the cut / deferred>.`

If everything passes: `All load-bearing.` Then go design them (next section). If
nothing does, say so and stop — the best plan is sometimes no plan.

## Build the keepers right

A KEEP earns code, so it earns *good* code — not just any. SHRINK earns its
smaller form built well. Don't carry the lazy first draft into the build; redesign
each survivor to the best standard first. Lean and correct, never flimsy, never
gold-plated. For each survivor, design before writing:

- **Shape** — the smallest interface that does the job. Inputs, output, signature. No param nobody passes.
- **Stand on** — the stdlib / native / installed dep / existing util it sits on. Don't reinvent the base.
- **Break it** — the inputs that break it and how it answers. Trust-boundary validation, error / data-loss handling, security, accessibility are mandatory here, not optional.
- **Prove it** — the one runnable check that fails if the logic breaks. Smallest test that earns confidence, not a suite.

Build to that spec.

## Boundaries

The forward dual of `ponytail-review`: judges a plan *before* code exists; review
cuts complexity *after*. Stage 1 emits verdicts; stage 2 designs the survivors to
best standard and builds to that spec — it does not rewrite unrelated code. User
overrides a CUT and wants it built? Build it, no re-arguing.
"stop ponytail" / "normal mode": revert to neutral plan feedback.
