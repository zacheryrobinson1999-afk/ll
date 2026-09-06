import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { createDiaryService } from './diaryService';

// Optional isolated PostgreSQL engine; no application dependency or live DB needed.
// Set DIARY_PGLITE_MODULE to an installed @electric-sql/pglite module directory.
test('database migration preserves history and concurrent saves enforce owner/date uniqueness',
  { skip: !process.env.DIARY_PGLITE_MODULE }, async () => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    const require = createRequire(import.meta.url);
    const { PGlite } = require(process.env.DIARY_PGLITE_MODULE!);
    const { drizzle } = require('drizzle-orm/pglite');
    const { createDiaryStore } = await import('./diaryStore');
    const pg = new PGlite();
    try {
      await pg.exec('CREATE TABLE technicians (id uuid PRIMARY KEY); CREATE TABLE workshop_notes (id uuid PRIMARY KEY);');
      await pg.exec(await readFile(new URL('../../../../lib/db/migrations/0003_technician_diary.sql', import.meta.url), 'utf8'));
      const a = '00000000-0000-4000-8000-000000000001';
      const b = '00000000-0000-4000-8000-000000000002';
      await pg.query('INSERT INTO technicians (id) VALUES ($1), ($2)', [a, b]);
      await pg.query("INSERT INTO diary_entries (technician_id, work_date, title, work_performed) VALUES ($1, '2026-09-06', 'First job', 'Found leak'), ($1, '2026-09-06', 'Second job', 'Ordered seal')", [a]);
      const before = (await pg.query('SELECT * FROM diary_entries ORDER BY id')).rows;
      await pg.exec(await readFile(new URL('../../../../lib/db/migrations/0004_daily_summary.sql', import.meta.url), 'utf8'));
      const service = createDiaryService(createDiaryStore(drizzle(pg)));
      const old = await service.get(a, '2026-09-06');
      assert.match(old!.summary, /Found leak/); assert.match(old!.summary, /Ordered seal/);
      assert.equal(await service.get(b, '2026-09-06'), null);
      await Promise.all(Array.from({ length: 12 }, (_, i) => service.save(a, { date: '2026-09-06', summary: `Save ${i}` })));
      await service.save(a, { date: '2026-09-06', summary: 'Final summary' });
      await service.save(a, { date: '2026-09-07', summary: 'Next day' });
      await service.save(b, { date: '2026-09-06', summary: 'Other technician' });
      assert.equal((await service.get(a, '2026-09-06'))!.summary, 'Final summary');
      assert.equal((await service.list(a, { from: '2026-09-06', to: '2026-09-07' })).length, 2);
      assert.equal((await service.list(b, { from: '2026-09-06', to: '2026-09-07' })).length, 1);
      assert.equal(await service.findDate(b, old!.id), null);
      const after = (await pg.query('SELECT * FROM diary_entries WHERE daily_summary IS NULL ORDER BY id')).rows
        .map(({ daily_summary: _summary, ...row }: { daily_summary: null }) => row);
      assert.deepEqual(after, before);
      assert.equal((await pg.query('SELECT count(*)::int AS n FROM diary_entries WHERE daily_summary IS NOT NULL')).rows[0].n, 3);
      await assert.rejects(pg.query("INSERT INTO diary_entries (technician_id, work_date, title, work_performed, daily_summary) VALUES ($1, '2026-09-06', 'Duplicate', 'Duplicate', 'Duplicate')", [a]), /duplicate key/);
    } finally { await pg.close(); }
  });
