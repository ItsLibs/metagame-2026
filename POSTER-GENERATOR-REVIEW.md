# Poster generator review

Direct route: `/posters`. Public, no login, no homepage navigation link, noindex metadata. `GET /api/posters` accepts only an area selection, design, and size. It does not accept a destination URL or arbitrary tracking slug and performs no writes. Existing admin link creation and `/go` attribution behavior are unchanged.

## Airtable setup still required

The server reads only `Area / City` from MARKETING (`tblwmzJBpXq6GYsdY`) in the existing base, with pagination. Values are trimmed, deduplicated, sorted, and the three approved planning placeholders are omitted. No venues, people, record IDs, notes, or credentials are serialized to the public page. The browser receives only labels, selection values, and availability. The catalog uses a 60-second server cache with shared concurrent reads; the selected link is reread before each download.

An eligible tracking row must have:

- Source `poster`, Medium `print`, Campaign `metagame-2026`.
- Placement exactly matching the area label (case-insensitive, trimmed), or `Generic` for the generic option.
- Active checked, Template unchecked, a valid unique existing slug.
- Destination `https://metagame.games/` or `https://metagame.games/#tickets`, without other query parameters.

One matching row per area is required. Duplicate matches or duplicate slugs fail closed. The existing `/go/{slug}` mechanism supplies all UTMs, including the area's Placement and the reusable Slug. There is no per-person, venue, design, paper-size, or download attribution.

Research verified 35 named areas and only Berkeley's matching row (`recW2dLVFSsIrLxaN`, slug `berkeley`). Generic and the other 34 named areas need authorized creation in the existing private admin workflow or Airtable before their downloads become available. Their labels remain visible as coming soon. The generator invents no slugs and creates no records. Once approved rows exist, the catalog picks them up without a code change. Preserve Mox, Lighthaven, carina, spire, and all unrelated links.

Areas needing rows: Alameda, Campbell, Concord, Corte Madera, Danville, Dublin, El Cerrito, Emeryville, Fremont, Hayward, Lafayette, Larkspur, Livermore, Menlo Park, Mill Valley, Milpitas, Mountain View, Novato, Oakland, Orinda, Palo Alto, Pleasant Hill, Pleasanton, Redwood City, Richmond, San Bruno, San Francisco, San Jose, San Mateo, San Rafael, Santa Clara, Sausalito, Stanford, Sunnyvale. Also create one approved Generic row. No proposed slug names are treated as verified mappings.

Excluded labels: Bay Area — venue TBD; Bay Area — individual stores TBD; East Bay — venue TBD. Generic covers these after setup.

## Verification

The four rendered Berkeley PDFs decode to `https://metagame.games/go/berkeley`. Live read-only verification on 2026-10-22 returned HTTP 302 with Location `https://metagame.games/?utm_source=poster&utm_medium=print&utm_campaign=metagame-2026&utm_content=berkeley&utm_term=berkeley`.

Tests cover full redirect UTMs and last-touch replacement, including the missing-slug homepage fallback, unavailable/changed links, invalid requests, provider-error privacy, area filtering, pagination, concurrent reads, duplicate links, exact PDF dimensions, scanning, duplicate-code detection, and print margins. See `assets/posters/README.md` for source provenance, print limitations, and rendering instructions.

No deployment, push, merge, Airtable write, or public publishing is part of this change. The new route becomes public only when a reviewer explicitly approves deployment. Local verification does not require copying production credentials; a fixture-based UI check is distinct from the live Berkeley redirect check.

Local results (2026-10-22): the default production build (`next build`, Turbopack) passed, including TypeScript and all 50 static pages. The `/api/posters` deployment trace includes all three source PDFs. All 255 tests across 37 files passed. ESLint had zero errors and one existing Scrabble hook warning. All changed code and documentation passed Prettier; repository-wide formatting flags 518 existing files. Browser checks at desktop and 390px mobile verified 35 areas plus Generic, no login, a successful Berkeley PDF download, unavailable Generic disabled, no horizontal overflow, and noindex. The browser test used a local, read-only Airtable fixture, not production credentials.

The Windows environment required a fixed writable TEMP directory for Vitest workers. The existing ERD build script calls an unavailable bare `pnpm` executable; generating the same ignored ERD output directly with the installed Liam CLI allowed Next type generation. An optional webpack production-build attempt failed in the shared root layout's Next Google-font loader (`Cannot read properties of null (reading '1')`), but the repository's default Turbopack build subsequently passed. No font, ERD, unrelated formatting, or application-wide changes were included to work around these checks.
