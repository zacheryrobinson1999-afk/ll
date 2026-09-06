import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { Readable, Writable } from 'node:stream';
import { once } from 'node:events';
import { TECH_DOCS } from './catalog/techDocs';
import { FLEET } from './catalog/craneFleet';
import { relatedManuals, sameModel } from './catalog/fleetRelevance';

process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.SESSION_SECRET = 'workflow-test-secret-7f42a9c8d1e0b6f5a4c3d2e1';
const { parseBookmark, createBookmarkService } = await import('./bookmarkService');
const { createActivityService, activityDedupKey } = await import('./activityService');
const { createFleetService } = await import('./fleetService');
const { createWorkflowRouter } = await import('../routes/workflow');
const { createDocsRouter } = await import('../routes/docs');
const { requireAuth } = await import('../middleware/auth');
const { requireSameOrigin } = await import('../middleware/sameOrigin');

test('bookmark validation uses real IDs and reliable references, ignoring body ownership', () => {
  const doc = TECH_DOCS.find((item) => item.sections.length && item.pages)!;
  assert.deepEqual(parseBookmark({ documentId: doc.id, technicianId: 'attacker' }), { documentId: doc.id, sectionRef: '', pageRef: '' });
  assert.ok(parseBookmark({ documentId: doc.id, sectionRef: doc.sections[0]!.ref, pageRef: '1' }));
  for (const input of [{ documentId: 'missing' }, { documentId: doc.id, sectionRef: 'invented' },
    { documentId: doc.id, pageRef: '0' }, { documentId: doc.id, pageRef: String(doc.pages! + 1) }]) assert.equal(parseBookmark(input), null);
});

test('relevance normalizes models without inventing compatibility or prefix matches', () => {
  const crane = { manufacturer: 'Liebherr', model: 'LTM1060-3.1' };
  assert.equal(sameModel('Liebherr LTM 1060-3.1', crane), true);
  assert.equal(sameModel('LTM1060-3.2', crane), false);
  assert.equal(sameModel('LTM1060', crane), false);
  const results = relatedManuals(crane);
  assert.ok(results.some((item) => item.documentId.includes('ltm-1060') && item.modelMatch));
  assert.ok(results.some((item) => !item.modelMatch && item.reason.includes('unconfirmed')));
  assert.equal(relatedManuals({ model: 'Unknown', manufacturer: 'Unknown' }).length, 0);
});

test('all workflow reads authenticate and mutations also enforce same origin', () => {
  const router = createWorkflowRouter();
  for (const layer of router.stack) {
    const route = layer.route!;
    assert.equal(route.stack[0].handle, requireAuth, route.path);
    if (route.stack.some((item) => item.method === 'post' || item.method === 'delete')) assert.equal(route.stack[1].handle, requireSameOrigin, route.path);
  }
});

test('manual stream records known document only after successful GET, excluding HEAD/prefetch', async () => {
  for (const mode of ['GET', 'HEAD', 'prefetch']) {
    const events: unknown[] = [];
    const router = createDocsRouter(async () => ({ Body: Readable.from(['pdf']) } as never), async (owner, event) => { events.push({ owner, event }); });
    const handler = router.stack[0].route!.stack.at(-1)!.handle;
    const response = Object.assign(new Writable({ write(_chunk, _encoding, callback) { callback(); } }), { statusCode: 200, setHeader() {} });
    const finished = once(response, 'finish');
    await handler({ method: mode === 'HEAD' ? 'HEAD' : 'GET', headers: mode === 'prefetch' ? { purpose: 'prefetch' } : {},
      params: { filename: TECH_DOCS[0]!.cleanFile }, auth: { technicianId: 'owner' } } as never, response as never, () => {});
    await finished;
    assert.equal(events.length, mode === 'GET' ? 1 : 0);
    if (events.length) assert.deepEqual(events[0], { owner: 'owner', event: { type: 'manual_opened', entityType: 'document', entityId: TECH_DOCS[0]!.id } });
  }
});

