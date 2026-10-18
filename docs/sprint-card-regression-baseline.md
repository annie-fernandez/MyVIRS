# Regression baseline for the analyzer

**Type:** Testing / quality gate · **Size:** M · **Priority:** High — every later sprint is supposed to check against this, so it blocks the value of Sprint 3 onward.

## Goal

A fixed set of passages with their expected analyzer output recorded in the repo, so any future deployment can be checked against something real rather than someone's memory of how it used to behave.

## The constraint nobody has noticed yet

**A baseline that queries the live database is not a baseline.** Admins can add, edit and delete words (`/api/admin/words`), and the seeded lists will change. If the expected output is derived from Neon at test time, the test starts failing for reasons that have nothing to do with the analyzer, and someone will "fix" it by re-recording the baseline — at which point it no longer detects anything.

So the baseline needs a **frozen word list committed next to the passages**, and the analyzer is fed that instead of the database. `analyzeText(text, lookup)` already takes the lookup as a parameter, so this needs no production code change.

## Scope

1. **Fixture passages** — a fixed, committed set, each chosen to pin a specific behavior rather than to look like realistic prose.
2. **Frozen word list** — the real category/grade data for every word those passages touch, extracted once from Neon `production` and committed as JSON.
3. **Recorded baseline** — expected `AnalysisResult` for each passage: `sentenceCount`, `fleschReadingScore`, `statistics`, and the `words` match list.
4. **A test that compares** and fails loudly on any drift.
5. **A deliberate regeneration path** — one explicit command to re-record, so updating the baseline is always a visible, reviewed diff and never an accident.

## Expected diffs against the legacy app — record these as intentional

The new analyzer deliberately differs from the Spring implementation. A naive comparison will flag all of these as regressions. They are not. Document them in the baseline file itself so the next person doesn't "fix" them:

| Behavior | Legacy | Now |
| --- | --- | --- |
| Paragraph breaks | blank line **or double space** | blank line only |
| Lookup order | singular form first | word **as written** first, then singular |
| Punctuation | not stripped before lookup | stripped, so `co-worker` matches |
| Basic Academic Words (`baw`) | silently dropped from totals | counted in statistics |
| Hyphenated duplicates | `non-essential` and `nonessential` both present | merged — 13 words folded |
| Oxford dictionary | available | removed (v1 API shut down); Wiktionary only |

## Capturing the legacy side, if the team wants a true before/after

The Spring app and its RDS instance are deleted, so this is no longer a matter of hitting a URL. It is still possible, and everything needed is saved:

- `~/Desktop/VIR-Backend-10.5-production-artifact.zip` — the artifact that ran in production (contains `VIR-Backend-6.3.8-SNAPSHOT.jar`)
- `~/virs-production-backup.sql` — the full pre-migration MySQL dump (44,047 words, 88 users)

Running it locally needs a local MySQL, an **x86_64** JDK under Rosetta (the bundled OpenCV natives abort on `aarch64`), and a short socket path for MySQL. Post each passage to `POST /api/analyzeText` and record the response.

**This is optional.** The table above already enumerates every known difference, and the frozen-word-list baseline protects against *future* drift, which is the actual point. Treat the legacy capture as a nice-to-have for the report, not a blocker.

## Done when

- `pnpm turbo run test` fails if analyzer behavior changes for any fixture passage
- The baseline does not touch Neon, the network, or the current date
- Re-recording requires one deliberate command and shows up as a reviewable diff
- The intentional-diff table above lives in the repo next to the fixtures

## Not in scope

The Flesch score and syllable counting have their own unit tests already (`packages/core/src/analyze.test.ts`). This card is about whole-passage output, not re-testing those.
