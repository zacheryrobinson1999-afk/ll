# Fleet V2, bookmarks and activity implementation

Branch: feature/fleet-v2-bookmarks-activity, created from freshly fetched origin/main at 516ad49. No changes to main; nothing staged, committed, pushed or merged. No live migration.

## Behaviour

Private account bookmarks are available in search results, library cards, manual details and reliable source sections. /bookmarks lists saved references and opens the existing authenticated manual route. Whole-document and section bookmarks are distinct; page references are validated by the API but have no freeform page-entry UI yet. Existing browser-local favourites are preserved separately.

The existing fleet detail sheet now contains identity, related manuals, account bookmark state, exact-model-linked private workshop notes and private crane activity. The first three related manuals are shown with an expand control. Custom cranes remain local, retain their existing editor, and use the authenticated notes API for owner-private notes; custom-crane view events are not persisted.

Document and fleet catalogues are shared from the dependency-free API lib/catalog directory with web re-exports. Catalogue contents were compared with HEAD and preserved; only a trailing blank line was removed from manualExpansion.ts. Existing IDs, filenames and metadata are unchanged. Shared search normalization is reused. Query-string handling was corrected in library/fleet/search/notes so the new links resolve reliably.

## Endpoints

- GET /api/bookmarks: authenticated owner's bookmarks.
- POST /api/bookmarks: validate catalogue document/section/page reference, idempotently create.
- DELETE /api/bookmarks/:id: owner-scoped removal; missing/foreign UUID returns 404.
- GET /api/activity: latest 10 owner events; optional validated craneId.
- GET /api/fleet/:id: static crane with owner-scoped notes, activity and related bookmarks; independent private-data failures are reported without losing the crane/manuals.
- POST /api/fleet/:id/view: same-origin authenticated explicit view action for an existing static crane; not a generic event-write endpoint.
- GET /api/docs/:filename: existing authenticated stream, now records known manual ID after successful HTTP 200 completion. HEAD/prefetch and unsuccessful responses are excluded.

## Schema and migration

0005_fleet_bookmarks_activity.sql is additive and follows 0004_daily_summary. Its generated journal entry and 0005 snapshot are included. No old data is deleted or migrated destructively.

manual_bookmarks stores UUID id, technicianId, documentId, sectionRef/pageRef (empty string for absent refs), createdAt. Indexes:
- manual_bookmarks_owner_document_ref_unique: unique owner/document/section/page, including concurrent saves.
- manual_bookmarks_owner_created_idx: owner/list ordering.

activity_events stores UUID id, technicianId, type, entityType, entityId, optional craneId, minimal JSON metadata, dedupKey, createdAt. Indexes:
- activity_events_owner_dedup_unique.
- activity_events_owner_created_idx.
- activity_events_owner_crane_created_idx.

Both tables reference technicians with ON DELETE CASCADE. Document metadata is not copied into bookmark rows.

View dedup keys combine event type/entity ID with a fixed five-minute timestamp bucket. The owner/key unique index handles concurrent repeats. Bucket boundaries may produce two closely spaced events. Bookmark transitions use unique keys and are recorded only when a row is actually added/removed. Reads are capped at ten; retention deletion is not implemented. Activity recording is best-effort and does not block core manual/bookmark use on database failure.

## Relevance and security

Normalized complete model matches in appliesTo/craneTypes or bounded model names in titles rank first. Manufacturer/system/sourceSystem matches are broader related references with an explicit unconfirmed-applicability label. No model/serial/year or compatibility is invented. Workshop notes require normalized exact model linkage. Freeform diary text is not mined for crane mentions.

All owner IDs come from req.auth.technicianId. Body ownership is ignored. Auth middleware precedes every workflow handler; mutations additionally require same origin. Private reads send private/no-store. Bookmark UI state remounts on authenticated owner change. Isolated database tests verify two-owner isolation, foreign deletes, body-owner spoofing, concurrent uniqueness, newest-first activity and scoped fleet notes/bookmarks/activity.

## Validation

- Database, API and web TypeScript checks: pass.
- Complete API/security/diary/document/Search V2 suite: 69 passed, zero failed/skipped. Feature suite rerun after final route assertions/error guard: 5 passed.
- Isolated PGlite executes migration 0005 and real Drizzle services; no live database used. Existing diary migration/concurrency test also passes.
- No dedicated pre-existing workshop-notes test file exists in this checkout; existing search tests and new owner-scoped fleet-note tests pass.
- Web production build: pass. Existing UI sourcemap warnings and >500 kB bundle warning remain (approximately 624 kB JS before gzip).
- API production build: pass, including shared catalogue.
- git diff --check and checks of all new feature files: pass.
- Browser QA at 390 x 844 using a temporary local mock-data server: bookmark save/remove/state/list, authenticated manual href, search deep links, fleet sheet width, section control, and dashboard notes/diary resilience when activity returns 503. This was not a production integration test. Temporary server/tab closed and viewport restored.
- All ten protected local file hashes match the recorded originals. Import directories and PDFs were not operated on.