test('isolated database: bookmarks, activity, fleet privacy and partial failure resilience', { skip: !process.env.DIARY_PGLITE_MODULE }, async () => {
  const require = createRequire(import.meta.url);
  const { PGlite } = require(process.env.DIARY_PGLITE_MODULE!);
  const { drizzle } = require('drizzle-orm/pglite');
  const pg = new PGlite();
  try {
    await pg.exec('CREATE TABLE technicians (id uuid PRIMARY KEY); CREATE TABLE workshop_notes (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), technician_id uuid, title text, crane_model text, updated_at timestamptz DEFAULT now());');
    await pg.exec(await readFile(new URL('../../../../lib/db/migrations/0005_fleet_bookmarks_activity.sql', import.meta.url), 'utf8'));
    const a = '00000000-0000-4000-8000-000000000001'; const b = '00000000-0000-4000-8000-000000000002';
    await pg.query('INSERT INTO technicians VALUES ($1), ($2)', [a, b]);
    const database = drizzle(pg); const activity = createActivityService(database);
    const bookmarks = createBookmarkService(database, (owner, event) => activity.record(owner, event));
    const input = { documentId: TECH_DOCS[0]!.id, sectionRef: '', pageRef: '' };
    const created = await bookmarks.add(a, input);
    await Promise.all(Array.from({ length: 10 }, () => bookmarks.add(a, input)));
    assert.equal((await bookmarks.list(a)).length, 1);
    assert.equal((await bookmarks.list(b)).length, 0);
    assert.equal(await bookmarks.remove(b, created!.id), false);
    assert.equal((await activity.list(a)).filter((event) => event.type === 'bookmark_added').length, 1);
    await bookmarks.add(b, input);
    assert.equal((await bookmarks.list(b)).length, 1);
    const router = createWorkflowRouter(bookmarks, activity, createFleetService(database, activity, bookmarks));
    let status = 200; let payload: unknown;
    const response = { status(code: number) { status = code; return this; }, json(value: unknown) { payload = value; },
      sendStatus(code: number) { status = code; }, setHeader() {} };
    const post = router.stack.find((layer) => layer.route?.path === '/bookmarks' && layer.route.stack.some((item) => item.method === 'post'))!.route!.stack.at(-1)!.handle;
    await post({ auth: { technicianId: a }, body: { ...input, technicianId: b } } as never, response as never, () => {});
    assert.equal((payload as { bookmark: { technicianId: string } }).bookmark.technicianId, a);
    const remove = router.stack.find((layer) => layer.route?.path === '/bookmarks/:id')!.route!.stack.at(-1)!.handle;
    await remove({ auth: { technicianId: a }, params: { id: (await bookmarks.list(b))[0]!.id } } as never, response as never, () => {});
    assert.equal(status, 404);
    assert.equal((await bookmarks.list(b)).length, 1);
    await bookmarks.add(a, { ...input, pageRef: '2' });
    assert.equal((await bookmarks.list(a)).length, 2);
    assert.equal(await bookmarks.remove(a, created!.id), true);
    assert.ok((await activity.list(a)).some((event) => event.type === 'bookmark_removed'));

    const opened = { type: 'manual_opened' as const, entityType: 'document' as const, entityId: input.documentId };
    const time = new Date('2030-01-01T00:00:00Z');
    await Promise.all(Array.from({ length: 10 }, () => activity.record(a, opened, time)));
    assert.equal((await activity.list(a)).filter((event) => event.type === 'manual_opened').length, 1);
    await activity.record(b, opened, time);
    assert.equal((await activity.list(b)).filter((event) => event.type === 'manual_opened').length, 1);
    assert.notEqual(activityDedupKey(opened, time), activityDedupKey(opened, new Date(time.getTime() + 300_000)));
    const crane = FLEET[0]!;
    await pg.query('INSERT INTO workshop_notes (technician_id, title, crane_model) VALUES ($1, $3, $4), ($2, $5, $4), ($1, $6, $7)', [a, b, 'My note', crane.model, 'Private other note', 'Wrong model', 'Unknown']);
    await activity.record(a, { type: 'crane_viewed', entityType: 'crane', entityId: crane.id, craneId: crane.id }, new Date('2030-01-02'));
    await activity.record(b, { type: 'crane_viewed', entityType: 'crane', entityId: crane.id, craneId: crane.id }, new Date('2030-01-03'));
    const match = relatedManuals(crane)[0]!;
    await bookmarks.add(a, { ...input, documentId: match.documentId });
    const fleet = createFleetService(database, activity, bookmarks);
    assert.equal(await fleet.get(a, 'missing'), null);
    const detail = (await fleet.get(a, crane.id))!;
    assert.equal(detail.crane.id, crane.id);
    assert.deepEqual(detail.notes.map((note) => note.title), ['My note']);
    assert.equal(detail.activity.length, 1); assert.ok(detail.activity.every((event) => event.technicianId === a));
    assert.ok(detail.bookmarks.some((bookmark) => bookmark.documentId === match.documentId));
    const broken = createFleetService(database, { ...activity, list: async () => { throw new Error('offline'); } }, bookmarks);
    const partial = (await broken.get(a, crane.id))!;
    assert.deepEqual(partial.unavailable, ['activity']); assert.equal(partial.notes.length, 1);
    for (let i = 0; i < 15; i++) await activity.record(a, { ...opened, entityId: `doc-${i}` }, new Date(time.getTime() + i * 60_000));
    const recent = await activity.list(a);
    assert.equal(recent.length, 10);
    assert.ok(recent.every((event, i) => i === 0 || event.createdAt <= recent[i - 1]!.createdAt));
    assert.ok(recent.every((event) => event.technicianId === a));
  } finally { await pg.close(); }
});
