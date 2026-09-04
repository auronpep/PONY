---
name: memory-systems
license: MIT
description: >
  Persistent semantic memory for agents across sessions: framework choice
  (Mem0, Zep/Graphiti, Letta, Cognee, LangMem), memory layers, retrieval
  strategy, temporal validity, consolidation, and benchmark selection (LoCoMo,
  DMR, HotPotQA). Use when the user says "agent memory", "cross-session
  memory", "knowledge graph memory", "vector store vs graph", "temporal memory",
  "which memory framework", "consolidate memory", or invokes /memory-systems.
  Routes scratchpads to filesystem-context, handoffs to context-compression,
  in-trajectory token tactics to context-optimization.
---

# Memory System Design

Memory is the cross-session attention budget — not a warehouse. Every persisted
fact gets retrieved, ranked, and re-paid for on each load, so memory is a finite
token budget: load what the current task earns, leave the rest on disk. Don't
build a temporal knowledge graph to remember a dark-mode toggle. Start shallow;
add structure only when retrieval actually fails.

## Pick the shallowest layer that retrieves

| Layer | Persistence | Backing | Use when |
|-------|-------------|---------|----------|
| Working | context window | scratchpad in prompt | always; place at attention-favored ends |
| Short-term | session | file / in-mem cache | tool results, conversation state |
| Long-term | cross-session | KV → graph DB | preferences, domain knowledge |
| Entity | cross-session | entity registry + props | identity ("John Doe" = same person) |
| Temporal KG | + history | edges with validity intervals | facts that change; time-travel queries |

Escalate only on a measured failure of the layer below. File-system memory beats
specialized tooling on some benchmarks (LoCoMo filesystem baseline).

## Framework by dominant retrieval pattern

| Framework | Shape | Reach for it when | Tax |
|-----------|-------|-------------------|-----|
| Mem0 | vector + graph, pluggable | fast to prod, multi-tenant | thin on multi-agent |
| Zep/Graphiti | bi-temporal KG | relationship + time queries | advanced bits cloud-locked |
| Letta | self-editing tiered store | agent self-introspection | overkill for simple |
| Cognee | multi-layer semantic graph | dense multi-hop reasoning | heavy ingest |
| LangMem | LangGraph memory tools | already on LangGraph | coupled to it |
| File-system | files + naming | prototype, simple agent | no semantic search |

Compare by retrieval shape, not brand. Bi-temporal need → Graphiti. Richer
interconnected knowledge → Cognee. Treat benchmark numbers (DMR, LoCoMo,
HotPotQA) as dated signals to recheck before any product claim — never absolutes.

## Match retrieval to query shape

| Strategy | Use when | Limit |
|----------|----------|-------|
| Semantic (embedding) | direct factual lookup | degrades on multi-hop |
| Entity (graph traversal) | "everything about X" | needs graph |
| Temporal (validity filter) | facts change over time | needs validity metadata |
| Hybrid (semantic+keyword+graph) | best accuracy | most infra |

Retrieve subgraphs/relevant memories just-in-time; never preload the whole store.

## Consolidate: invalidate, don't discard

Unbounded memory rots retrieval. Trigger on count threshold, degraded quality, or
schedule. Algorithm: group edges by `(subject, predicate)`; within each group keep
the highest-confidence/most-recent, merge the rest's properties into it, mark
superseded ones invalid — preserve them for temporal queries. Rebuild indexes.

## Lazy is not negligent

Cutting load is fine; cutting these is data corruption:
- **Track `valid_from`/`valid_until`** on any fact that can change. No validity → stale facts poison context silently.
- **Invalidate, never delete** — temporal reconstruction needs history.
- **Pin one embedding model per store.** Read/write with different models = junk retrieval; re-embed all on change.
- **Plan the empty/conflict path.** Empty → widen search, then ask. Conflict → newest `valid_from` wins, surface if low confidence. Stale → consolidate, retry. Write fails → queue, never block the response.
- **Tag entries with session/domain metadata** so "Python the snake" can't surface for "Python the language."
- **Privacy:** retention + deletion rights on anything persisted.

## Verdict line

`layer: <shallowest that retrieves>  framework: <by shape>  retrieval: <by query>  consolidation: invalidate-not-discard.`

## Boundaries

- `filesystem-context` — file scratchpads, logs, run state before semantic retrieval is needed.
- `context-compression` — prose summaries / handoffs that preserve a session.
- `context-optimization` — JIT loading, masking, retrieval scoping inside one trajectory's budget.
- `context-degradation` — stale/conflicting memory as context poisoning.
- `bdi-mental-states` — formal belief/desire/intention modeling over RDF.
- `multi-agent-patterns` — memory shared across agents.
- `evaluation` — memory retrieval correctness and benchmark suites.
