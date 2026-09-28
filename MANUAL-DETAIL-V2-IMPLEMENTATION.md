# Manual Detail V2 implementation

## 1. Existing behaviour found

The web Manuals page previously used a query-string-selected Sheet at `/docs?document=<id>`. Search, fleet and bookmark surfaces linked to that Sheet or opened the protected PDF directly. Mobile used a local selected-document state and a partial detail screen. PDF access goes through the existing `/api/docs/<cleanFile>` mechanism; no Backblaze credentials are exposed. Successful PDF GETs are what the API records as `manual_opened`, with five-minute server deduplication. Private bookmarks are server-backed on web and validate document/section/page references. Workshop notes accept `documentId`, `documentTitle` and `pageReference` through the existing authenticated notes API. Fleet associations are represented by `appliesTo` IDs and `craneTypes`.

## 2. Manual Detail V2 architecture and route

The stable route is `/docs?document=<manualId>`, with optional `from`, `section` and validated positive `page` parameters. The ID is always the catalogue ID; filenames are never used as route identity. Unknown IDs render a Manual not found state. Existing `/docs?document=...` links remain valid. Web uses `pages/manual-detail.tsx`; mobile uses `components/ManualDetail.tsx` with Expo route parameters and a touch-friendly Back action.

The detail view shows title, manufacturer/system, type, models, document/book code, year, pages, source/revision where present, explicit fleet links, summary, sections, protected Open PDF, bookmark, workshop-note, section bookmark and related-manual actions. Opening the detail view does not record activity; clicking Open PDF records through the existing server route exactly once under its current deduplication rules.

## 3. Related-manual logic

`api-server/src/lib/catalog/manualDetail.ts` provides shared helpers. Related records are scored only from structured relationships: shared `appliesTo` fleet ID first, then exact normalized explicit crane model, with a small same-system tie preference. The current document is excluded and results are limited to six. Generic manufacturer/system text and similar number fragments do not create a relationship. Therefore CKS2500 operation relates to its parts manual and the explicitly CKS2500-applicable Hino P11CVH-KSFC parts catalogue, while the generic Hino J08E/P11C handbook is not treated as CKS2500-only. CKE1800 is not associated with CKS1800 by numeric similarity.

## 4. Bookmark and workshop-note integration

Whole-document and section/page bookmarks remain separate. The detail page lists only bookmarks belonging to the current manual, and labels section/page references without inventing them. BookmarkButton continues to use the existing authenticated private bookmark provider and refresh/remove behavior. Add workshop note links to `/notes?document=<id>` and carry section/page context when launched from a section. The notes page pre-fills the existing document ID/title and page reference fields; ownership and validation are unchanged.

## 5. Recently opened and bookmarked shortcuts

Web Manuals now shows Recently opened and Bookmarked manuals above the manufacturer hierarchy only when data exists and only when the query/filter state is the root browse state. Recent events come from the existing authenticated `/api/activity` feed, are sorted newest-first, deduplicated by manual ID, limited to six and filtered against the current catalogue. Only `manual_opened` document events count. Missing/deleted IDs disappear. Whole-document bookmarks are resolved through the existing private bookmark feed, exclude section/page-only rows, deduplicate by manual and are limited to six. Each compact shortcut opens Manual Detail V2. “View all bookmarks” remains available. Mobile uses the existing device-local manual storage introduced by Manual Library V2 for recent IDs/bookmarks, resolves current catalogue IDs, deduplicates and limits display, and keeps the same detail route semantics.

## 6. Web changes

- Added the shared detail/recent/bookmark/relationship helpers.
- Added the web Manual Detail page and compact shortcut component.
- Changed web Manuals, search results, bookmarks, fleet manual links, maintenance manual links and dashboard/library links to open detail first.
- Preserved protected PDF opening from the detail page and existing bookmark/activity semantics.
- Preserved Manual Library V2 search, hierarchy, filters, document IDs and URLs.

