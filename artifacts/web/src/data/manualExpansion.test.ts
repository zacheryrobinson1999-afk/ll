import assert from 'node:assert/strict';
import test from 'node:test';
import { MANUAL_EXPANSION_DOCS } from './manualExpansion';
import { TECH_DOCS, docUrl } from './techDocs';
import { rankDocuments } from '../lib/search';

const expectedCount = 38;

test('manual expansion contains exactly the verified document set', () => {
  assert.equal(MANUAL_EXPANSION_DOCS.length, expectedCount);
  assert.equal(new Set(MANUAL_EXPANSION_DOCS.map((doc) => doc.id)).size, expectedCount);
  assert.equal(new Set(MANUAL_EXPANSION_DOCS.map((doc) => doc.cleanFile)).size, expectedCount);
  assert.equal(TECH_DOCS.length, new Set(TECH_DOCS.map((doc) => doc.id)).size);
});

test('all expanded manuals use authenticated document routes without pending markers', () => {
  for (const doc of MANUAL_EXPANSION_DOCS) {
    assert.equal(doc.fileName, doc.preparedFilename);
    assert.equal(doc.cleanFile, doc.preparedFilename);
    assert.equal(docUrl(doc), `/api/docs/${encodeURIComponent(doc.preparedFilename!)}`);
    assert.doesNotMatch(JSON.stringify(doc), /BACKBLAZE_PENDING|https?:\/\//i);
  }
});

test('excluded and human-review manuals are absent', () => {
  const serialized = JSON.stringify(MANUAL_EXPANSION_DOCS).toLowerCase();
  assert.doesNotMatch(serialized, /human_review_required/);
  assert.doesNotMatch(serialized, /kato.*acs.*ms-10e/);
  assert.doesNotMatch(serialized, /kobelco.*cke1800|kobelco.*ck2000/);
});

test('new manuals are searchable by prepared metadata', () => {
  const cases = [
    ['Grove', 'Grove_GMK-III-family_Technical-Training.pdf'],
    ['GMK 6250', 'Grove_GMK-6250_Technical-Training.pdf'],
    ['1327 751 103', 'ZF_ZF-AS-Tronic_Workshop-Manual_1327-751-103_2005.pdf'],
    ['Telescoping', 'Tadano_GR-130N-1_Telescoping-System.pdf'],
    ['ZF AS Tronic Error Codes', 'ZF_12-AS-2302-GMK4075_Error-Codes_2001.pdf'],
    ['Control Levers for Telescoping', 'Terex-Demag_AC665_Telescoping-System.pdf'],
  ] as const;
  for (const [query, expectedFile] of cases) {
    assert.ok(rankDocuments(query, MANUAL_EXPANSION_DOCS).some((result) => MANUAL_EXPANSION_DOCS.find((doc) => doc.id === result.id)?.cleanFile === expectedFile), `${query} should find ${expectedFile}`);
  }
});
