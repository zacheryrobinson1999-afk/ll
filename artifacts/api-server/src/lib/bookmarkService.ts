import { and, desc, eq } from 'drizzle-orm';
import { db, manualBookmarks } from '@workspace/db';
import { TECH_DOCS } from './catalog/techDocs';
import { recordActivity, type ActivityInput } from './activityService';

export type BookmarkInput = { documentId: string; sectionRef: string; pageRef: string };
export function parseBookmark(value: unknown): BookmarkInput | null {
  if (!value || typeof value !== 'object') return null;
  const input = value as Record<string, unknown>;
  const doc = TECH_DOCS.find((item) => item.id === input.documentId);
  if (!doc) return null;
  const sectionRef = input.sectionRef ?? ''; const pageRef = input.pageRef ?? '';
  if (typeof sectionRef !== 'string' || typeof pageRef !== 'string') return null;
  if (sectionRef && !doc.sections.some((section) => section.ref === sectionRef)) return null;
  if (pageRef && (!/^[1-9]\d{0,4}$/.test(pageRef) || (doc.pages !== undefined && Number(pageRef) > doc.pages))) return null;
  return { documentId: doc.id, sectionRef, pageRef };
}
export function createBookmarkService(database: Pick<typeof db, 'select' | 'insert' | 'delete'> = db,
  record: (owner: string, event: ActivityInput) => Promise<void> = recordActivity) {
  return {
    async list(owner: string) {
      return database.select().from(manualBookmarks).where(eq(manualBookmarks.technicianId, owner))
        .orderBy(desc(manualBookmarks.createdAt), desc(manualBookmarks.id));
    },
    async add(owner: string, input: BookmarkInput) {
      const [created] = await database.insert(manualBookmarks).values({ ...input, technicianId: owner })
        .onConflictDoNothing().returning();
      if (created) {
        await record(owner, { type: 'bookmark_added', entityType: 'document', entityId: input.documentId });
        return created;
      }
      const [existing] = await database.select().from(manualBookmarks).where(and(
        eq(manualBookmarks.technicianId, owner), eq(manualBookmarks.documentId, input.documentId),
        eq(manualBookmarks.sectionRef, input.sectionRef), eq(manualBookmarks.pageRef, input.pageRef)));
      return existing;
    },
    async remove(owner: string, id: string) {
      const [removed] = await database.delete(manualBookmarks).where(and(
        eq(manualBookmarks.technicianId, owner), eq(manualBookmarks.id, id))).returning();
      if (removed) await record(owner, { type: 'bookmark_removed', entityType: 'document', entityId: removed.documentId });
      return Boolean(removed);
    },
  };
}
export const bookmarkService = createBookmarkService();
