import assert from 'node:assert/strict';
import test from 'node:test';
import { NEW_MANUAL_DOCS } from '../../../api-server/src/lib/catalog/newManuals';
import * as shared from './techDocs';
import * as mobile from '../../../ltc-mobile/data/techDocs';
import { rankDocuments } from '../lib/search';

const filenames = [
  'Kobelco_CKE1800-1F_Operation-Maintenance_S2JC21001ZE28_2022.pdf',
  'Kobelco_CKE1800-1F_Parts-Manual_S3JC10003ZO21_2023.pdf',
  'Kobelco_CKS2500_Operation-Maintenance_S2JD04201ZE71_2023.pdf',
  'Kobelco_CKS2500_Parts-Manual_S3JD04201ZO18_2023.pdf',
  'Hino_J08E-P11C_Engine-Handbook_Z4-011E_2011.pdf',
  'Hino_P11CVH-KSFC_Engine-Parts_477290-K25_S2GN45002ZE28_2023.pdf',
];

test('both catalogues retain every existing record and append exactly six unique manuals', () => {
  assert.equal(NEW_MANUAL_DOCS.length, 6);
  assert.deepEqual(NEW_MANUAL_DOCS.map(doc => doc.cleanFile), filenames);
  for (const catalog of [shared, mobile]) {
    assert.equal(catalog.TECH_DOCS.length, catalog.EXISTING_TECH_DOCS.length + 6);
    assert.deepEqual(catalog.TECH_DOCS.slice(0, catalog.EXISTING_TECH_DOCS.length), catalog.EXISTING_TECH_DOCS);
    for (const doc of NEW_MANUAL_DOCS) {
      assert.equal(catalog.TECH_DOCS.filter(item => item.id === doc.id).length, 1);
      assert.ok(!catalog.EXISTING_TECH_DOCS.some(item => item.id === doc.id));
      assert.equal(doc.fileName, doc.cleanFile);
      assert.equal(doc.preparedFilename, doc.cleanFile);
    }
    for (const key of ['id', 'fileName', 'cleanFile'] as const) {
      // Mobile already has two legacy records sharing a clutch PDF; preserve them.
      const existingValues = new Set(catalog.EXISTING_TECH_DOCS.map(doc => doc[key]));
      assert.equal(new Set(NEW_MANUAL_DOCS.map(doc => doc[key])).size, 6);
      assert.equal(new Set(catalog.TECH_DOCS.map(doc => doc[key])).size, existingValues.size + 6);
    }
  }
  assert.ok(shared.TECH_DOCS.some(doc => doc.id === 'kobelco-cke1800-ck2000-service'));
  assert.ok(shared.TECH_DOCS.some(doc => doc.id === 'kobelco-ck2500ii-cke2500ii-service'));
});

test('Hino is a supported system with display values and filterable manuals on both clients', () => {
  const sharedSystem: shared.DocSystem = 'Hino';
  const mobileSystem: mobile.DocSystem = 'Hino';
  assert.ok(shared.DOC_SYSTEMS.includes(sharedSystem));
  assert.ok(mobile.DOC_SYSTEMS.includes(mobileSystem));
  for (const catalog of [shared, mobile]) {
    assert.ok(catalog.SYSTEM_COLORS.Hino);
    assert.ok(catalog.SYSTEM_ICONS.Hino);
    assert.equal(catalog.TECH_DOCS.filter(doc => doc.system === 'Hino').length, 2);
  }
  assert.equal(mobile.getBySystem('Hino').length, 2);
  assert.deepEqual([...new Set(NEW_MANUAL_DOCS.map(doc => doc.system))], ['Kobelco', 'Hino']);
});

test('fleet links and engine publication scope remain precise', () => {
  const [ckeOperation, ckeParts, cksOperation, cksParts, handbook, engineParts] = NEW_MANUAL_DOCS;
  for (const catalog of [shared, mobile]) {
    const batch = catalog.getByFleetId('cr-cks2500').filter(doc => NEW_MANUAL_DOCS.some(item => item.id === doc.id));
    assert.deepEqual(batch.map(doc => doc.id), [cksOperation.id, cksParts.id, engineParts.id]);
  }
  for (const doc of [ckeOperation, ckeParts, handbook]) assert.deepEqual(doc.appliesTo, []);
  assert.deepEqual(handbook.craneTypes, []);
  assert.equal(handbook.year, 2011);
  assert.equal(handbook.docNumber, 'Z4-011E');
  assert.match(handbook.subtitle, /wrapper S2GN45002ZE28, June 2023/);
  assert.deepEqual(engineParts.craneTypes, ['7120S', '7250S', 'BMS800', 'BMS1000', 'CKS1350', 'CKS2500']);
  assert.deepEqual(NEW_MANUAL_DOCS.map(doc => doc.pages), [512, 1540, 920, 1816, 78, 108]);
});

test('all requested search terms surface the relevant new records without ranking changes', () => {
  const queries = [
    ['CKE1800', 'CKE1800-1F', 'S2JC21001ZE28'],
    ['CKE1800', 'CKE1800-1F', 'S3JC10003ZO21'],
    ['CKS2500', 'S2JD04201ZE71'],
    ['CKS2500', 'S3JD04201ZO18'],
    ['Hino', 'P11C', 'Z4-011E', 'S2GN45002ZE28'],
    ['CKS2500', 'Hino', 'P11C', 'P11CVH', 'P11CVH-KSFC', '477290', 'S2GN45002ZE28'],
  ];
  NEW_MANUAL_DOCS.forEach((doc, index) => {
    for (const query of queries[index]) {
      assert.ok(rankDocuments(query, shared.TECH_DOCS).some(result => result.id === doc.id), `${query}: ${doc.id}`);
    }
  });
});

test('prepared files use the existing API document URL mechanism on web and mobile', () => {
  for (const doc of NEW_MANUAL_DOCS) {
    const path = `/api/docs/${encodeURIComponent(doc.cleanFile)}`;
    assert.equal(shared.docUrl(doc), path);
    const domain = process.env.EXPO_PUBLIC_DOMAIN;
    assert.equal(mobile.docUrl(doc), `${domain ? `https://${domain}` : ''}${path}`);
  }
  assert.doesNotMatch(JSON.stringify(NEW_MANUAL_DOCS), /https?:\/\//);
});
