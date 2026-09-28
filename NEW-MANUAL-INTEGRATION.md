# New manual catalogue integration

## Result

Six prepared manuals are integrated into the shared web/API catalogue and the separate mobile catalogue. Hino is supported as a document system. All existing catalogue records and IDs are unchanged. No PDFs or remote storage were modified.

| Catalogue | Before | After | Added |
|---|---:|---:|---:|
| Shared web/API | 67 | 73 | 6 |
| Mobile | 13 | 19 | 6 |

Before/after runtime snapshots were compared: every original record, including all of its metadata and array position, is unchanged in both catalogues. The existing `kobelco-cke1800-ck2000-service` and `kobelco-ck2500ii-cke2500ii-service` records remain intact.

## Exact authored files

Paths are relative to `C:\Users\zache\Documents\CraneHub`.

| File | Change |
|---|---|
| `artifacts/api-server/src/lib/catalog/newManuals.ts` | New shared six-record batch, using the approved titles, summaries, applicability, dates, prepared filenames and page counts. Includes document numbers and sections. |
| `artifacts/api-server/src/lib/catalog/techDocs.ts` | Adds Hino to the system type/list/colour/icon maps. Preserves the existing array as `EXISTING_TECH_DOCS` and appends the six shared records to `TECH_DOCS`. |
| `artifacts/ltc-mobile/data/techDocs.ts` | Imports the same six records; preserves the existing mobile array. Adds Hino and Kobelco type/list/colour/icon support, since neither was previously present in mobile. |
| `artifacts/ltc-mobile/app/(tabs)/maintenance.tsx` | Adds the missing React Native `Alert` import used by an existing call. This one-line correction resolves a pre-existing mobile typecheck failure found during validation. |
| `artifacts/web/src/data/newManuals.test.ts` | Five regression tests covering both catalogues, system support, scope, all requested search terms, uniqueness and document URLs. |
| `NEW-MANUAL-INTEGRATION.md` | This report. |

No package manifest, lockfile, database source, migration, original analysis report or PDF-preparation report was edited in this stage. Builds also regenerated normal ignored build/typecheck artifacts. Pre-existing unrelated working-tree changes are listed separately in Git status below.

## New record IDs and next-stage upload filenames

All six PDFs remain in `C:\Users\zache\Documents\CraneHub\manual-imports-ready-new`. `fileName`, `cleanFile` and `preparedFilename` use these exact names. These are the six files requiring Backblaze upload in the next stage; no upload occurred here.

| ID | Exact filename | Pages | Year |
|---|---|---:|---:|
| `import-kobelco-cke1800-1f-operation-c671aead` | `Kobelco_CKE1800-1F_Operation-Maintenance_S2JC21001ZE28_2022.pdf` | 512 | 2022 |
| `import-kobelco-cke1800-1f-parts-eaf490a7` | `Kobelco_CKE1800-1F_Parts-Manual_S3JC10003ZO21_2023.pdf` | 1540 | 2023 |
| `import-kobelco-cks2500-operation-1a195a49` | `Kobelco_CKS2500_Operation-Maintenance_S2JD04201ZE71_2023.pdf` | 920 | 2023 |
| `import-kobelco-cks2500-parts-2dde6fd5` | `Kobelco_CKS2500_Parts-Manual_S3JD04201ZO18_2023.pdf` | 1816 | 2023 |
| `import-hino-j08e-p11c-handbook-6b0c4630` | `Hino_J08E-P11C_Engine-Handbook_Z4-011E_2011.pdf` | 78 | 2011 |
| `import-hino-p11cvh-ksfc-parts-153c4285` | `Hino_P11CVH-KSFC_Engine-Parts_477290-K25_S2GN45002ZE28_2023.pdf` | 108 | 2023 |

IDs follow the existing `import-<manufacturer/model/purpose>-<hash prefix>` convention and use the final prepared PDF SHA-256 prefixes.

The Hino handbook retains **2011** as its technical publication year. Its subtitle and summary retain the June 2023 Kobelco wrapper date separately. Its `appliesTo` and `craneTypes` arrays remain empty. The engine parts catalogue retains all six explicitly listed applications, with only the existing `cr-cks2500` fleet ID linked. The CKE1800-1F manuals are not mapped to the different CKS1800 fleet entry.

## Hino system, filters and URL architecture

- Shared and mobile `DocSystem` unions accept `Hino`.
- Their `DOC_SYSTEMS` arrays include Hino, with colour `#C62828` and display abbreviation `HI`.
- Mobile also gains Kobelco with the shared colour `#0067B1` and abbreviation `KB` so it can display the four new Kobelco records.
- Existing system labels, colours and icons are unchanged. The web library derives system filters from document data; mobile uses `DOC_SYSTEMS`. Both therefore include Hino without introducing a separate filter implementation.
- No database enum or migration is required: these are static catalogue records and TypeScript/display definitions.
- Existing `docUrl()` functions are unchanged. Web/API URLs remain `/api/docs/${encodeURIComponent(cleanFile)}`. Mobile retains its optional `https://${EXPO_PUBLIC_DOMAIN}` prefix and the same authenticated document path.
- URL tests confirm construction through the existing mechanism, not live availability of the new objects. The new files have not yet been uploaded, so this stage does not claim successful remote PDF downloads.

## Search

No search ranking, normalization or filter algorithm was changed. Existing web search already indexes titles, subtitles, document numbers, manufacturer, system, models, summaries and sections. The mobile search's existing title/subtitle/system/model fields also contain the requested identifiers.

