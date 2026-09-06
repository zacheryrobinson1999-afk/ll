import { and, eq, gte, lte, sql } from 'drizzle-orm';
import { db, diaryEntries } from '@workspace/db';
import type { DiaryStore } from './diaryService';

export function createDiaryStore(database: Pick<typeof db, 'select' | 'insert'> = db): DiaryStore {
  return {
  async list(owner, range) {
    // Group complete dates; truncating job rows could hide a saved summary.
    return database.select().from(diaryEntries).where(and(eq(diaryEntries.technicianId, owner),
      gte(diaryEntries.workDate, range.from), lte(diaryEntries.workDate, range.to)));
  },
  async findDate(owner, id) {
    const [row] = await database.select({ date: diaryEntries.workDate }).from(diaryEntries)
      .where(and(eq(diaryEntries.technicianId, owner), eq(diaryEntries.id, id))).limit(1);
    return row?.date ?? null;
  },
  async save(owner, input) {
    // Atomic owner/date upsert; historical NULL-summary rows remain untouched.
    const [row] = await database.insert(diaryEntries).values({ technicianId: owner, workDate: input.date,
      dailySummary: input.summary, title: 'Daily summary', workPerformed: input.summary })
      .onConflictDoUpdate({ target: [diaryEntries.technicianId, diaryEntries.workDate],
        targetWhere: sql`${diaryEntries.dailySummary} IS NOT NULL`,
        set: { dailySummary: input.summary, workPerformed: input.summary, updatedAt: new Date() } }).returning();
    return row!;
  },
  };
}

export const diaryStore = createDiaryStore();
