# Daily summary migration

Apply `0004_daily_summary.sql` with the existing Drizzle migration runner before deploying the new diary API. This change was prepared locally; no deployed database was modified.

The existing diary table is retained. A nullable `daily_summary` column distinguishes new daily summaries from historical job rows. A partial unique index on `(technician_id, work_date)` for non-null summaries makes concurrent saves atomic. No historical rows are deleted, merged in SQL or overwritten by this migration.

When a date has only historical rows, the API combines their text and metadata into one editable summary. The first save creates a summary row; subsequent saves update that row. Original job rows remain stored, including their structured fields and links. Once a summary is saved, the API displays it instead of recombining historical rows. An unusually long historical day may exceed the editor's 20,000-character save limit; its original content remains stored and visible until the user shortens the proposed summary.

Deploy the API and frontend together after migration. Older clients sending structured job payloads are rejected; refresh those clients. Do not roll back to the multi-job API after users start writing summaries without planning compatibility: it would expose both historical rows and summary rows. Concurrent saves use last successful write wins; no edit-history or optimistic conflict UI is introduced.

Validation includes `diaryDatabase.test.ts`, using an isolated PGlite PostgreSQL engine. Set `DIARY_PGLITE_MODULE` to an installed `@electric-sql/pglite` module directory and `NODE_PATH` to its containing `node_modules` directory to run that test; it otherwise explicitly skips. It applies the old diary table migration, inserts multiple historical jobs, applies this migration and exercises the actual Drizzle store, simultaneous saves and owner isolation. No live database credentials are used.
