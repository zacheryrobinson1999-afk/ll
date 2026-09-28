import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { TECH_DOCS } from '../data/techDocs';
import { TECH_DOCS as MOBILE_DOCS } from '../../../ltc-mobile/data/techDocs';
import { NEW_MANUAL_DOCS } from '../../../api-server/src/lib/catalog/newManuals';
import { resolveManual, manualMetadata, relatedManuals, recentManuals, bookmarkedManuals, bookmarksInManual, manualDetailHref, manualNoteHref, noteReference, manualReturnPath } from '../../../api-server/src/lib/catalog/manualDetail';
import { rankDocuments } from './search';

const [cke, ckeParts, cks, cksParts, genericEngine, engineParts] = NEW_MANUAL_DOCS;
test('valid and invalid stable IDs resolve without filename lookup', () => {
  for (const docs of [TECH_DOCS, MOBILE_DOCS]) {
    assert.deepEqual(resolveManual(docs, cks.id), cks);
    assert.equal(resolveManual(docs, cks.id), docs.find(doc => doc.id === cks.id));
    assert.equal(resolveManual(docs, 'missing-manual'), undefined);
    assert.equal(resolveManual(docs, cks.cleanFile), undefined);
  }
});
test('detail metadata preserves title, code, actual year and applicability', () => {
  const meta = manualMetadata(genericEngine);
  assert.equal(meta.title, genericEngine.title);
  assert.equal(meta.code, 'Z4-011E');
  assert.equal(meta.year, 2011);
  assert.deepEqual(meta.models, []);
  assert.equal(meta.type, 'Engine handbook');
  assert.equal(meta.summary, genericEngine.summary);
});
test('related manuals prefer explicit fleet and model links and exclude current', () => {
  for (const docs of [TECH_DOCS, MOBILE_DOCS]) {
    const related = relatedManuals(cks, docs);
    assert.ok(!related.some(doc => doc.id === cks.id));
    assert.ok(related.some(doc => doc.id === cksParts.id));
    assert.ok(related.some(doc => doc.id === engineParts.id));
    assert.ok(!related.some(doc => doc.id === genericEngine.id));
    assert.ok(relatedManuals(cke, docs).some(doc => doc.id === ckeParts.id));
    assert.deepEqual(relatedManuals(genericEngine, docs), []);
    assert.ok(relatedManuals(cks, docs, 1).length <= 1);
  }
});
test('similar numbers, shared brand and generic families do not establish relationships', () => {
  const current = { ...cke, appliesTo: [], craneTypes: ['CKE1800', 'Kobelco crawler crane'] };
  const wrong = { ...cks, appliesTo: [], craneTypes: ['CKS1800', 'Kobelco crawler crane'] };
  assert.deepEqual(relatedManuals(current, [current, wrong]), []);
  const exact = { ...wrong, craneTypes: ['cke 1800'] };
  assert.deepEqual(relatedManuals(current, [exact]), [exact]);
});
test('same fleet ID is independently sufficient and outranks a model-only relationship', () => {
  const current = { ...cks, appliesTo: ['fleet'], craneTypes: ['MODEL123'] };
  const fleet = { ...engineParts, appliesTo: ['fleet'], craneTypes: [] };
  const model = { ...cksParts, appliesTo: [], craneTypes: ['MODEL123'] };
  assert.deepEqual(relatedManuals(current, [model, fleet]), [fleet, model]);
});
test('recent manuals sort newest first, newest duplicate wins, missing IDs and other activity excluded', () => {
  const events = [
    { entityId: cke.id, type: 'manual_opened', createdAt: '2026-01-01' },
    { entityId: 'deleted', type: 'manual_opened', createdAt: '2026-01-05' },
    { entityId: cks.id, type: 'manual_opened', createdAt: '2026-01-02' },
    { entityId: cke.id, type: 'manual_opened', createdAt: '2026-01-03' },
    { entityId: cksParts.id, type: 'bookmark_added', createdAt: '2026-01-04' },
  ];
  const result = recentManuals(TECH_DOCS, events);
  assert.deepEqual(result.map(item => item.doc.id), [cke.id, cks.id]);
  assert.equal(result[0].openedAt, '2026-01-03');
  assert.deepEqual(recentManuals(TECH_DOCS, events, 1), [result[0]]);
  assert.deepEqual(recentManuals(TECH_DOCS, []), []);
});
test('existing mobile newest-first IDs retain ordering without fabricated dates', () => {
  assert.deepEqual(recentManuals(MOBILE_DOCS, [cks.id, cke.id, cks.id].map(entityId => ({ entityId }))).map(item => item.doc.id), [cks.id, cke.id]);
});
test('whole-document bookmark shortcuts update on removal and never include section/page-only saves', () => {
  const all = [{ documentId: cks.id }, { documentId: cks.id, sectionRef: 'Full manual' }, { documentId: cke.id, pageRef: '1' }];
  assert.deepEqual(bookmarkedManuals(TECH_DOCS, all), [cks]);
  assert.deepEqual(bookmarkedManuals(TECH_DOCS, all.slice(1)), []);
  assert.deepEqual(bookmarksInManual(all, cks.id), [all[1]]);
  assert.deepEqual(bookmarkedManuals(TECH_DOCS, [{ documentId: 'deleted' }]), []);
});
test('detail links retain stable ID, origin and section/page context', () => {
  const href = manualDetailHref(cks.id, { from: '/fleet?crane=cr-cks2500', section: 'A / B', page: '12' });
  const query = new URL(href, 'https://example.test').searchParams;
  assert.equal(query.get('document'), cks.id);
  assert.equal(query.get('section'), 'A / B');
  assert.equal(query.get('page'), '12');
  assert.equal(manualReturnPath(query.get('from')), '/fleet?crane=cr-cks2500');
  assert.equal(manualReturnPath('//evil.example'), '/docs');
  assert.equal(manualReturnPath('https://evil.example'), '/docs');
});
test('workshop-note link carries manual and reference without changing ownership fields', () => {
  const query = new URL(manualNoteHref(cks.id, 'Hydraulics', '20'), 'https://example.test').searchParams;
  assert.equal(query.get('document'), cks.id);
  assert.equal(noteReference(query.get('section'), query.get('page')), 'Section Hydraulics · Page 20');
  assert.equal(noteReference(null, null), null);
  assert.ok(!query.has('technicianId'));
});
test('search and both library selection paths use stable detail route', () => {
  const result = rankDocuments('S3JD04201ZO18', TECH_DOCS).find(item => item.id === cksParts.id)!;
  assert.equal(new URL(result.href, 'https://example.test').searchParams.get('document'), cksParts.id);
  const web = readFileSync(new URL('../pages/docs.tsx', import.meta.url), 'utf8');
  const mobile = readFileSync(new URL('../../../ltc-mobile/app/(tabs)/docs.tsx', import.meta.url), 'utf8');
  assert.match(web, /navigate\(manualDetailHref\(doc.id/);
  assert.match(web, /detailId !== null.*<ManualDetail/);
  assert.match(mobile, /<ManualDetail id=\{params.document\}/);
  assert.ok(!web.includes('window.open('));
  assert.ok(!mobile.includes('openBrowserAsync('));
});
