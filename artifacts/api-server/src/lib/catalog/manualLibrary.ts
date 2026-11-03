import { compactSearch, normalizeSearch } from './searchNormalization';

/** Structural metadata shared by both catalogues; never changes document identity. */
export interface LibraryDocument {
  id: string; title: string; subtitle: string; system: string; type: string;
  manufacturer?: string; sourceSystem?: string; documentType?: string;
  docNumber?: string; bookCode?: string; year?: number; summary: string;
  craneTypes: string[]; appliesTo: string[];
  pages?: number;
  sections: { ref: string; title: string; summary: string; pdfPage?: number }[];
}
export interface LibraryFleet { id: string; model: string; manufacturer: string }
export const LIBRARY_CATEGORIES = ['All', 'Operation / Maintenance', 'Service / Workshop', 'Parts', 'Diagnostics', 'Electrical', 'Engine', 'Hydraulics', 'Crane controls', 'Transmission', 'Reference'] as const;
export type LibraryCategory = typeof LIBRARY_CATEGORIES[number];
export const LIBRARY_CATEGORY_DESCRIPTIONS: Record<LibraryCategory, string> = {
  All: 'Browse the complete catalogue.',
  'Operation / Maintenance': 'Operating instructions, maintenance procedures, and day-to-day servicing information.',
  'Service / Workshop': 'Workshop procedures and repair information for technicians.',
  Parts: 'Parts catalogues and component references.',
  Diagnostics: 'Fault codes, troubleshooting, and diagnostic guidance.',
  Electrical: 'Wiring diagrams and electrical system references.',
  Engine: 'Engine-specific handbooks, parts, and technical references.',
  Hydraulics: 'Hydraulic system and component information where identified in the document metadata.',
  'Crane controls': 'LMI, RCI, LICCON, ECOS, CCS, and other crane control references.',
  Transmission: 'Transmission, gearbox, and driveline documentation.',
  Reference: 'General or system-level technical reference material.',
};

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
  if (/\b(hydraulic|hydraulics|hydrostatic)\b/.test(text)) categories.push('Hydraulics');
  if (/\b(liccon|ecos|ccs|lmi|rci|control|controls)\b/.test(text)) categories.push('Crane controls');
  if (/\b(transmission|tronic|gearbox|driveline)\b/.test(text)) categories.push('Transmission');
  return categories.length ? categories : ['Reference'];
}

export function availableCategories(docs: readonly LibraryDocument[]): LibraryCategory[] {
  const used = new Set(docs.flatMap(manualCategories));
  return LIBRARY_CATEGORIES.filter(category => category === 'All' || used.has(category));
}

const CRANE_MANUFACTURER_ORDER = [
  'Liebherr',
  'Terex / Franna',
  'Tadano',
  'Kobelco',
  'Grove',
  'KATO',
  'SANY',
  'National Crane',
  'Palfinger',
  'Terex / Demag',
] as const;

const SUBSYSTEM_ORDER = [
  'Crane documents',
  'Crane controls',
  'Engine',
  'Transmission',
  'Drivetrain',
  'Hydraulics',
  'Electrical',
  'Brakes & Pneumatics',
  'Parts',
] as const;

const CRANE_MANUFACTURERS = new Set(CRANE_MANUFACTURER_ORDER);
const COMPONENT_SUPPLIER_KEYS = new Set([
  'zf',
  'zfwabco',
  'wabco',
  'zfsachs',
  'mercedesbenz',
  'danaspicer',
  'eaton',
  'hino',
  'allison',
  'pathirschmann',
  'hirschmann',
]);

/**
 * Collapse source aliases to the labels technicians should see in the catalogue.
 * Raw manufacturer/system fields remain searchable on the document itself.
 */
export function canonicalManufacturer(value?: string): string {
  const label = value?.trim() ?? '';
  if (!label) return '';
  const key = compactSearch(label);
  const aliases: Record<string, string> = {
    franna: 'Terex / Franna',
    'terexfranna': 'Terex / Franna',
    'tadanofaun': 'Tadano',
    'terexdemag': 'Terex / Demag',
    'palfingerag': 'Palfinger',
    'grovepat': 'Grove',
  };
  return aliases[key] ?? label;
}

function catalogueText(doc: LibraryDocument): string {
  return normalizeSearch([
    doc.title,
    doc.subtitle,
    doc.manufacturer,
    doc.system,
    doc.sourceSystem,
    doc.documentType,
    doc.type,
  ].filter(Boolean).join(' '));
}

function isComponentReference(doc: LibraryDocument): boolean {
  const text = catalogueText(doc);
  const supplierKey = compactSearch(doc.manufacturer ?? '');
  const systemKey = compactSearch(doc.system);
  if (COMPONENT_SUPPLIER_KEYS.has(supplierKey) || COMPONENT_SUPPLIER_KEYS.has(systemKey)) return true;
  if (/\bpat\s+hirschmann\b|\bhirschmann\b/.test(text) && !/\b(gmk|ltm|franna|crane)\b/.test(text)) return true;
  return false;
}

