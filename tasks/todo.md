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
- [ ] Merge upstream bug/doc/Claude improvements into private `main`.
- [ ] Resolve direct conflicts by keeping the requested fork additions plus upstream fixes.
- [ ] Run the repo's smallest meaningful checks.
- [ ] Verify private-only remote state, SHA parity, and no public upstream connection.

## Review

Pending.
