# PONY Private Repo Bootstrap

## Plan

- [x] Record local workspace state and source repository identity.
- [x] Import `robertbarclayy/NWBZPWNR` into `C:\GHL\PONY` without leaving a public upstream remote or tracking branch.
- [x] Verify local git state, source SHA, no upstream/update connection, and staged hygiene.
- [x] Create `auronpep/PONY` as a private GitHub repository and verify privacy before pushing.
- [x] Push the imported `main` branch to the private repo.
- [x] Add `erewhonsgroup`, `votewood`, and `JWoodMedia` as admin collaborators.
- [x] Verify final remote, SHA parity, active collaborators, pending invitations, and no public-source remote.

## Review

Completed 2026-06-17.

- Source imported from public `robertbarclayy/NWBZPWNR` `main` at `4b39318bd56b13aef9aa79dbdd62749ca1b8dae9`.
- Temporary public `source` remote was removed before any GitHub write; no public-source remote or branch tracking remains.
- Private target created as `auronpep/PONY`: `PRIVATE`, `isPrivate=true`, `isFork=false`, `parent=null`.
- Local `origin` points only to `https://github.com/auronpep/PONY.git`.
- Initial private push verified local `HEAD` matched private `origin/main` at `5bd406fcb89522839544acb31cc0d4f51b897f7a`.
- Admin collaborator invitations are pending for `erewhonsgroup`, `VoteWood` (canonical casing for requested `votewood`), and `JWoodMedia`.

# Ponytail Latest Merge

## Plan

- [x] Refresh `DietrichGebert/ponytail` `main` into a temporary ref without adding a remote.
- [x] Identify the fork-only additions to preserve, especially the added skill and third workflow step.
- [x] Merge upstream bug/doc/Claude improvements into private `main`.
- [x] Resolve direct conflicts by keeping the requested fork additions plus upstream fixes.
- [x] Run the repo's smallest meaningful checks.
- [x] Verify private-only remote state, SHA parity, and no public upstream connection.

## Review

Merged `DietrichGebert/ponytail` `main` at `45f7d2f83fb430a65fd512a98ad7b14d79e06636`.

- Preserved fork-only skills: `ponytail-skill`, `ponytail-claude-md`, `ponytail-critique`, and the context-engineering skill pack.
- Preserved the native-platform third ladder step in `AGENTS.md`, `skills/ponytail/SKILL.md`, and the README docs.
- Brought in upstream bug/doc/platform additions including Claude/Codex hook hardening, Copilot CLI/plugin files, Gemini/Antigravity support, OpenClaw skills, correctness/behavior tests, updated examples, and benchmark fixes.
- Resolved the only direct conflict in `README.md`.
- Removed stale tracked artifacts `assets/logo.jpeg` and `skills/.DS_Store`; README now uses upstream `logo.png` plus `logo-dark.png`.
- Verification passed: `npm test`, `node scripts/check-rule-copies.js`, and `git diff --cached --check`.
- Pushed to private `origin/main` and verified local/remote SHA parity at `8a15089925e5661150e9e292e461afc1c2d0c676` before this task-log closeout.
- Deleted temporary `refs/tmp/ponytail-latest`; local git remotes still contain only private `origin`.