function inferredCraneManufacturer(doc: LibraryDocument): string | null {
  const text = catalogueText(doc);
  const systemKey = compactSearch(doc.system);
  const explicit = canonicalManufacturer(doc.manufacturer);

  if (explicit && CRANE_MANUFACTURERS.has(explicit)) {
    if (explicit === 'Grove' && /\bpat\b|\bhirschmann\b/.test(text) && !/\b(gmk|grove\s+crane)\b/.test(text)) return null;
    if (explicit === 'Liebherr' && ['Engine', 'Transmission', 'Drivetrain'].includes(manualSubsystem(doc) ?? '')) return null;
    return explicit;
  }
  if (explicit && COMPONENT_SUPPLIER_KEYS.has(compactSearch(explicit))) return null;
  if (isComponentReference(doc)) return null;

  if (systemKey === 'terexfranna' || /\bfranna\b|\bmac\s*25\b|\brobway\b|\bat\s*\d{2,4}\b/.test(text)) return 'Terex / Franna';
  if (systemKey === 'kobelco' || /\bkobelco\b|\bck[es]?\s*\d{3,4}\b/.test(text)) return 'Kobelco';
  if (systemKey === 'kato' || /\bkato\b/.test(text)) return 'KATO';
  if (systemKey === 'sany' || /\bsany\b|\bscc\s*\d{3,4}\b/.test(text)) return 'SANY';
  if (systemKey === 'ecosccs' && /\bgmk\b|\bgrove\b/.test(text)) return 'Grove';
  if (systemKey === 'liccon1' || systemKey === 'liccon2' || systemKey === 'liebherr') {
    return /\bliccon\b|\bltm\b|\bliebherr\b/.test(text) && !['Engine', 'Transmission', 'Drivetrain'].includes(manualSubsystem(doc) ?? '')
      ? 'Liebherr'
      : null;
  }

  if (/\bterex\s+demag\b|\b(?:ac|cc)\s*\d{3,4}\b/.test(text)) return 'Terex / Demag';
  if (/\btadano\b|\b(?:atf|gr|tr|faun)\s*[-/]?\s*\d{2,4}\b/.test(text)) return 'Tadano';
  if (/\bgrove\b|\bgmk\s*\d{3,4}\b/.test(text)) return 'Grove';
  if (/\bnational\s+crane\b|\bnbt\s*\d{2,4}\b|\b600e\b/.test(text)) return 'National Crane';
  if (/\bpalfinger\b/.test(text)) return 'Palfinger';

  return null;
}

export function craneManufacturerGroup(doc: LibraryDocument): string | null {
  return inferredCraneManufacturer(doc);
}

