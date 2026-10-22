# Poster sources and print verification

Original artwork retrieved through the authorized Google Drive connection on 2026-10-22. These files are server assets, not public downloads. `poster-pdf.ts` pins their SHA-256 hashes and geometry; replacing an asset requires remeasuring its QR region and repeating render verification.

| File                                | Drive file ID                     | Page size (points) | Embedded image |
| ----------------------------------- | --------------------------------- | ------------------ | -------------- |
| poster_d20_lettersize.pdf           | 1qcVfFgBFHq6pA_CjFn9c9j4Usx_ObeMY | 612 × 792          | 1632 × 2112    |
| poster_d20_13x19.pdf                | 1fwl0bHb1E-WOssxIy3BUW0xvDINhGoUC | 936 × 1368         | 2496 × 3648    |
| poster_next_move_find_people_v2.pdf | 1X4YYhf3JvNTfCwCqDcUrz4_IJDK6gVvd | 792 × 445.7368     | 1672 × 941     |

Both original D20 codes decode to `https://metagame.games/go/mox-post`. The chess code decodes to `https://metagame.games/?utm_source=poster&utm_medium=qr&utm_campaign=metagame-2026&utm_content=next-move-find-people-v2#tickets`. Neither is repurposed as the generic mapping.

The generator masks the old code inside its existing white background and paints a vector QR with a four-module quiet zone. The original rounded D20 background, artwork, and existing non-tracking domain text remain. No new readable tracking URL is printed. The full original page is embedded proportionally without cropping, within a minimum 18-point (quarter-inch) margin. D20 is portrait, chess is landscape, as approved.

The original artwork is raster. No resampling is introduced. Effective D20 resolution is about 204 dpi on Letter and 200 dpi on 13×19; chess is about 159 dpi on landscape Letter and 90 dpi on landscape 13×19. The new QR remains vector at every size. A higher-resolution chess source would improve the large print; this implementation does not fabricate detail or redesign it.

Run the regular tests with `pnpm test`. With Poppler's `pdftoppm` on PATH, run `POSTER_RENDER_CHECK=1 pnpm exec vitest run src/lib/poster-pdf.test.ts` (PowerShell: set `$env:POSTER_RENDER_CHECK='1'` first). The render check writes review PDFs and PNGs under ignored `tmp/poster-verification/`, checks exact page dimensions, decodes the new code, checks for a second surviving QR, and checks the white print margins. Visually inspect all four PNGs as well. Tests use the verified Berkeley slug; they do not create or change tracking records.