## 7. Mobile changes

- Replaced the partial Docs detail state with the full ManualDetail component.
- Added metadata, related manuals, section actions, bookmark state, protected PDF action and workshop-note handoff.
- Added Recently opened and Bookmarked manuals above the hierarchy when available.
- Changed maintenance document cards to navigate to detail first.
- Kept mobile device-local bookmark/recent persistence and all catalogue IDs/files unchanged.

## 8. Exact files changed

| File | Purpose |
|---|---|
| `artifacts/api-server/src/lib/catalog/manualDetail.ts` | Shared stable-ID resolution, metadata, relationships, recent/bookmark filtering and safe routes |
| `artifacts/web/src/pages/manual-detail.tsx` | Web detail page |
| `artifacts/web/src/components/manual-shortcut.tsx` | Compact recent/bookmark/related card |
| `artifacts/web/src/hooks/useManualActivity.ts` | Existing private activity feed for root shortcuts |
| `artifacts/web/src/pages/docs.tsx` | Detail routing and recent/bookmark sections |
| `artifacts/web/src/lib/search.ts` | Search results route to detail |
| `artifacts/web/src/pages/bookmarks.tsx` | Bookmark rows route to detail |
| `artifacts/web/src/components/fleet-workspace.tsx` | Fleet manual links route to detail |
| `artifacts/web/src/pages/maintenance.tsx` | Maintenance manual links route to detail |
| `artifacts/web/src/pages/notes.tsx` | Preserve section/page context from detail note links |
| `artifacts/ltc-mobile/components/ManualDetail.tsx` | Mobile detail page |
| `artifacts/ltc-mobile/app/(tabs)/docs.tsx` | Mobile detail routing and shortcuts |
| `artifacts/ltc-mobile/app/(tabs)/maintenance.tsx` | Mobile maintenance links route to detail |
| `artifacts/web/src/lib/manualDetail.test.ts` | Detail, relationship, recent, bookmark and navigation tests |

Unrelated Scribd downloader files and existing package/catalogue changes were left untouched.

## 9. Tests and validation

- Manual Detail V2, Manual Library V2, catalogue, search and workflow tests: **67 passed; 1 optional database integration skipped** because `DIARY_PGLITE_MODULE` is not configured.
- Web TypeScript: PASS.
- API TypeScript: PASS.
- Mobile TypeScript: PASS.
- Production web build: PASS.
- API build: PASS.
- `git diff --check`: PASS.
- Existing web/mobile catalogue counts, IDs, filenames, URLs and fleet associations: PASS.
- Focused detail tests cover valid/invalid IDs, metadata, related exclusions and scoring, CKE1800/CKS1800 safety, generic Hino separation, CKS2500 engine relationship, recent deduplication/limits/missing IDs, whole-document vs section bookmarks, note context and stable search/detail links.

The earlier Manual Library V2 desktop and narrow web inspection remains valid. A fresh browser preview of the new detail route was attempted but blocked by the environment browser quota; no visual pass is claimed for that route.

## 10. Known limitations

- Mobile bookmarks and recent manuals remain device-local and do not sync with web account bookmarks/activity.
- Mobile workshop-note handoff requires the configured `EXPO_PUBLIC_DOMAIN` and opens the existing authenticated web notes flow.
- Recent shortcut data depends on the existing authenticated activity/bookmark endpoints; unavailable private data is hidden or shows the existing retry affordance.
- The route uses the existing `/docs?document=<stableId>` convention rather than adding a second router path, preserving existing document URLs.
- The production web build retains non-blocking sourcemap diagnostics and the existing bundle-size warning.

## 11. Git status

Branch: `codex/manual-detail-v2`. No staging, commit, push or merge was performed. PDFs, Backblaze objects, catalogue identity and unrelated Scribd work were not changed.

The worktree contains only the detail implementation changes plus the pre-existing unrelated changes and untracked manual/Scribd artifacts. The new report is also untracked.
