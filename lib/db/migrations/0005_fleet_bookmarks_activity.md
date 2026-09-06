# Fleet bookmarks and activity rollout

Apply `0005_fleet_bookmarks_activity.sql` using the existing Drizzle migration runner after 0004 and before deploying this feature. No live database was migrated during development.

This is additive: `manual_bookmarks` and `activity_events` reference the authenticated technician, with cascading deletion when that technician is deleted. Existing fleet, diary, notes and manual data are untouched.

Bookmarks store document IDs and optional source section / numeric PDF page references, not manual metadata. Empty reference strings mean a whole document. A unique owner/document/section/page index prevents concurrent duplicates; an owner/created index supports lists.

Activity stores stable entity IDs and minimal metadata. An owner/dedup index prevents repeated document/crane view events within each fixed five-minute UTC bucket, including concurrent requests. A boundary can produce two close events. Bookmark transitions are not deduplicated. Owner/created and owner/crane/created indexes support the latest ten events. Reads are capped; there is no automatic history deletion yet. Monitor table growth before adding retention.

The static catalogue remains static, now shared from the API's dependency-free `lib/catalog` directory through web re-exports. Custom cranes remain local to their existing browser storage; their views are not persisted. Diary text is not mined for crane links. Notes match normalized complete model names only. Manufacturer/system matches are explicitly related references, never proof of compatibility.

Activity failures do not block core manual/bookmark operations. There is no generic activity-write API. Manual opens are recorded after a successful authenticated stream; HEAD and prefetch requests are excluded. Fleet views have an authenticated same-origin action endpoint, separate from read/refetch requests.

Existing local favourites remain intact and separate from account bookmarks; no local data is silently imported into an account. Bookmarks state is reset when the authenticated technician changes.

Rollback the application if necessary; keep the additive tables to preserve saved bookmarks. Do not drop tables as part of an application rollback.
