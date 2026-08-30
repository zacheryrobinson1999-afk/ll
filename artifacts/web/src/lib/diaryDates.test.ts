import assert from 'node:assert/strict'; import test from 'node:test'; import { calendarDays, displayWorkDate, localDateKey, monthRange } from './diaryDates';
test('local date keys do not use UTC conversion', () => { assert.equal(localDateKey(new Date(2026, 7, 30, 23, 30)), '2026-08-30'); });
test('month ranges include the local first and last day', () => { assert.deepEqual(monthRange(new Date(2026, 1, 12)), { from: '2026-02-01', to: '2026-02-28' }); });
test('month ranges include leap day', () => { assert.deepEqual(monthRange(new Date(2024, 1, 12)), { from: '2024-02-01', to: '2024-02-29' }); });
test('calendar grid has six weeks and marks current month', () => { const days = calendarDays(new Date(2026, 7, 1)); assert.equal(days.length, 42); assert.equal(days.filter((day) => day.currentMonth).length, 31); });
test('work dates display in Australian day-month order without UTC shift', () => { assert.match(displayWorkDate('2026-08-30'), /30.*Aug.*2026/); });
