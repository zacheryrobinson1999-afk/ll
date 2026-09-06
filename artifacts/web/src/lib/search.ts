import type { CraneModel } from '@/data/craneFleet';
import type { TechDoc } from '@/data/techDocs';
import type { WorkshopNote } from '@/lib/notesApi';
import { normalizeSearch, compactSearch } from '../../../api-server/src/lib/catalog/searchNormalization';
export { normalizeSearch, compactSearch };

export type SearchResultType = 'manual' | 'crane' | 'note';
export type UnifiedSearchResult = {
  type: SearchResultType;
  id: string;
  title: string;
  subtitle: string;
  detail?: string;
  href: string;
  score: number;
};

type SearchField = { value?: string | null; weight: number };

export function searchTerms(query: string): string[] {
  const normalized = normalizeSearch(query);
  return normalized ? normalized.split(/\s+/).filter(Boolean) : [];
}

export function scoreFields(query: string, fields: SearchField[]): number {
  const terms = searchTerms(query);
  const compactQuery = compactSearch(query);
  if (!terms.length || !compactQuery) return 0;
  let score = 0;
  let matchedTerms = 0;
  for (const term of terms) {
    const compactTerm = compactSearch(term);
    let best = 0;
    for (const field of fields) {
      if (!field.value) continue;
      const normalized = normalizeSearch(field.value);
      const compact = compactSearch(field.value);
      if (compact === compactTerm || normalized === term) best = Math.max(best, field.weight + 80);
      else if (compact.startsWith(compactTerm) || normalized.split(' ').some((word) => word.startsWith(term))) best = Math.max(best, field.weight + 45);
      else if (compact.includes(compactTerm) || normalized.includes(term)) best = Math.max(best, field.weight + 20);
    }
    if (best) { matchedTerms += 1; score += best; }
  }
  for (const field of fields) {
    if (field.value && compactSearch(field.value) === compactQuery) score += field.weight + 300;
  }
  score += matchedTerms === terms.length ? 2_000 : matchedTerms * 15;
  return score;
}

export function rankDocuments(query: string, documents: TechDoc[]): UnifiedSearchResult[] {
  return documents.map((doc) => {
    const section = doc.sections.map((item) => ({ item, score: scoreFields(query, [
      { value: item.ref, weight: 110 }, { value: item.title, weight: 85 }, { value: item.summary, weight: 25 },
    ]) })).sort((a, b) => b.score - a.score)[0];
    const score = scoreFields(query, [
      { value: doc.docNumber, weight: 140 }, { value: doc.title, weight: 120 }, { value: doc.subtitle, weight: 75 },
      ...doc.craneTypes.map((value) => ({ value, weight: 110 })), ...doc.appliesTo.map((value) => ({ value, weight: 85 })),
      { value: doc.manufacturer, weight: 90 }, { value: doc.system, weight: 70 },
      { value: doc.sourceSystem, weight: 70 },
      { value: doc.documentType, weight: 60 }, { value: doc.type, weight: 55 }, { value: doc.summary, weight: 25 },
      ...doc.sections.flatMap((item) => [{ value: item.ref, weight: 110 }, { value: item.title, weight: 85 }, { value: item.summary, weight: 25 }]),
    ]);
    return { type: 'manual' as const, id: doc.id, title: doc.title, subtitle: `${doc.type} · ${doc.system}${doc.craneTypes[0] ? ` · ${doc.craneTypes[0]}` : ''}`, detail: section?.score ? `${section.item.ref} · ${section.item.title}` : doc.docNumber ? `Document ${doc.docNumber}` : undefined, href: `/docs?document=${encodeURIComponent(doc.id)}`, score };
  }).filter((result) => result.score > 0).sort(compareResults);
}

export function rankCranes(query: string, cranes: CraneModel[]): UnifiedSearchResult[] {
  return cranes.map((crane) => ({
    type: 'crane' as const, id: crane.id, title: crane.model,
    subtitle: `${crane.manufacturer} · ${crane.category} · ${crane.maxCapacity} t`,
    detail: crane.units.length ? `Units: ${crane.units.join(', ')}` : `${crane.axles || 'Crawler'} axles · ${crane.maxBoom} m boom`,
    href: `/fleet?crane=${encodeURIComponent(crane.id)}`,
    score: scoreFields(query, [{ value: crane.id, weight: 130 }, { value: crane.model, weight: 125 }, { value: crane.manufacturer, weight: 80 }, { value: crane.category, weight: 60 }, ...crane.units.map((value) => ({ value, weight: 105 })), { value: crane.notes, weight: 20 }]),
  })).filter((result) => result.score > 0).sort(compareResults);
}

export function rankNotes(query: string, notes: WorkshopNote[]): UnifiedSearchResult[] {
  return notes.map((note) => ({
    type: 'note' as const, id: note.id, title: note.title,
    subtitle: [note.craneModel, note.systemCategory].filter(Boolean).join(' · ') || 'Workshop Note',
    detail: note.body.length > 120 ? `${note.body.slice(0, 117)}…` : note.body,
    href: `/notes?note=${encodeURIComponent(note.id)}`,
    score: scoreFields(query, [{ value: note.title, weight: 120 }, { value: note.craneModel, weight: 110 }, { value: note.pageReference, weight: 95 }, { value: note.documentTitle, weight: 80 }, { value: note.systemCategory, weight: 70 }, ...note.tags.map((value) => ({ value, weight: 75 })), { value: note.body, weight: 25 }]),
  })).filter((result) => result.score > 0).sort(compareResults);
}

function compareResults(a: UnifiedSearchResult, b: UnifiedSearchResult): number {
  return b.score - a.score || a.title.localeCompare(b.title) || a.type.localeCompare(b.type) || a.id.localeCompare(b.id);
}

export function mergeRankedResults(...groups: UnifiedSearchResult[][]): UnifiedSearchResult[] {
  return groups.flat().sort(compareResults);
}
