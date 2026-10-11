import { compactSearch } from './searchNormalization';
import { manualModels, manufacturerGroup, manualCategories, type LibraryDocument, type LibraryFleet } from './manualLibrary';

export function resolveManual<T extends LibraryDocument>(docs: readonly T[], id?: string | null): T | undefined {
  return docs.find(doc => doc.id === id);
}
export function verifiedPdfPage(doc: LibraryDocument, raw?: string | number | null): string {
  const page = typeof raw === 'number' ? raw : raw && /^\d+$/.test(raw) ? Number(raw) : 0;
  return Number.isInteger(page) && page > 0 && (!doc.pages || page <= doc.pages) ? String(page) : '';
}
export function sectionPdfPage(doc: LibraryDocument, section: { ref?: string; pdfPage?: number }): string {
  const explicit = section.pdfPage ?? (/^\s*(?:PDF\s+)?p\.\s*(\d+)\s*$/i.exec(section.ref ?? '') ? Number(/^\s*(?:PDF\s+)?p\.\s*(\d+)\s*$/i.exec(section.ref ?? '')![1]) : 0);
  return verifiedPdfPage(doc, explicit);
}
export function manualDetailHref(id: string, options: { from?: string; section?: string; page?: string } = {}): string {
  const query = new URLSearchParams({ document: id });
  for (const [key, value] of Object.entries(options)) if (value) query.set(key, value);
  return `/docs?${query}`;
}
export function manualMetadata(doc: LibraryDocument, fleet: readonly LibraryFleet[] = []) {
  return { title: doc.title, manufacturer: manufacturerGroup(doc), system: doc.system,
    models: manualModels(doc, fleet), type: doc.documentType || manualCategories(doc).join(' / '),
    code: doc.docNumber || doc.bookCode, year: doc.year, subtitle: doc.subtitle, summary: doc.summary };
}
/** Broad system/family labels are not evidence of model compatibility. */
function explicitModels(doc: LibraryDocument): string[] {
  return doc.craneTypes.filter(model => /[a-z]/i.test(model) && /\d/.test(model)).map(compactSearch);
}
export function relatedManuals<T extends LibraryDocument>(current: T, docs: readonly T[], limit = 6): T[] {
  const models = explicitModels(current);
  return docs.filter(doc => doc.id !== current.id).map(doc => {
    const fleet = doc.appliesTo.some(id => current.appliesTo.includes(id));
    const model = explicitModels(doc).some(value => models.includes(value));
    return { doc, score: (fleet ? 100 : 0) + (model ? 50 : 0) + (model && doc.system === current.system ? 10 : 0) };
  }).filter(item => item.score > 0).sort((a, b) => b.score - a.score || a.doc.title.localeCompare(b.doc.title) || a.doc.id.localeCompare(b.doc.id))
    .slice(0, Math.max(0, limit)).map(item => item.doc);
}
export interface ManualActivity { entityId: string; type?: string; entityType?: string; createdAt?: string }
export function recentManuals<T extends LibraryDocument>(docs: readonly T[], events: readonly ManualActivity[], limit = 6): { doc: T; openedAt?: string }[] {
  const sorted = events.filter(event => (!event.type || event.type === 'manual_opened') && (!event.entityType || event.entityType === 'document'))
    .map((event, index) => ({ event, index })).sort((a, b) => (Date.parse(b.event.createdAt ?? '') || 0) - (Date.parse(a.event.createdAt ?? '') || 0) || a.index - b.index);
  const seen = new Set<string>();
  const result: { doc: T; openedAt?: string }[] = [];
  for (const { event } of sorted) {
    const doc = resolveManual(docs, event.entityId);
    if (!doc || seen.has(doc.id)) continue;
    seen.add(doc.id); result.push({ doc, openedAt: event.createdAt });
  }
  return result.slice(0, Math.max(0, limit));
}
export interface ManualBookmark { documentId: string; sectionRef?: string; pageRef?: string; createdAt?: string }
export function bookmarkedManuals<T extends LibraryDocument>(docs: readonly T[], bookmarks: readonly ManualBookmark[], limit = 6): T[] {
  return recentManuals(docs, bookmarks.filter(bookmark => !bookmark.sectionRef && !bookmark.pageRef)
    .map(bookmark => ({ entityId: bookmark.documentId, createdAt: bookmark.createdAt })), limit).map(item => item.doc);
}
export function bookmarksInManual<T extends ManualBookmark>(bookmarks: readonly T[], id: string): T[] {
  return bookmarks.filter(bookmark => bookmark.documentId === id && Boolean(bookmark.sectionRef || bookmark.pageRef));
}
export function bookmarkedSections<T extends LibraryDocument, B extends ManualBookmark>(docs: readonly T[], bookmarks: readonly B[]) {
  const seen = new Set<string>();
  return bookmarks.flatMap(bookmark => {
    const doc = resolveManual(docs, bookmark.documentId);
    const section = doc?.sections.find(item => item.ref === bookmark.sectionRef);
    if (!doc || !section) return [];
    const key = `${doc.id}\u0000${section.ref}\u0000${sectionPdfPage(doc, section)}`;
    if (seen.has(key)) return [];
    seen.add(key);
    return [{ bookmark, doc, section, page: sectionPdfPage(doc, section) }];
  });
}
export function noteReference(section?: string | null, page?: string | null): string | null {
  return [section ? `Section ${section}` : '', page ? `Page ${page}` : ''].filter(Boolean).join(' · ').slice(0, 160) || null;
}
export function manualNoteHref(id: string, section?: string, page?: string): string {
  const query = new URLSearchParams({ document: id });
  if (section) query.set('section', section);
  if (page) query.set('page', page);
  return `/notes?${query}`;
}
/** Return destinations are local app routes only. */
export function manualReturnPath(value?: string | null): string {
  return value && /^\/(docs|search|fleet|bookmarks|maintenance)(\?|\/|$)/.test(value) && !/[\\\r\n]/.test(value) ? value : '/docs';
}
