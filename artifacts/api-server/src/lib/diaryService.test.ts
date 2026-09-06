import assert from 'node:assert/strict';
import test from 'node:test';
import { randomUUID } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { createDiaryService, type DiaryRow, type DiaryStore } from './diaryService';

process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
const { createDiaryRouter } = await import('../routes/diary');
const { requireAuth } = await import('../middleware/auth');
const { requireSameOrigin } = await import('../middleware/sameOrigin');

function row(owner: string, date: string, summary: string | null): DiaryRow {
  return { id: randomUUID(), technicianId: owner, workDate: date, dailySummary: summary,
    title: 'Legacy job', workPerformed: 'Inspected the crane.', createdAt: new Date(), updatedAt: new Date(),
    startTime: null, endTime: null, durationMinutes: null, craneModel: null, craneId: null, systemCategory: null,
    faultSymptom: null, diagnosis: null, partsUsed: null, outcome: null, followUpRequired: false,
    followUpNotes: null, documentId: null, workshopNoteId: null, tags: [] };
}

function fixture() {
  const rows: DiaryRow[] = [];
  const store: DiaryStore = {
    async list(owner, range) { return rows.filter(r => r.technicianId === owner && r.workDate >= range.from && r.workDate <= range.to); },
    async findDate(owner, id) { return rows.find(r => r.technicianId === owner && r.id === id)?.workDate ?? null; },
    async save(owner, input) {
      let saved = rows.find(r => r.technicianId === owner && r.workDate === input.date && r.dailySummary !== null);
      if (!saved) { saved = row(owner, input.date, input.summary); rows.push(saved); }
      saved.dailySummary = input.summary; saved.updatedAt = new Date(); return saved;
    },
  };
  const service = createDiaryService(store);
  const router = createDiaryRouter(service);
  type Route = { path: string; methods: Record<string, boolean>; stack: Array<{ handle: (req: Request, res: Response, next: NextFunction) => unknown }> };
  const routes = (router as unknown as { stack: Array<{ route?: Route }> }).stack.flatMap(layer => layer.route ? [layer.route] : []);
  async function call(method: string, owner: string, body: unknown = {}, query: Record<string, unknown> = {}, id?: string) {
    const route = routes.find(r => r.methods[method] && r.path === (id === undefined ? '/diary' : '/diary/:id'))!;
    let code = 200; let result: any;
    const res = { status(value: number) { code = value; return this; }, json(value: unknown) { result = value; return this; } } as Response;
    const req = { auth: { technicianId: owner }, body, query, params: { id } } as unknown as Request;
    await route.stack.at(-1)!.handle(req, res, error => { if (error) throw error; });
    return { code, body: result };
  }
  return { rows, service, routes, call };
}

test('API creates, fetches and edits one summary for a date', async () => {
  const f = fixture(); const input = { date: '2026-09-06', summary: 'Diagnosed hydraulic leak.' };
  assert.equal((await f.call('get', 'owner', {}, { date: input.date })).body.entry, null);
  const created = await f.call('post', 'owner', input);
  assert.equal(created.code, 200);
  assert.equal((await f.call('get', 'owner', {}, { date: input.date })).body.entry.summary, input.summary);
  const updated = await f.call('put', 'owner', { ...input, summary: 'Waiting on parts.' }, {}, created.body.entry.id);
  assert.equal(updated.body.entry.id, created.body.entry.id);
  assert.equal(updated.body.entry.summary, 'Waiting on parts.');
  await f.call('post', 'owner', { ...input, summary: 'Parts arrived.' });
  assert.equal(f.rows.length, 1);
  assert.equal((await f.call('get', 'owner', {}, { date: input.date })).body.entry.summary, 'Parts arrived.');
});
test('two dates and two technicians stay separate, with owner-scoped ID updates', async () => {
  const f = fixture();
  const a = await f.call('post', 'a', { date: '2026-09-06', summary: 'A private', technicianId: 'b' });
  await f.call('post', 'a', { date: '2026-09-07', summary: 'Next day' });
  assert.equal((await f.call('get', 'b', {}, { date: '2026-09-06' })).body.entry, null);
  assert.equal((await f.call('get', 'b', {}, { entry: a.body.entry.id })).body.entry, null);
  assert.equal((await f.call('put', 'b', { date: '2026-09-06', summary: 'Attack' }, {}, a.body.entry.id)).code, 404);
  await f.call('post', 'b', { date: '2026-09-06', summary: 'B private' });
  const list = await f.call('get', 'a', {}, { from: '2026-09-06', to: '2026-09-07' });
  assert.deepEqual(list.body.entries.map((e: { summary: string }) => e.summary), ['Next day', 'A private']);
  assert.equal((await f.call('put', 'a', { date: '2026-09-07', summary: 'Move' }, {}, a.body.entry.id)).code, 400);
  assert.equal(f.rows.length, 3);
});
test('multiple historical jobs become one editable day without deleting or updating originals', async () => {
  const f = fixture();
  f.rows.push(row('a', '2026-09-06', null), { ...row('a', '2026-09-06', null), title: 'Second job', diagnosis: 'Seal leak' });
  const historical = structuredClone(f.rows);
  const combined = await f.service.get('a', '2026-09-06');
  assert.match(combined!.summary, /Second job/); assert.match(combined!.summary, /Diagnosis: Seal leak/);
  assert.equal(combined!.fromLegacy, true);
  await f.call('put', 'a', { date: '2026-09-06', summary: combined!.summary }, {}, combined!.id);
  await f.call('post', 'a', { date: '2026-09-06', summary: 'Edited daily summary' });
  assert.deepEqual(f.rows.slice(0, 2), historical);
  assert.equal(f.rows.length, 3);
  assert.equal((await f.service.list('a', { from: '2026-09-06', to: '2026-09-06' })).length, 1);
  assert.equal((await f.service.get('a', '2026-09-06'))!.summary, 'Edited daily summary');
});
test('API rejects invalid ranges and impossible dates', async () => {
  const f = fixture();
  assert.equal((await f.call('get', 'a', {}, { from: '2024-09-01', to: '2026-09-03' })).code, 400);
  assert.equal((await f.call('get', 'a', {}, { date: '2026-02-29' })).code, 400);
  assert.equal((await f.call('get', 'a', {}, { to: 'invalid' })).code, 400);
  assert.equal((await f.call('post', 'a', { date: '2024-02-29', summary: 'Leap day' })).code, 200);
});
test('all diary routes authenticate, and every mutation retains same-origin middleware', () => {
  for (const route of fixture().routes) {
    assert.equal(route.stack[0]!.handle, requireAuth);
    if (!route.methods.get) assert.equal(route.stack[1]!.handle, requireSameOrigin);
  }
});