export function manufacturerGroup(doc: LibraryDocument): string {
  return craneManufacturerGroup(doc) ?? canonicalManufacturer(doc.manufacturer ?? doc.system) || 'Technical references';
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
function groups(
  docs: readonly LibraryDocument[],
  labels: (doc: LibraryDocument) => string[],
  preferredOrder: readonly string[] = [],
): ManualGroup[] {
  const grouped = new Map<string, { label: string; ids: Set<string> }>();
  for (const doc of docs) for (const label of labels(doc)) {
    const key = compactSearch(label);
    const group = grouped.get(key) ?? { label, ids: new Set<string>() };
    group.ids.add(doc.id);
    grouped.set(key, group);
  }
  const order = new Map(preferredOrder.map((label, index) => [compactSearch(label), index]));
  return [...grouped.values()].map(group => ({ label: group.label, count: group.ids.size }))
    .sort((a, b) => {
      const aOrder = order.get(compactSearch(a.label));
      const bOrder = order.get(compactSearch(b.label));
      if (aOrder !== undefined || bOrder !== undefined) {
        if (aOrder === undefined) return 1;
        if (bOrder === undefined) return -1;
        if (aOrder !== bOrder) return aOrder - bOrder;
      }
      return a.label.localeCompare(b.label, undefined, { numeric: true });
    });
}
export function manufacturerGroups(docs: readonly LibraryDocument[]): ManualGroup[] {
  return groups(docs, doc => {
    const group = craneManufacturerGroup(doc);
    return group ? [group] : [];
  }, CRANE_MANUFACTURER_ORDER);
}
export function systemGroups(docs: readonly LibraryDocument[]): ManualGroup[] {
  return groups(docs, doc => [doc.system]);
}

export function manualSubsystem(doc: LibraryDocument): string | null {
  // Deliberately exclude the long summary and appliesTo list: crane manuals often
  // mention engines or hydraulics incidentally without being subsystem manuals.
  const text = catalogueText(doc);
  if (/\b(as[\s-]?tronic|transmission|gearbox|clutch|allison)\b/.test(text)) return 'Transmission';
  if (/\btransfer\s+case\b|\bdriveline\b|\bpowertrain\b|\bdrive\s*train\b|\bdriveshaft\b|\bspicer\b/.test(text)) return 'Drivetrain';
  if (/\bengine\b|\bdiesel\b|\bhino\b|\bom\d{3,4}\b|\bd\d{3,4}\b/.test(text)) return 'Engine';
  if (/\bliccon\b|\blmi\b|\brci\b|\bload\s+moment\b|\bload\s+sensing\b|\becos\b|\bccs\b|\bpat\s+hirschmann\b|\bhirschmann\b/.test(text)) return 'Crane controls';
  if (/\bbrake\b|\bpneumatic\b|\bwabco\b|\bpan[-\s]?19\b/.test(text)) return 'Brakes & Pneumatics';
  if (/\belectrical\b|\bwiring\b|\bcircuit\b|\bschematic\b/.test(text)) return 'Electrical';
  if (/\bhydraulic\b|\bpiston\s+pump\b/.test(text)) return 'Hydraulics';
  if (/\bparts\b|\bspare\s+parts\b/.test(text)) return 'Parts';
  const systemKey = compactSearch(doc.system);
  if (['mercedesbenz', 'hino'].includes(systemKey)) return 'Engine';
  if (['zfwabco', 'allison'].includes(systemKey)) return 'Transmission';
  if (systemKey === 'danaspicer') return 'Drivetrain';
  if (systemKey === 'eaton') return 'Hydraulics';
  return null;
}

export function subsystemGroups(docs: readonly LibraryDocument[]): ManualGroup[] {
  return groups(docs, doc => [manualSubsystem(doc) ?? 'Crane documents'], SUBSYSTEM_ORDER);
}

export function groupExamples(docs: readonly LibraryDocument[], label: string, kind: 'manufacturer' | 'system' | 'subsystem', limit = 3): string[] {
  const groupLabel = (doc: LibraryDocument) => kind === 'manufacturer'
    ? craneManufacturerGroup(doc)
    : kind === 'system'
      ? doc.system
      : manualSubsystem(doc) ?? 'Crane documents';
  return docs.filter(doc => {
    const value = groupLabel(doc);
    return Boolean(value) && compactSearch(value!) === compactSearch(label);
  }).slice(0, limit).map(doc => doc.title);
}
export function groupDescription(docs: readonly LibraryDocument[], label: string, kind: 'manufacturer' | 'system' | 'subsystem', fleet: readonly LibraryFleet[] = []): string {
  const groupLabel = (doc: LibraryDocument) => kind === 'manufacturer'
    ? craneManufacturerGroup(doc)
    : kind === 'system'
      ? doc.system
      : manualSubsystem(doc) ?? 'Crane documents';
  const records = docs.filter(doc => {
    const value = groupLabel(doc);
    return Boolean(value) && compactSearch(value!) === compactSearch(label);
  });
  const categories = [...new Set(records.flatMap(manualCategories))].filter(category => category !== 'All');
  if (kind === 'system') return LIBRARY_CATEGORY_DESCRIPTIONS[categories[0] ?? 'Reference'] + ' ' + records.length + ' manuals are indexed in this system.';
  if (kind === 'subsystem') {
    return label === 'Crane documents'
      ? 'Manufacturer and crane-specific manuals grouped separately from component references.'
      : records.length + ' manuals focused on ' + label.toLowerCase() + (categories.length ? ', including ' + categories.slice(0, 3).join(', ').toLowerCase() : '') + '.';
  }
  const models = [...new Set(records.flatMap(doc => manualModels(doc, fleet)))];
  return models.length
    ? 'Browse ' + models.length + ' indexed model or system group' + (models.length === 1 ? '' : 's') + ' with ' + (categories.slice(0, 3).join(', ').toLowerCase() || 'technical reference') + ' documents.'
    : 'Browse general and system-level documents indexed for this manufacturer.';
}

export function filterManuals<T extends LibraryDocument>(docs: readonly T[], options: {
  query?: string; category?: string; manufacturer?: string; model?: string; system?: string; documentType?: string;
}, fleet: readonly LibraryFleet[] = []): T[] {
  const searching = Boolean(options.query?.trim());
  return docs.filter(doc => matchesManual(options.query ?? '', doc, fleet)
    && (!options.category || options.category === 'All' || manualCategories(doc).includes(options.category as LibraryCategory))
    && (!options.system || compactSearch(doc.system) === compactSearch(options.system))
    && (!options.documentType || compactSearch(doc.documentType ?? doc.type) === compactSearch(options.documentType))
    && (searching || !options.manufacturer || compactSearch(craneManufacturerGroup(doc) ?? '') === compactSearch(options.manufacturer))
    && (searching || !options.model || modelGroupsFor(doc, fleet).some(model => compactSearch(model) === compactSearch(options.model!))));
}
