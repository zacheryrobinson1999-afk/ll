import { desc, eq } from 'drizzle-orm';
import { db, workshopNotes } from '@workspace/db';
import { FLEET } from './catalog/craneFleet';
import { relatedManuals, sameModel } from './catalog/fleetRelevance';
import { activityService } from './activityService';
import { bookmarkService } from './bookmarkService';

export function createFleetService(database: Pick<typeof db, 'select'> = db,
  activity = activityService, bookmarks = bookmarkService) {
  return {
    async get(owner: string, id: string) {
      const crane = FLEET.find((item) => item.id === id);
      if (!crane) return null;
      const manuals = relatedManuals(crane);
      const [notes, events, saved] = await Promise.allSettled([
        database.select({ id: workshopNotes.id, title: workshopNotes.title, craneModel: workshopNotes.craneModel,
          updatedAt: workshopNotes.updatedAt }).from(workshopNotes)
          .where(eq(workshopNotes.technicianId, owner)).orderBy(desc(workshopNotes.updatedAt)),
        activity.list(owner, id), bookmarks.list(owner),
      ]);
      return { crane, manuals,
        notes: notes.status === 'fulfilled' ? notes.value.filter((note) => sameModel(note.craneModel, crane)).slice(0, 10) : [],
        activity: events.status === 'fulfilled' ? events.value : [],
        bookmarks: saved.status === 'fulfilled' ? saved.value.filter((bookmark) => manuals.some((manual) => manual.documentId === bookmark.documentId)) : [],
        unavailable: [notes.status === 'rejected' ? 'notes' : '', events.status === 'rejected' ? 'activity' : '', saved.status === 'rejected' ? 'bookmarks' : ''].filter(Boolean),
      };
    },
  };
}
export const fleetService = createFleetService();
