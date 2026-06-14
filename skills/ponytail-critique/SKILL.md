---
name: ponytail-critique
description: >
  Pre-implementation plan audit for ponytail. Given a proposed change, feature,
  abstraction, or plan, returns a keep / cut / shrink / defer verdict on whether
  it's actually worth adding to the code or is waste that should be cut. Burden of
  proof is on the addition; uncertain defaults to cut or defer (YAGNI). The
  forward gate to ponytail-review's backward one. Use when the user says "is this
  worth building", "should I add this", "audit this plan", "cut or keep", "is
  this a waste", "ponytail critique", or invokes /ponytail-critique.
---

Audit a proposed change before it's written. The question is not "how do we build
this well" — it's "should this exist at all." The addition carries the burden of
proof; when its value isn't clear, the verdict is cut or defer.

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

If everything passes: `All load-bearing. Build it.` If nothing does, say so and
stop — the best plan is sometimes no plan.

## Boundaries

The forward dual of `ponytail-review`: this judges a plan *before* code exists;
review cuts complexity *after*. Verdicts only — does not write or apply code.
Correctness and performance of a *kept* item go to a normal review pass, not
here. User overrides a CUT and wants it built? Build it, no re-arguing.
"stop ponytail" / "normal mode": revert to neutral plan feedback.
