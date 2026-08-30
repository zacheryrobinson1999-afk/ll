import assert from 'node:assert/strict';
import test from 'node:test';
import { compactSearch, mergeRankedResults, scoreFields, searchTerms, type UnifiedSearchResult } from './search';

test('formatting differences normalize to the same identifier', () => {
  assert.equal(compactSearch('MAC25'), compactSearch('MAC 25'));
  assert.equal(compactSearch('LTM1050'), compactSearch('LTM 1050'));
  assert.equal(compactSearch('V37.3'), compactSearch('V37 3'));
});

test('punctuation-only and whitespace queries produce no search terms or score', () => {
  assert.deepEqual(searchTerms('  -- ... /  '), []);
  assert.equal(scoreFields('...', [{ value: 'Hydraulic manual', weight: 100 }]), 0);
});

test('multiple terms can match across different fields', () => {
  const allTerms = scoreFields('LTM suspension', [{ value: 'LTM 1050-3.1', weight: 100 }, { value: 'Suspension', weight: 60 }]);
  const partial = scoreFields('LTM suspension', [{ value: 'LTM 1050-3.1', weight: 100 }]);
  assert.ok(allTerms > partial);
});

test('exact model and title matches outrank summary-only matches', () => {
  const exact = scoreFields('MAC25', [{ value: 'MAC 25', weight: 120 }]);
  const summary = scoreFields('MAC25', [{ value: 'Troubleshooting the MAC 25 steering system', weight: 20 }]);
  assert.ok(exact > summary);
});

test('equal-score ordering is deterministic by title, type, then id', () => {
  const result = (id: string, title: string, type: UnifiedSearchResult['type']): UnifiedSearchResult => ({ id, title, type, subtitle: '', href: '/', score: 100 });
  const input = [result('2', 'Beta', 'manual'), result('2', 'Alpha', 'note'), result('1', 'Alpha', 'note')];
  const first = mergeRankedResults(input).map((item) => `${item.title}:${item.type}:${item.id}`);
  const second = mergeRankedResults([...input].reverse()).map((item) => `${item.title}:${item.type}:${item.id}`);
  assert.deepEqual(first, ['Alpha:note:1', 'Alpha:note:2', 'Beta:manual:2']);
  assert.deepEqual(second, first);
});
