import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { TECH_DOCS, docUrl } from '../data/techDocs';
import { TECH_DOCS as MOBILE_DOCS } from '../../../ltc-mobile/data/techDocs';
import { NEW_MANUAL_DOCS } from '../../../api-server/src/lib/catalog/newManuals';
import { FLEET } from '../data/craneFleet';
import { filterManuals, matchesManual, manufacturerGroups, manufacturerGroup, modelGroups, modelGroupsFor, manualCategories, availableCategories, ENGINE_MODEL } from '../../../api-server/src/lib/catalog/manualLibrary';
import { rankDocuments } from './search';

test('empty queries preserve catalogue; punctuation-only and unknown queries return zero', () => {
  for (const docs of [TECH_DOCS, MOBILE_DOCS]) {
    assert.deepEqual(filterManuals(docs, { query: '  ' }), docs);
    assert.deepEqual(filterManuals(docs, { query: 'abc123zzunknown' }), []);
    assert.deepEqual(filterManuals(docs, { query: '---' }), []);
  }
});

const examples: [string, number[]][] = [
  ['CKE1800', [0, 1]], ['cke 1800', [0, 1]], ['  cKe1800-1f  ', [0, 1]], ['CKE18', [0, 1]],
  ['CKS2500', [2, 3, 5]], ['p11c', [4, 5]], ['Hino', [4, 5]],
  ['P11CVH-KSFC', [5]], ['p11 cvh', [5]], ['P11CVH', [5]], ['477290', [5]],
  ['S2JC21001ZE28', [0]], ['S3JC10003ZO21', [1]], ['S2JD04201ZE71', [2]],
  ['S3JD04201ZO18', [3]], ['Z4-011E', [4]], ['z4 011e', [4]], ['2011', [4]],
];
for (const [query, indexes] of examples) test(`shared and web search: ${query}`, () => {
  for (const docs of [TECH_DOCS, MOBILE_DOCS]) {
    const results = filterManuals(docs, { query }, FLEET);
    for (const index of indexes) assert.ok(results.some(doc => doc.id === NEW_MANUAL_DOCS[index].id));
    assert.ok(results.every(doc => matchesManual(query, doc, FLEET)));
  }
  for (const index of indexes) assert.ok(rankDocuments(query, TECH_DOCS).some(doc => doc.id === NEW_MANUAL_DOCS[index].id));
});

test('all query terms required; no unrelated fallback from partial matching', () => {
  assert.deepEqual(filterManuals(TECH_DOCS, { query: 'Kobelco nonexistentxyz' }), []);
  assert.deepEqual(rankDocuments('Kobelco nonexistentxyz', TECH_DOCS), []);
});
test('manufacturer search and Parts filter intersect', () => {
  const docs = filterManuals(TECH_DOCS, { query: 'Kobelco', category: 'Parts' });
  assert.ok(docs.some(doc => doc.id === NEW_MANUAL_DOCS[1].id));
  assert.ok(docs.some(doc => doc.id === NEW_MANUAL_DOCS[3].id));
  assert.ok(docs.every(doc => manualCategories(doc).includes('Parts')));
  assert.ok(!docs.some(doc => doc.id === NEW_MANUAL_DOCS[0].id));
});
test('search overrides hierarchy but preserves document type filter', () => {
  assert.deepEqual(filterManuals(TECH_DOCS, { query: 'Hino', manufacturer: 'Kobelco', model: 'CKE1800', category: 'Engine' }), filterManuals(TECH_DOCS, { query: 'Hino', category: 'Engine' }));
});
test('manufacturer counts count unique documents and cover full catalogue', () => {
  const groups = manufacturerGroups(TECH_DOCS);
  assert.equal(groups.reduce((sum, group) => sum + group.count, 0), TECH_DOCS.length);
  for (const group of groups) assert.equal(group.count, TECH_DOCS.filter(doc => manufacturerGroup(doc) === group.label).length);
});
test('models derive only from explicit applicability and allow multiple models', () => {
  const docs = filterManuals(TECH_DOCS, { manufacturer: 'Kobelco' });
  const groups = modelGroups(docs, FLEET);
  assert.ok(groups.some(group => group.label === 'CKE1800-1F'));
  assert.ok(modelGroupsFor(NEW_MANUAL_DOCS[1], FLEET).includes('CKE1800'));
  assert.ok(modelGroupsFor(NEW_MANUAL_DOCS[1], FLEET).includes('CKE1800-1F'));
  assert.ok(!modelGroupsFor(NEW_MANUAL_DOCS[1], FLEET).includes('CKS1800'));
  for (const group of groups) assert.equal(group.count, filterManuals(docs, { model: group.label }, FLEET).length);
});
test('generic Hino handbook stays under engines; specific parts supports CKS2500', () => {
  assert.deepEqual(modelGroupsFor(NEW_MANUAL_DOCS[4], FLEET), [ENGINE_MODEL]);
  assert.ok(modelGroupsFor(NEW_MANUAL_DOCS[5], FLEET).includes('CKS2500'));
  assert.ok(!filterManuals(TECH_DOCS, { model: 'CKS2500' }, FLEET).some(doc => doc.id === NEW_MANUAL_DOCS[4].id));
});
test('search includes resolved fleet metadata, book code and sections', () => {
  const doc = { ...NEW_MANUAL_DOCS[4], appliesTo: ['fleet-fixture'], bookCode: 'TEST-123', sections: [{ ref: 'FAULT-456', title: 'Example', summary: 'Thermocouple procedure' }] };
  assert.ok(matchesManual('Test Crane', doc, [{ id: 'fleet-fixture', model: 'Test Crane', manufacturer: 'Example' }]));
  for (const query of ['test123', 'fault456', 'thermocouple']) assert.ok(matchesManual(query, doc));
});
test('categories reflect identity metadata and are generated from represented types', () => {
  assert.deepEqual(manualCategories(NEW_MANUAL_DOCS[4]), ['Engine']);
  assert.deepEqual(manualCategories(NEW_MANUAL_DOCS[5]), ['Parts', 'Engine']);
  assert.deepEqual(availableCategories([NEW_MANUAL_DOCS[4]]), ['All', 'Engine']);
});
test('baseline IDs, URLs, fleet links and inventory counts remain unchanged', () => {
  const snapshots = [[TECH_DOCS, 73, '3d321b28a377dcac0a9da5c98910ea39653d59b84ee915a9f5be8e3d9d24571b'], [MOBILE_DOCS, 19, 'f21f50fb66ab99ac585656bf46b035fde3665e6ad35e6c5724c29d546fad3f6d']] as const;
  for (const [docs, count, hash] of snapshots) {
    assert.equal(docs.length, count);
    assert.equal(createHash('sha256').update(JSON.stringify(docs.map(doc => [doc.id, doc.fileName, doc.cleanFile, doc.appliesTo, doc.craneTypes]))).digest('hex'), hash);
    const bookmark = { documentId: docs[0].id, sectionRef: '', pageRef: '' };
    const result = filterManuals(docs, {}).find(doc => doc.id === bookmark.documentId);
    assert.equal(result, docs[0]);
    assert.equal(docUrl(result!), `/api/docs/${encodeURIComponent(docs[0].cleanFile)}`);
  }
});
