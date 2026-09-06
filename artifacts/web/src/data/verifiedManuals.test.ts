import assert from 'node:assert/strict';
import test from 'node:test';
import { VERIFIED_MANUAL_DOCS } from './verifiedManuals';
import { TECH_DOCS, DOC_SYSTEMS, SYSTEM_COLORS, TYPE_ICONS, docUrl } from './techDocs';
import { rankDocuments } from '../lib/search';

// Exact keys from the upload manifest, verified present with matching sizes on 2026-09-06.
const filenames = [
  'Liebherr_LICCON2_Diagnostics-Manual_99908-03-02_2024.pdf',
  'Liebherr_LTM-1060-3.1_Error-Codes_040601_2026.pdf',
  'Liebherr_LTM-1060-3.1_Service-Fill_040601_2026.pdf',
  'Liebherr_LTM-1060-3.1_Spare-Parts-Catalogue_040601_2026.pdf',
  'Liebherr_LTM-1060-3.1_Electrical-Hydraulic-Schematics_040601.pdf',
];

test('exactly five verified manuals are integrated once with authenticated URLs', () => {
  assert.equal(VERIFIED_MANUAL_DOCS.length, 5);
  assert.deepEqual(VERIFIED_MANUAL_DOCS.map(doc => doc.preparedFilename), filenames);
  for (const doc of VERIFIED_MANUAL_DOCS) {
    assert.equal(TECH_DOCS.filter(item => item.id === doc.id).length, 1);
    assert.equal(doc.fileName, doc.preparedFilename);
    assert.equal(doc.cleanFile, doc.preparedFilename);
    assert.equal(docUrl(doc), `/api/docs/${encodeURIComponent(doc.preparedFilename)}`);
  }
  assert.equal(new Set(TECH_DOCS.map(doc => doc.id)).size, TECH_DOCS.length);
  assert.equal(new Set(TECH_DOCS.map(doc => doc.cleanFile)).size, TECH_DOCS.length);
  assert.equal(new Set(TECH_DOCS.map(doc => doc.fileName)).size, TECH_DOCS.length);
  assert.doesNotMatch(JSON.stringify(VERIFIED_MANUAL_DOCS), /BACKBLAZE_PENDING|https?:\/\//i);
});

test('verified manuals preserve unknown models, revisions and mixed schematic dates', () => {
  const [diagnostics, , fill, parts, schematics] = VERIFIED_MANUAL_DOCS;
  assert.deepEqual(diagnostics.appliesTo, []);
  assert.deepEqual(diagnostics.craneTypes, []);
  assert.match(diagnostics.summary, /specific crane model/);
  assert.equal('year' in schematics, false);
  assert.equal('docNumber' in fill, false);
  assert.equal('docNumber' in parts, false);
  for (const doc of VERIFIED_MANUAL_DOCS) assert.equal('revision' in doc, false);
  assert.match(schematics.summary, /applicability is limited to this component set/);
});

test('verified manuals retain supported Technical Library filter values', () => {
  for (const doc of VERIFIED_MANUAL_DOCS) {
    assert.ok(DOC_SYSTEMS.includes(doc.system));
    assert.ok(SYSTEM_COLORS[doc.system]);
    assert.ok(TYPE_ICONS[doc.type]);
  }
  assert.equal(VERIFIED_MANUAL_DOCS.filter(doc => doc.system === 'LICCON 2').length, 3);
  assert.equal(VERIFIED_MANUAL_DOCS.filter(doc => doc.system === 'Liebherr').length, 2);
  assert.equal(VERIFIED_MANUAL_DOCS.filter(doc => doc.type === 'Diagnostics').length, 2);
  assert.equal(VERIFIED_MANUAL_DOCS.filter(doc => doc.type === 'Reference').length, 3);
  assert.equal(VERIFIED_MANUAL_DOCS.filter(doc => doc.craneTypes.includes('LTM')).length, 4);
});

test('Search V2 discovers every verified manual by its prepared metadata', () => {
  for (const doc of VERIFIED_MANUAL_DOCS) {
    const queries = [doc.title, doc.manufacturer, doc.documentType, doc.system,
      doc.sourceSystem, doc.sections[0].title,
      ...('docNumber' in doc ? [doc.docNumber!] : []),
      ...(doc.craneTypes.length ? ['LTM1060-3.1', '040601'] : ['99908 03 02'])];
    for (const query of queries) {
      assert.ok(rankDocuments(query, TECH_DOCS).some(result => result.id === doc.id), `${query}: ${doc.id}`);
    }
  }
});

test('Search V2 indexes sourceSystem independently of other fields', () => {
  const doc = { ...VERIFIED_MANUAL_DOCS[0], sourceSystem: 'UniqueSourceSystemToken' };
  assert.equal(rankDocuments('UniqueSourceSystemToken', [doc])[0]?.id, doc.id);
  assert.deepEqual(rankDocuments('UnrelatedUnmatchedToken', [doc]), []);
});
