---
name: hosted-agents
license: MIT
description: >
  Design hosted / background agent infrastructure the lazy way: remote
  sandboxes, warm pools, image registries, session snapshots, per-session
  state, multiplayer, self-spawning, multi-client surfaces (Slack / Web /
  Chrome). Use when the user says "background agent", "hosted agent",
  "remote sandbox", "Modal sandbox", "warm pool", "session snapshot",
  "multiplayer agent", "spawn sub-agents", or invokes /hosted-agents.
---

Context engineering is ponytail for tokens; hosted-agent design is ponytail for
latency. The user's clock is a finite attention budget — only model
time-to-first-token earns a place on the critical path. Every clone, install,
build, and cache must already be paid before the prompt lands. If setup is
visible to the user, you loaded context you didn't need.

## The one law

Session speed is bounded by provider TTFT, nothing else. Push all setup to
build-time (invisible) or pre-warm (overlapped with typing). Anything that runs
after Enter and isn't the model is a leak.

## Three layers, scaled independently

| Layer | Owns | Keep separate so |
|---|---|---|
| Sandbox | isolated execution, image, snapshot | image churn never touches clients |
| API | per-session state, auth, streaming, PR creation | sensitive ops stay off the sandbox |
| Clients | Slack / Web / Chrome surfaces | one backend, thin wrappers, no dup logic |

## Latency moves (do all of them)

- **Image registry** — rebuild every ~30 min: repo at known commit + deps installed + build done + caches warmed (ran app & tests once). Session start = fast git delta, not full clone.
- **Predictive warm-up** — the standout move: start warming on first *keystroke*, not on submit. The 5-30s typing window covers most setup; sandbox is often ready before Enter.
- **Read-before-sync** — let the agent read/research immediately; block *writes* only until git sync finishes. 30-min read staleness rarely matters; incoming prompts rarely touch just-changed files.
- **Snapshot/restore** — snapshot after build (base), after changes (session), before exit. Follow-ups restore instead of re-setup.
- **Warm pool** — keep N ready per hot repo; autoscale by traffic/time-of-day, don't fix the size; expire at ~25 min (before next image build).

## Fixed substrate

- **State**: one SQLite per session (Durable Object works). No shared mutable state — cross-session interference is silent and brutal to debug.
- **Streaming**: WebSocket + hibernation API. Stream tokens, tool status, file changes. Sync all surfaces off one state so users switch clients mid-session.
- **Auth**: app token (short-lived: 1h, scoped `contents`+`pull_requests` write) for clone; *user* token for the PR. Commits attributed to the prompting human, not the bot — preserves audit trail, blocks self-approval. Sandbox pushes; API opens the PR.
- **Self-spawning**: expose three primitives — start session, read any session's status, continue while sub-sessions run. Prompt the agent to spawn for cross-repo research / splitting a monolith into smaller PRs, not inline.
- **Multiplayer**: free if sessions aren't tied to one author from day one. Pass authorship per prompt; attribute changes to the prompter.
- **Chrome client**: extract DOM/React-fiber internals, not screenshots — higher precision, lower token cost.

## Lazy is not negligent — never skip

- **Snapshot + extract before teardown** — branch/PR/files/logs out *before* the sandbox dies, or completed work vanishes on recycle.
- **Sandbox limits** — hard caps: ~4h runtime, per-session cost ceiling, idle teardown, network allowlist (github/registries only), resource bounds (~4GB / 2 cores). Uncapped agents run up cost silently.
- **Git identity per sandbox** — set `user.name`/`user.email` explicitly every time; never assume it carries from the image, or commits fail.
- **Token refresh** — check validity before PR creation; long tasks outlive a 1h token.
- A stop control mid-execution and an interrupt-safe message queue — without them users feel trapped.

## Metrics that aren't vanity

Merged PRs (primary), TTFT, PR approval rate / revision count, agent-written-code %. Adoption via visibility (work in public Slack channels), never mandate.

## Verdict

Setup invisible + reads early + writes gated + state isolated + user-authored PRs + extract-before-death = a session that feels instant and loses nothing. Miss any and it leaks.

## Boundaries

- Autonomous loop, novelty gates, rollback, merge/approval policy → `harness-engineering`.
- Supervisor / swarm / handoff topology without hosting concerns → `multi-agent-patterns`.
- The spawn/status/PR tool contracts themselves → `tool-design`.
- File-backed state *inside* a session → `filesystem-context`.
- Context budget across distributed sessions → `context-optimization`.
- "stop ponytail" / "normal mode" → revert to verbose hosted-agent guidance.
