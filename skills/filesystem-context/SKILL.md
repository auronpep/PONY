---
name: filesystem-context
license: MIT
description: >
  Use the filesystem as the overflow layer for agent context — durable
  scratchpads, tool-output offloading, just-in-time discovery, sub-agent
  handoff files, filesystem memory, scratch cleanup. Load context on demand
  instead of stuffing the window. Use when the user says "offload tool output",
  "scratchpad", "persist agent state", "just-in-time context", "sub-agent
  handoff file", "dynamic skill loading", "filesystem memory", or invokes
  /filesystem-context.
---

Context engineering is ponytail for tokens. The window is a finite attention
budget, not storage — every token loaded crowds out the ones the task needs.
"Don't write code you don't need" becomes "don't load context you don't need."
The filesystem is the overflow: write bulk to disk, keep a pointer in context,
pull the rest only when it earns its place. Static inclusion is the bloat;
just-in-time discovery is the lazy path.

## Four failure modes → file remedy

| Mode | Symptom | Fix |
|---|---|---|
| Missing | needed info never captured | persist tool outputs + intermediates to files |
| Under-retrieved | loaded content misses the point | structure for targeted grep (headers, schema) |
| Over-retrieved | loaded far more than needed | offload bulk, return a compact reference |
| Buried | niche info scattered across files | glob + grep for structure, semantic for concepts |

## Patterns

- **Scratchpad offload.** Tool output over ~2000 tokens (≈8000 chars; 1 token ≈ 4 chars) → write to `scratch/<tool>_<ts>.txt`, return `[saved to <path>. summary: <~100 tok>]`. Agent greps the file or reads line ranges for detail. ~100 tokens stay hot; the full dump stays on disk.
- **Plan persistence.** Long-horizon plans fall out of attention. Write to `scratch/plan.yaml` (objective + steps with status). Re-read at each turn — attention through recitation.
- **Sub-agent handoff.** Message chains lose fidelity at every hop (telephone). Each agent writes its own `workspace/agents/<id>/findings.md`; coordinator reads files direct, full fidelity.
- **Dynamic skill loading.** Static context lists names + one-liners only; load the full `skills/<name>/SKILL.md` when the task hits it. Turns O(n) static cost into O(1) per task.
- **Terminal/log persistence.** Pipe long output to `terminals/<n>.txt`; query with `grep -A5 "error"` instead of loading the whole history.
- **Self-modification (experimental).** Agent writes learned prefs to its own `agent/preferences.yaml`, loaded next session. Guard with validation + periodic review — drift accumulates.

## Search ladder

`ls` (structure) → `glob` (files by pattern, scoped — never `**/*`) → `grep`
(contents + context) → `read_file` with line ranges (never whole large files).
Filesystem search for exact/structural; semantic for conceptual; combine.

## Use it / skip it

| Use | Skip |
|---|---|
| tool output > ~2000 tokens | single-turn task (overhead unpaid) |
| task spans multiple turns | context fits comfortably |
| agents share state | latency-critical path |
| skills/logs need selective query | no filesystem tools |

## Lazy is not negligent

Never skip these even at full lazy:
- **Check size before read** — a blind read can dump 100K+ tokens in one call.
- **Guard every cached path** — verify existence; re-glob on miss. Files move.
- **Cleanup scratch** — age- or count-based retention at session boundaries, or the dir grows unbounded and listings turn to noise.
- **Isolate per-agent dirs** (or append-only with agent prefix) — concurrent writes corrupt state silently.
- **Schema from the first write** — unstructured scratchpads drift unparseable; relative paths only, never hardcoded absolutes.
- **Keep raw evidence next to its run** — `runs/<id>/sources/`, not repo root; root dumps lose provenance.

## Verdict

Measure or you're guessing: static ratio < 20%, offload savings > 50% on
tool-heavy work, retrieval precision > 70%. If files fit the window and the task
ends this turn, skip the I/O — the leanest context is the one you didn't write.

## Boundaries

- `memory-systems`: semantic / entity / temporal retrieval when file notes stop scaling — invalidate, don't discard.
- `context-compression`: summarization + handoff wording; file refs anchor the omitted detail.
- `context-optimization`: token tactics that need no file backing; offload is one implementation of observation masking.
- `multi-agent-patterns`: topology + protocol; this owns the shared file workspaces.
- `tool-design`: tools should return file references for big outputs.

**Override:** "stop ponytail" / "normal mode" → revert to verbose filesystem-context guidance.
