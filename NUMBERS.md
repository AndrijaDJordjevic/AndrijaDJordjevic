# How the stats card is derived

Every figure on `assets/stats-*.svg` was cross-verified against the GitHub API
before being committed. This file records the derivation, and — just as
importantly — the figures that were **rejected** as misleading.

Regenerate the card after updating the numbers in `scripts/gen-stats-card.js`:

```bash
node scripts/gen-stats-card.js
```

## Published figures

| Figure | Value | How it is derived |
|---|---|---|
| Contributions since 2023 | 2,513 | Sum of `contributionCalendar.totalContributions` over GraphQL `contributionsCollection` for every year in `contributionYears`, **minus** the 2021-10-04 entry, which is the "joined GitHub" marker and not a contribution. Composition reconciles exactly: 2,490 restricted (private) + 19 public commits + 4 repo creations. |
| Commits authored | 2,038 | `/repos/{owner}/{repo}/contributors` filtered on `.login`, summed over every reachable repo. Independently confirmed by `/repos/{owner}/{repo}/commits?author=`, which returns the same 2,038, and by `search/commits?q=author:` at 2,040 (within 2). |
| Pull requests opened | 295 | GraphQL `viewer.pullRequests.totalCount`. The search API reports 290; the gap is search-index lag, and GraphQL is authoritative. |
| Issues opened | 106 | GraphQL `viewer.issues.totalCount`. |
| Repositories active in | 13 | Count of repos with at least one commit attributed to this account. |
| Languages | ordinal only | Byte totals from `/repos/{owner}/{repo}/languages`, restricted to the 13 repos with commits and excluding one repo whose bytes are 97% vendored third-party drops. |

## Rejected figures, and why

- **"37 repositories"** — not a total. `GET /user/repos?affiliation=organization_member`
  returns HTTP 200 while silently dropping every repo from the two SAML-enforced
  Epitech organizations, announcing it only in a response header:
  `X-Github-SSO: partial-results; organizations=88095701,216019017`.
  37 is a floor, so the card says "37+".

- **Language percentages** — GitHub's Linguist counts every byte on a default
  branch regardless of who wrote it, so any percentage credits teammates' and
  vendored code as if it were mine. Naive byte-share over all reachable repos
  gives "HTML 44%, C++ 34%" — but 97.6% of that HTML is a bundled Apache Ant
  manual and 95.9% of that C++ is a vendored Teamcenter SDK, in a repo holding 42
  of my 2,038 commits. Only the **ordering** survives, so only the ordering is shown.

- **"Repos by primary language"** — 13 of the 16 Python repos in the reachable set
  have zero commits from this account; 24 of 37 reachable repos do. Counting
  repos one merely has read access to is not a skills claim.

- **2,509 as a commit count** — that is `totalCommitContributions +
  restrictedContributionsCount`, and the restricted bucket lumps in private PRs,
  issues, reviews and repo creations. It overstates commits by roughly 471.

- **Public-only hosted stat cards** — third-party rendering services query with
  *their* token, not mine, so they are capped to public data. They were reporting
  "Haskell, C++, C" and "4 Public Repos" — my four public school projects — while
  hiding everything else.

## Caveats that apply to the published numbers

- The contribution graph is derived from repositories that **still exist**.
  Contributions to deleted or transferred repos drop out retroactively, so 2,513
  is a snapshot, not a lifetime total.
- 2026 is a partial year, so the total keeps climbing. The card carries its
  measurement date.
- Commit counts cover default branches only; squash and rebase merges collapse
  several commits into one.