Regression tests exercise every requested term against the integrated shared catalogue and assert the appropriate new record is returned:

| Terms | Expected new records |
|---|---|
| `CKE1800`, `CKE1800-1F` | Both CKE1800-1F manuals |
| `CKS2500` | Both CKS2500 manuals and the Hino engine parts catalogue |
| `Hino`, `P11C` | Both Hino records |
| `P11CVH`, `P11CVH-KSFC`, `477290` | Hino engine parts catalogue |
| `S2JC21001ZE28` | CKE1800-1F operation manual |
| `S3JC10003ZO21` | CKE1800-1F parts manual |
| `S2JD04201ZE71` | CKS2500 operation manual |
| `S3JD04201ZO18` | CKS2500 parts manual |
| `Z4-011E` | Hino handbook |
| `S2GN45002ZE28` | Both Hino records |

## Validation results

| Validation | Result |
|---|---|
| Shared catalogue baseline comparison | PASS: 67 original records unchanged; exactly six added |
| Mobile catalogue baseline comparison | PASS: 13 original records unchanged; exactly six added |
| New catalogue/search regression tests | PASS: all five new tests |
| All web data/lib tests plus scripts tests | PASS: 25 tests, zero failures/skips |
| API package test suite | PASS: 48 passed, two database-dependent tests skipped, zero failures |
| Library TypeScript build (`typecheck:libs`) | PASS |
| Web TypeScript check | PASS |
| API TypeScript check | PASS |
| Mobile TypeScript check | PASS after adding the missing `Alert` import |
| Scripts TypeScript check | PASS |
| Broader root `pnpm run typecheck` | FAIL in unrelated `artifacts/mockup-sandbox` React type conflicts; details below |
| Production web build | PASS, with sourcemap/chunk-size warnings |
| API build | PASS |
| `git diff --check` | PASS, exit code 0; only line-ending conversion notices |
| PDF preservation | PASS: all six prepared PDFs and all ten batch source PDFs still match the SHA-256 values in `NEW-MANUAL-PDF-PREP.md` |

Commands executed:

```powershell
pnpm run typecheck
pnpm --filter @workspace/ltc-mobile typecheck
pnpm --filter @workspace/scripts typecheck
node artifacts/api-server/node_modules/tsx/dist/cli.mjs --test artifacts/web/src/data/*.test.ts artifacts/web/src/lib/*.test.ts scripts/src/*.test.ts
pnpm --filter @workspace/api-server test
$env:BASE_PATH='/'; $env:PORT='3000'; pnpm --filter @workspace/web build
pnpm --filter @workspace/api-server build
git diff --check
```

The broader root typecheck runs the library build and package checks; web and API reported successful completion. Mobile and scripts were additionally run separately after the unrelated mockup failure stopped the recursive command. There is no root test script; the existing API test command and all discovered web/scripts test files were run.

## Warnings and limits

1. **Broader typecheck remains red outside the changed feature:** `artifacts/mockup-sandbox/src/components/ui/calendar.tsx:132` and `spinner.tsx:7` fail TS2322 due to incompatible React `Ref` types from different installed React type definitions. These files and dependencies were not changed. The requested web, API and mobile checks pass.
2. **Two API database-dependent tests skipped:** database migration/concurrency and isolated database workflow tests were not exercised. No database or migration was modified.
3. **Existing mobile filename reuse preserved:** two legacy clutch records already share a PDF filename/cleanFile. Tests confirm all six new IDs and filenames are unique and introduce no collision, rather than deleting or renaming legacy records to force global filename uniqueness. Shared catalogue filenames remain unique.
4. **Build warnings:** Vite reported sourcemap-location warnings in tooltip/sheet/select/label UI modules, plus a minified JavaScript chunk above 500 kB (633.51 kB). Build completed successfully.
5. **Windows tooling:** the sandboxed TypeScript runner failed while querying Windows account information (`uv_os_get_passwd`). Approved local validation runs outside the sandbox succeeded. No tool approval was rejected.
6. **Upload remains pending:** catalogue records and route paths are ready, but availability of the six new PDFs through Backblaze is outside this stage.

## Scope confirmation

- No source or prepared PDFs were modified, deleted or moved.
- No Backblaze upload or remote-object verification occurred.
- No database files or migrations were authored or edited.
- No Git staging, commit, push, merge or PR creation occurred.
- Pre-existing unrelated changes were preserved.

## Git status

Working-tree status at completion; ` M` is unstaged and `??` is untracked. No changes are staged. Entries outside the six authored files listed above were already present before this code stage.

```text
 M .gitignore
 M artifacts/api-server/src/lib/catalog/techDocs.ts
 M artifacts/ltc-mobile/app/(tabs)/maintenance.tsx
 M artifacts/ltc-mobile/data/techDocs.ts
 M package.json
 M pnpm-lock.yaml
 M scripts/package.json
 M scripts/tsconfig.json
?? NEW-MANUAL-ANALYSIS.md
?? NEW-MANUAL-INTEGRATION.md
?? NEW-MANUAL-PDF-PREP.md
?? artifacts/api-server/src/lib/catalog/newManuals.ts
?? artifacts/web/src/data/newManuals.test.ts
?? imported-files-ready/
?? manual-imports-ready-new/
?? manual-imports-ready/
?? scribd-manuals.txt
?? scripts/SCRIBD-DOWNLOADER.md
?? scripts/src/scribd-downloader.ts
?? scripts/src/scribd-url.test.ts
?? scripts/src/scribd-url.ts
```
