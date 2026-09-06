import { randomUUID } from 'node:crypto';
import { and, desc, eq } from 'drizzle-orm';
import { db, activityEvents } from '@workspace/db';

export type ActivityInput = {
  type: 'manual_opened' | 'bookmark_added' | 'bookmark_removed' | 'crane_viewed';
  entityType: 'document' | 'crane'; entityId: string; craneId?: string;
  metadata?: Record<string, string>;
};
export function activityDedupKey(event: ActivityInput, now: Date) {
  return event.type === 'manual_opened' || event.type === 'crane_viewed'
    ? JSON.stringify([event.type, event.entityId, Math.floor(now.getTime() / 300_000)]) : randomUUID();
}
export function createActivityService(database: Pick<typeof db, 'select' | 'insert'> = db) {
  return {
    async record(owner: string, event: ActivityInput, now = new Date()) {
      await database.insert(activityEvents).values({ ...event, technicianId: owner,
        dedupKey: activityDedupKey(event, now), createdAt: now }).onConflictDoNothing();
    },
    async list(owner: string, craneId?: string) {
      return database.select().from(activityEvents).where(and(eq(activityEvents.technicianId, owner),
        craneId ? eq(activityEvents.craneId, craneId) : undefined))
        .orderBy(desc(activityEvents.createdAt), desc(activityEvents.id)).limit(10);
    },
  };
}
export const activityService = createActivityService();
// Activity must never prevent a manual from opening or a core workflow from succeeding.
export async function recordActivity(owner: string, event: ActivityInput) {
  try { await activityService.record(owner, event); }
  catch { console.error('[activity] Unable to record event'); }
}
