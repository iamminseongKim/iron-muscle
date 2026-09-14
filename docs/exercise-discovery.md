# Exercise discovery data audit — 3.23.0

## Policy

Representative exercises are editorial browsing choices, not measured global popularity. The picker initially shows these, exercises with completed sets in saved history, and custom exercises. All entries remain available through search and the full-list switch. No ID, saved session or brand assignment is changed.

Search order: exact names/aliases in any supported language, phrase matches, token/initial-consonant matches, then body-part/equipment context. Within each relevance tier: recorded recency, number of recorded sessions, representative status, reviewed duplicate penalty, stable editorial/ID ordering. A niche exact match beats a familiar partial match. Explicit category/equipment filters remain hard constraints; the automatic daily-target filter alone permits global text search.

`src/data/exerciseDiscovery.ts` stores the curated list, aliases and reviewed duplicate pairs separately from exercise identity. Duplicate pairs affect ordering only. No heuristic bulk merging is performed. Existing machine-specific variants remain available.

## Candidate audit and sources

Checked 2026-09-14. Sources establish exercise identity/technique, not population-wide usage frequency. Descriptions are newly written; remote media is not copied.

| Candidate | Decision | Source |
| --- | --- | --- |
| Dumbbell Romanian deadlift | Add `dumbbell-romanian-deadlift`; existing dumbbell stiff-leg and single-leg entries are distinct | [NASM](https://www.nasm.org/resource-center/exercise-library/dumbbell-romanian-deadlift) |
| Smith Romanian deadlift | Add `smith-romanian-deadlift`; preserve existing Smith stiff-leg entry | [REP Fitness](https://repfitness.com/blogs/guides/smith-machine-deadlift) |
| Seated cable fly | Add `seated-cable-fly`; seated supported setup differs from existing standing/incline fly entries | [PureGym](https://www.puregym.com/exercises/chest/chest-fly/seated-cable-fly/) |
| Pallof press | Already present; use existing ID | [Technique paper](https://repository.mdx.ac.uk/download/6f5fd7d2adfe4a20dc7f2356f64149445d9c19598d879847003cd94c6cc578ed/1307933/Pallof%20Press%20%28SCJ%29.pdf) |
| Reverse pec deck, seated leg curl, Bayesian curl, hip thrust, pendulum squat | Already present; improve discovery rather than add duplicates | Existing catalog inspection |
| Dead bug | Correct duplicate Korean wording and move from fullbody to core; retain ID and old-name alias; review all language mappings | [ACE](https://www.acefitness.org/resources/everyone/exercise-library/147/supine-dead-bug/) |
| EZ-bar skullcrusher | Move from fullbody to arms; existing triceps target and translated ID entries retained | Existing catalog's instructions and primary muscle |

## Limits and maintenance

This is a first curated pass, not a complete clinical/content review of the imported catalog. Sources do not justify an overall “popular” score. No search queries or workout data are transmitted. Existing local records provide personalization. Fuzzy spelling correction, telemetry and automatic duplicate merging are not introduced.

For future additions, check all languages, aliases, equipment and setup before issuing a new ID. Add language entries in all eight packs. Preserve legacy identity. Add a search expectation to `scripts/test-exercise-discovery.mjs` when adding an alias or changing ranking. Evaluate exact queries, broad queries, foreign-language queries, rare queries and first-use/no-history behavior separately.
