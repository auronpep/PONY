---
name: bdi-mental-states
license: MIT
description: >
  Model agent mental states as beliefs, desires, intentions over RDF context —
  cognitive chains, world-state grounding, the Triples→Beliefs→Triples pipeline,
  explainable agency traces. Use when the user says "model beliefs desires
  intentions", "BDI", "BDI ontology", "agent mental states", "why did the agent
  act", "rational agency trace", "RDF to beliefs", "neuro-symbolic", or invokes
  /bdi-mental-states.
---

Context is a finite budget; be lazy with tokens. The agent's head is the scarce
slot, not the triple store. A belief is context that earned that slot — grounded
in a world state, dated, justified. Everything else stays in triples. Don't
promote a fact to a belief, a belief to a desire, or a desire to an intention
until something downstream needs it. The smallest model that answers "why did
the agent act?" is the right one.

## The triad — load only what's load-bearing

| State | Holds | Must reference | Promote when |
|-------|-------|----------------|--------------|
| `Belief` | what's true | a `WorldState` (never free text) | a fact is goal-relevant |
| `Desire` | what to bring about | the `Belief` that motivates it | a belief creates a goal |
| `Intention` | what's committed | the `Desire` it fulfils + a `Plan` | the agent commits to act |

Endurants (states above, persist over intervals) vs perdurants (`BeliefProcess`,
`DesireProcess`, `IntentionProcess` — events that create/modify states). States are
nouns, processes are verbs — mixing them collapses the perception↔cognition boundary
and breaks type-filtered queries.

## Cognitive chain — the one standout pattern

Wire the triad with bidirectional pairs so the graph reads both directions:
`Belief —motivates→ Desire —fulfilledBy→ Intention —specifies→ Plan —hasComponent→ Task —precedes→ Task`

Forward = "what should the agent do?" Backward = "why did it act?" The backward
trace is the whole point: explainable agency for free. Properties:
`motivates`/`isMotivatedBy`, `fulfils`/`isFulfilledBy`, `isSupportedBy` (intention←belief),
`specifies` (intention→plan), `addresses` (plan→goal), `precedes` (task order),
`isJustifiedBy` (any state→`Justification`), `refersTo` (belief→worldstate).

## T2B2T — the bidirectional pipeline

Agents consume external RDF and emit new RDF. Two phases, provenance preserved:

1. **Triples→Beliefs:** `WorldState —triggers→ BeliefProcess —generates→ Belief`. Source data flows into cognition with a traceable origin.
2. **(deliberate: belief→desire→intention→plan→execute)**
3. **Beliefs→Triples:** `PlanExecution —bringsAbout→ WorldState`. Results project back as standard linked data so downstream systems consume agent output.

## Build a BDI model — six passes

1. **World-state substrate** — model perceivable facts/events as `WorldState` first.
2. **Beliefs** — one per goal-relevant world state, with provenance + validity + justification.
3. **Desires** — only where a belief creates a motivation; link back to it.
4. **Intentions** — only on commitment; record the plan and preconditions.
5. **Project back** — emit result world states as RDF.
6. **Validate** — query provenance, motivation, plan order, active validity before trusting it.

## Measured thresholds — don't overload the head

- Ontology: start with 9 classes (`Agent`, `WorldState`, `Belief`, `Desire`, `Intention`, `Plan`, `Task`, `Justification`, `TimeInterval`). Add a class only when a competency question proves the core can't answer it.
- Chain depth: ≤ 3 levels (belief→desire→intention). Deeper rarely improves decisions and explodes LLM inference cost.
- Every state gets a validity `TimeInterval` — beliefs without bounds can't be GC'd or conflict-checked.
- Composite belief → `hasPart` sub-beliefs, so a partial update doesn't replace the whole.

## Logic Augmented Generation (folded algorithm)

Constrain LLM triple generation: serialize the ontology into the prompt, generate,
extract, validate against class restrictions, retry-with-feedback on violation — the ontology in context is the guardrail.

## Lazy is not negligent

Never skip: **world-state grounding** (ungrounded beliefs break querying and
cross-agent interop), **justifications** (unjustified states can't be audited — the
trace dies), **temporal bounds** (no GC, no conflict detection). These are the spine
of explainability; cutting them isn't lean, it's silent drift.

## Validate — competency questions

Ship only if these resolve: which beliefs motivated a desire? which desire does an
intention fulfil? which process generated a belief? ordered task sequence? states
valid at time T? No answer → undermodeled.

## Boundaries

- Persistent facts / entity memory without BDI semantics → `memory-systems`.
- Agent topology, handoff, coordination → `multi-agent-patterns`.
- Quality gates / regression on BDI output → `evaluation`.
- Context-window + attention mechanics → `context-fundamentals`.
- Query/validation/projection tool contracts → `tool-design`.

"stop ponytail" / "normal mode": revert to verbose BDI mental-state guidance.
