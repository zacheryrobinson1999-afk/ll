import { compactSearch, normalizeSearch } from './searchNormalization';

/** Structural metadata shared by both catalogues; never changes document identity. */
export interface LibraryDocument {
  id: string; title: string; subtitle: string; system: string; type: string;
  manufacturer?: string; sourceSystem?: string; documentType?: string;
  docNumber?: string; bookCode?: string; year?: number; summary: string;
  craneTypes: string[]; appliesTo: string[];
  sections: { ref: string; title: string; summary: string }[];
}
export interface LibraryFleet { id: string; model: string; manufacturer: string }
export const LIBRARY_CATEGORIES = ['All', 'Operation / Maintenance', 'Service / Workshop', 'Parts', 'Diagnostics', 'Electrical', 'Engine', 'Reference'] as const;
export type LibraryCategory = typeof LIBRARY_CATEGORIES[number];

export function manualFields(doc: LibraryDocument, fleet: readonly LibraryFleet[] = []): string[] {
  return [doc.title, doc.subtitle, doc.manufacturer, manufacturerGroup(doc), doc.system, doc.sourceSystem,
    doc.documentType, doc.type, doc.docNumber, doc.bookCode, String(doc.year ?? ''), doc.summary,
    ...doc.craneTypes, ...doc.appliesTo,
    ...fleet.filter(crane => doc.appliesTo.includes(crane.id)).flatMap(crane => [crane.model, crane.manufacturer]),
    ...doc.sections.flatMap(section => [section.ref, section.title, section.summary]),
  ].filter((value): value is string => Boolean(value));
}

/** Exact substrings only, with formatting ignored; every term must match. */
export function matchesManual(query: string, doc: LibraryDocument, fleet: readonly LibraryFleet[] = []): boolean {
  if (!query.trim()) return true;
  const normalized = normalizeSearch(query);
  if (!normalized) return false;
  const fields = manualFields(doc, fleet).map(compactSearch);
  return fields.some(field => field.includes(compactSearch(query)))
    || normalized.split(' ').every(term => fields.some(field => field.includes(term)));
}

export function manualCategories(doc: LibraryDocument): LibraryCategory[] {
  // Use identity/type metadata, not incidental words deep inside a summary.
  const text = normalizeSearch([doc.title, doc.documentType, doc.type].join(' '));
  const categories: LibraryCategory[] = [];
  if (/\b(operation|operating|maintenance)\b/.test(text)) categories.push('Operation / Maintenance');
  if (/\b(service|workshop|shop|repair)\b/.test(text)) categories.push('Service / Workshop');
  if (/\b(parts|spare)\b/.test(text)) categories.push('Parts');
  if (/\b(diagnostics?|fault|error|troubleshooting)\b/.test(text)) categories.push('Diagnostics');
  if (/\b(electrical|wiring)\b/.test(text)) categories.push('Electrical');
  if (/\bengine\b/.test(text)) categories.push('Engine');
  return categories.length ? categories : ['Reference'];
}

export function availableCategories(docs: readonly LibraryDocument[]): LibraryCategory[] {
  const used = new Set(docs.flatMap(manualCategories));
  return LIBRARY_CATEGORIES.filter(category => category === 'All' || used.has(category));
}

export function manufacturerGroup(doc: LibraryDocument): string {
  if (doc.manufacturer?.trim()) return doc.manufacturer.trim();
  // Legacy control-system records have no manufacturer field.
  if (doc.system === 'LICCON 1' || doc.system === 'LICCON 2') return 'Liebherr';
  if (doc.system === 'ECOS / CCS') return 'Grove';
  return doc.system;
}

export function manualModels(doc: LibraryDocument, fleet: readonly LibraryFleet[] = []): string[] {
  const labels = [...doc.craneTypes, ...fleet.filter(crane => doc.appliesTo.includes(crane.id)).map(crane => crane.model)];
  const unique = new Map<string, string>();
  for (const label of labels) if (label.trim() && !unique.has(compactSearch(label))) unique.set(compactSearch(label), label.trim());
  return [...unique.values()];
}

export const GENERAL_MODEL = 'General / system documents';
export const ENGINE_MODEL = 'Engine documents';
export function modelGroupsFor(doc: LibraryDocument, fleet: readonly LibraryFleet[] = []): string[] {
  const models = manualModels(doc, fleet);
  return models.length ? models : [manualCategories(doc).includes('Engine') ? ENGINE_MODEL : GENERAL_MODEL];
}

export interface ManualGroup { label: string; count: number }
function groups(docs: readonly LibraryDocument[], labels: (doc: LibraryDocument) => string[]): ManualGroup[] {
  const grouped = new Map<string, { label: string; ids: Set<string> }>();
  for (const doc of docs) for (const label of labels(doc)) {
    const key = compactSearch(label);
    const group = grouped.get(key) ?? { label, ids: new Set<string>() };
    group.ids.add(doc.id); grouped.set(key, group);
  }
  return [...grouped.values()].map(group => ({ label: group.label, count: group.ids.size }))
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
}
export function manufacturerGroups(docs: readonly LibraryDocument[]): ManualGroup[] {
  return groups(docs, doc => [manufacturerGroup(doc)]);
}
export function modelGroups(docs: readonly LibraryDocument[], fleet: readonly LibraryFleet[] = []): ManualGroup[] {
  return groups(docs, doc => modelGroupsFor(doc, fleet));
}

export function filterManuals<T extends LibraryDocument>(docs: readonly T[], options: {
  query?: string; category?: string; manufacturer?: string; model?: string;
}, fleet: readonly LibraryFleet[] = []): T[] {
  const searching = Boolean(options.query?.trim());
  return docs.filter(doc => matchesManual(options.query ?? '', doc, fleet)
    && (!options.category || options.category === 'All' || manualCategories(doc).includes(options.category as LibraryCategory))
    && (searching || !options.manufacturer || compactSearch(manufacturerGroup(doc)) === compactSearch(options.manufacturer))
    && (searching || !options.model || modelGroupsFor(doc, fleet).some(model => compactSearch(model) === compactSearch(options.model!))));
}
