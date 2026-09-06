import assert from 'node:assert/strict';
import test from 'node:test';
import { isCalendarDate, isDiaryId, readDiaryInput, readDiaryRange } from './diaryValidation';

test('calendar dates handle leap days and reject impossible or malformed dates', () => {
  assert.equal(isCalendarDate('2024-02-29'), true);
  for (const date of ['2026-02-29', '2026-02-30', '30-08-2026']) assert.equal(isCalendarDate(date), false);
  assert.equal(isCalendarDate('2026-02-28'), true);
});
test('summary input needs only a valid date and freeform text', () => {
  assert.deepEqual(readDiaryInput({ date: '2026-09-06', summary: '  Worked on crane 12.\nWaiting on parts.  ' }),
    { date: '2026-09-06', summary: 'Worked on crane 12.\nWaiting on parts.' });
  for (const summary of ['', '   ', 42, 'x'.repeat(20_001)]) assert.equal(readDiaryInput({ date: '2026-09-06', summary }), null);
  assert.ok(readDiaryInput({ date: '2026-09-06', summary: 'x'.repeat(20_000) }));
  assert.equal(readDiaryInput({ date: '2026-02-29', summary: 'Invalid date' }), null);
});
test('date ranges allow exactly 732 days and reject 733 days or reversed ranges', () => {
  assert.deepEqual(readDiaryRange('2024-09-01', '2026-09-02'), { from: '2024-09-01', to: '2026-09-02' });
  assert.equal(readDiaryRange('2024-09-01', '2026-09-03'), null);
  assert.equal(readDiaryRange('2026-09-01', '2026-08-31'), null);
});
test('malformed range end never throws while calculating default start', () => {
  for (const end of ['invalid', '2026-02-30', ['2026-09-06']]) assert.equal(readDiaryRange(undefined, end), null);
  assert.equal(readDiaryRange(['2026-09-06'], '2026-09-06'), null);
  assert.deepEqual(readDiaryRange(undefined, undefined, new Date('2026-09-06T00:00:00Z')), { from: '2026-06-09', to: '2026-09-06' });
});
test('owner and structured job fields are not accepted as summary data', () => {
  assert.deepEqual(readDiaryInput({ date: '2026-09-06', summary: 'Private', technicianId: 'another-owner', title: 'Job', startTime: '12:00' }),
    { date: '2026-09-06', summary: 'Private' });
});
test('malformed diary IDs are rejected before lookup', () => {
  assert.equal(isDiaryId('not-an-id'), false);
  assert.equal(isDiaryId('00000000-0000-4000-8000-000000000001'), true);
});