## Deployment and limitations

Apply migration 0005 after 0004 using the existing migration runner before deploying the feature. No live migration has been performed. Keep additive tables during application rollback to preserve bookmarks.

Activity currently covers manual opens, bookmark add/remove and static crane views. Note/diary activity is deferred. There is no generic activity submission API, standalone activity page, automatic retention deletion, inferred diary linkage, or persisted custom-crane activity. Local favourites are not automatically imported into any technician account. Catalogue membership is static; serial/year are displayed as unavailable when absent.

## Exact feature files (37)

- C:/Users/zache/Documents/CraneHub/FLEET-V2-IMPLEMENTATION.md
- C:/Users/zache/Documents/CraneHub/artifacts/api-server/src/lib/activityService.ts
- C:/Users/zache/Documents/CraneHub/artifacts/api-server/src/lib/bookmarkService.ts
- C:/Users/zache/Documents/CraneHub/artifacts/api-server/src/lib/catalog/craneFleet.ts
- C:/Users/zache/Documents/CraneHub/artifacts/api-server/src/lib/catalog/fleetRelevance.ts
- C:/Users/zache/Documents/CraneHub/artifacts/api-server/src/lib/catalog/manualExpansion.ts
- C:/Users/zache/Documents/CraneHub/artifacts/api-server/src/lib/catalog/searchNormalization.ts
- C:/Users/zache/Documents/CraneHub/artifacts/api-server/src/lib/catalog/techDocs.ts
- C:/Users/zache/Documents/CraneHub/artifacts/api-server/src/lib/catalog/verifiedManuals.ts
- C:/Users/zache/Documents/CraneHub/artifacts/api-server/src/lib/fleetService.ts
- C:/Users/zache/Documents/CraneHub/artifacts/api-server/src/lib/workflow.test.ts
- C:/Users/zache/Documents/CraneHub/artifacts/api-server/src/routes/docs.ts
- C:/Users/zache/Documents/CraneHub/artifacts/api-server/src/routes/index.ts
- C:/Users/zache/Documents/CraneHub/artifacts/api-server/src/routes/workflow.ts
- C:/Users/zache/Documents/CraneHub/artifacts/web/src/App.tsx
- C:/Users/zache/Documents/CraneHub/artifacts/web/src/components/bookmark-button.tsx
- C:/Users/zache/Documents/CraneHub/artifacts/web/src/components/dashboard-sections.tsx
- C:/Users/zache/Documents/CraneHub/artifacts/web/src/components/fleet-workspace.tsx
- C:/Users/zache/Documents/CraneHub/artifacts/web/src/components/recent-activity.tsx
- C:/Users/zache/Documents/CraneHub/artifacts/web/src/components/unified-search.tsx
- C:/Users/zache/Documents/CraneHub/artifacts/web/src/data/craneFleet.ts
- C:/Users/zache/Documents/CraneHub/artifacts/web/src/data/manualExpansion.ts
- C:/Users/zache/Documents/CraneHub/artifacts/web/src/data/techDocs.ts
- C:/Users/zache/Documents/CraneHub/artifacts/web/src/data/verifiedManuals.ts
- C:/Users/zache/Documents/CraneHub/artifacts/web/src/hooks/useBookmarks.tsx
- C:/Users/zache/Documents/CraneHub/artifacts/web/src/lib/search.ts
- C:/Users/zache/Documents/CraneHub/artifacts/web/src/lib/workflowApi.ts
- C:/Users/zache/Documents/CraneHub/artifacts/web/src/pages/bookmarks.tsx
- C:/Users/zache/Documents/CraneHub/artifacts/web/src/pages/docs.tsx
- C:/Users/zache/Documents/CraneHub/artifacts/web/src/pages/fleet.tsx
- C:/Users/zache/Documents/CraneHub/artifacts/web/src/pages/notes.tsx
- C:/Users/zache/Documents/CraneHub/artifacts/web/src/pages/search.tsx
- C:/Users/zache/Documents/CraneHub/lib/db/migrations/0005_fleet_bookmarks_activity.md
- C:/Users/zache/Documents/CraneHub/lib/db/migrations/0005_fleet_bookmarks_activity.sql
- C:/Users/zache/Documents/CraneHub/lib/db/migrations/meta/0005_snapshot.json
- C:/Users/zache/Documents/CraneHub/lib/db/migrations/meta/_journal.json
- C:/Users/zache/Documents/CraneHub/lib/db/src/schema/index.ts

## Pre-existing unrelated local changes (untouched)

.gitignore, package.json, pnpm-lock.yaml, scripts/package.json, scripts/tsconfig.json, imported-files-ready/, manual-imports-ready/, scribd-manuals.txt, scripts/SCRIBD-DOWNLOADER.md, scripts/src/scribd-downloader.ts, scripts/src/scribd-url.test.ts, scripts/src/scribd-url.ts.
