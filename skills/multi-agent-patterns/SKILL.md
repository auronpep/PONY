---
name: multi-agent-patterns
license: MIT
description: >
  Decide whether to use multiple agents and pick the topology when you do —
  supervisor, swarm, or hierarchical — with context isolation, explicit handoffs,
  consensus, and failure handling. Use when the user says "multi-agent",
  "sub-agents", "supervisor / orchestrator", "swarm", "agent handoff", "should I
  split this into agents", "parallel agents", or invokes /multi-agent-patterns.
---

Context is a finite budget; ponytail says be lazy with tokens — don't load what
you don't need. A sub-agent is the laziest move there is: a fresh, empty window for
one subtask, so no single context carries the whole job. But each agent is a new
context to feed, coordinate, and pay for. Spawn one only when isolation earns its
tax. The default answer is one agent.

## Spawn test — pass one gate or stay single

Multi-agent only when at least one holds:

- One context can't hold the task — history + retrieval + tool output degrades it.
- Subtasks are genuinely parallel (independent sources/docs/branches).
- Subtasks need different tools or system prompts — specialization, not one bloated generalist.

Degradation signals that justify the split: lost-in-middle, attention scarcity, context poisoning. No signal, no split.

## Pick the topology by coordination need, not metaphor

| Pattern | Use when | Shape | Cost |
|---|---|---|---|
| **Supervisor** | clear decomposition, human oversight matters | coordinator → specialists → aggregate | supervisor context bottlenecks; failures cascade; telephone game |
| **Swarm** | flexible exploration, plan emerges, rigid plan hurts | any agent hands off to any agent | divergence risk, needs convergence checks |
| **Hierarchical** | large layered projects | strategy → planning → execution | inter-layer overhead, strategy/execution drift |

## The one technique to keep: skip the telephone game

Supervisors paraphrase sub-agent output and lose fidelity — ~50% worse than tuned. Don't let the supervisor re-narrate. Give sub-agents a `forward_message` path that returns the final answer straight to the user (supervisor only routes, doesn't restate). When sub-agents can answer the user directly, prefer a swarm — translation error goes to zero.

## Context isolation — the actual point

Default to the leanest handoff; escalate only when shared state forces it:

1. **Instruction passing** (default) — sub-agent gets objective + constraints + I/O schema, nothing else.
2. **File-system memory** — agents read/write shared files for state multiple agents must see faithfully. Beats message-passing (no paraphrase drift); costs latency.
3. **Full-context delegation** (last resort) — share the planner's whole window. This defeats isolation; use only when the subtask truly needs it.

## Token reality

Multi-agent runs ~15x baseline (coordination + retries + consensus rounds). Budget 15x; less is a bonus. Token usage, tool calls, and model choice dominate performance variance — a better model often beats more agents. Always measure the multi-agent setup against a single-agent baseline; if it isn't faster or better after coordination cost, collapse back to one.

## Lazy is not negligent — never skip

- **Consensus bias.** No naive majority vote (it weights a weak model's hallucination equal to a strong model's reasoning). Use confidence/expertise-weighted voting or adversarial debate. Assign explicit dissent roles; require stated disagreement before convergence. LLMs converge to *agreeable*, not *correct*.
- **Validate between agents.** One agent's hallucination is the next's "fact." Check outputs before they pass downstream. Circuit-break after 3 consecutive failures; set a TTL so no agent loops forever.

## Failure modes → fix

| Failure | Fix |
|---|---|
| Supervisor bottleneck | cap workers 3-5/supervisor, add a tier; distilled output schemas; checkpoint state |
| Coordination overhead | tight handoff protocol, batch results, async; measure vs single agent |
| Divergence | clear per-agent boundaries, convergence checks, TTL |
| Error propagation | validate before consume, retry + circuit breaker, optional verifier agent |
| Over-decomposition | split only when a subtask truly needs its own context |

## Verdict

Default single. Spawn on a passed gate, not a metaphor. Cap at 3-5 agents — each new one adds channels quadratically. Forward, don't paraphrase. Weight votes, validate handoffs, budget 15x. If it isn't faster or better than one agent after coordination cost, it's decorated leak — collapse it.

## Boundaries

- Single-vs-multi at project level, before topology → `project-development`.
- Remote sandboxes, warm pools, sessions → `hosted-agents`.
- KV-cache trajectory handoff between aligned models → `latent-briefing`.
- The tools each agent exposes → `tool-design`.
- Shared persistent state mechanics → `memory-systems`.
- Did multiple agents actually win after cost → `evaluation`.

"stop ponytail" / "normal mode": revert to verbose multi-agent guidance.
