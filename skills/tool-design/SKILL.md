---
name: tool-design
license: MIT
description: >
  Design the tool-interface layer for agents: tool descriptions agents route on,
  schemas, response formats, naming, actionable errors, MCP namespacing,
  tool-set consolidation, and whether to add or remove a tool. Use when the unit
  of work is one tool or a tool catalog, or the user says "design a tool",
  "write a tool description", "agent picks the wrong tool", "too many tools",
  "consolidate tools", "MCP tool naming", "fix this tool schema", or invokes
  /tool-design.
---

Context engineering is ponytail for tokens: context is a finite budget, so be lazy
with it. A tool catalog is the worst offender — every description sits in the
agent's attention budget on every call, and every overlap is a routing coin-flip
the agent loses. Laziest tool is the one you don't add; next is a primitive the
model already understands. Cut tools like you cut code.

## Consolidate

If a human can't say which tool to use, neither can the agent. Reduce until each tool has one unambiguous purpose — overlap is ambiguity is failure.

| Move | Rule |
|---|---|
| Merge | Sequential steps of one workflow: `list_users`+`list_events`+`create_event` → `schedule_event` (one call). |
| Keep split | Behaviors fundamentally differ, or each must be callable alone. |
| Re-split | Over-consolidated: 8+ params or several unrelated modes = unparameterizable. |

## Architectural reduction — the standout move

Push to the limit: give the agent a primitive (a command tool over a
well-documented file tree) instead of N specialist wrappers. Vercel d0 text-to-SQL,
17 tools → 2 primitives (`execute_command`, `execute_sql`): 274.8s → 77.4s (3.5x),
80% → 100% success, ~102k → ~61k tokens (-37%), ~12 → ~7 steps.

| Reduce to a primitive when | Keep specialists when |
|---|---|
| Data well-documented | Data messy / undocumented |
| Model reasons unaided | Domain needs knowledge model lacks |
| Specialists fence, not enable | Safety must restrict actions |
| You maintain scaffolding > outcomes | Workflows genuinely need orchestration |

Ask of every tool: enable a capability, or fence in reasoning the model already has? Guardrails turn into liabilities as models improve.

## Description = prompt

The description loads into context and steers selection — not human docs. Answer four questions, nothing more.

| Q | Content | Banned |
|---|---|---|
| Does what | Exact action | "helps with", "can be used for" |
| When | Direct trigger ("user asks pricing") + indirect signal ("need current rates") | vague scope |
| Inputs | Per param: type, constraints, default, format example | untyped params |
| Returns | Shape, success example, error conditions | "an object" |

Examples are specific or worthless: `"CUST-######" (e.g. "CUST-000001")`, not "an id like 123". Default params to the common case so the agent omits them safely.

## Schema, naming, errors

| Aspect | Rule |
|---|---|
| Names | verb-noun (`get_customer`); same concept = same param name everywhere (`customer_id`, never `id`/`identifier` by turns). |
| MCP | always `ServerName:tool_name` — unqualified names collide and fail "tool not found"; audit collisions when adding a provider. |
| Response | offer `concise` (key fields) vs `detailed` (full object, when output feeds a decision); response size is context cost. |
| Errors | the agent's recovery channel, not your logs: state bad value, expected format/example, next action, `retryable`. "failed" = zero signal. |

**Close the loop:** failures are free description tests — feed wrong-tool /
malformed-call cases back, find the missing info or misfiring ambiguity, fix,
re-test. Treat reported wins as workload-specific until reproduced on yours.

**Lazy is not negligent.** Never drop for brevity: trust-boundary input
validation, the bad-value-plus-fix in every error, and MCP server-qualification —
cutting these is a silent failure mode no prompt engineering recovers.

## Ship gate

Per tool: verb-noun name · answers the four Qs · params typed w/ default+example ·
machine-readable success+error · no scenario shared with another tool · adjacent
narrow tools merged unless independent calls required · large responses paged.
Verdict: `tools: <N>  overlaps: <M>  mergeable: <K>`. Ship iff the catalog can't shrink and each tool routes clean.

## Boundaries

| Skill | Handoff |
|---|---|
| `project-development` | pipeline shape, task-model-fit, project cost — not tool API |
| `multi-agent-patterns` | one agent + more tools vs splitting into sub-agents |
| `context-optimization` | trajectory-level weight of accumulated outputs |
| `context-fundamentals` | why adding tools degrades routing at all |
| `evaluation` | whether the tool set improved outcomes |
| `ponytail-critique` / `ponytail-review` | forward/back gates on whether a tool earns its place |

"stop ponytail" / "normal mode": revert to verbose tool-design guidance.
