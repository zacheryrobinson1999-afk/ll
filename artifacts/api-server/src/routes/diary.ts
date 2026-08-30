import { and, desc, eq, gte, ilike, lte, or, sql, type SQL } from 'drizzle-orm';
import { Router } from 'express';
import { db, diaryEntries, workshopNotes } from '@workspace/db';
import { requireAuth } from '../middleware/auth';
import { requireSameOrigin } from '../middleware/sameOrigin';
import { isDiaryId, readDiaryInput, readDiaryRange, withDiaryOwner } from '../lib/diaryValidation';

const router = Router();

async function ownsLinkedNote(noteId: string | null, technicianId: string): Promise<boolean> {
  if (!noteId) return true;
  const [note] = await db.select({ id: workshopNotes.id }).from(workshopNotes)
    .where(and(eq(workshopNotes.id, noteId), eq(workshopNotes.technicianId, technicianId))).limit(1);
  return Boolean(note);
}

router.get('/diary', requireAuth, async (req, res, next) => {
  try {
    const range = readDiaryRange(req.query.from, req.query.to);
    const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const crane = typeof req.query.crane === 'string' ? req.query.crane.trim() : '';
    const system = typeof req.query.system === 'string' ? req.query.system.trim() : '';
    const followUp = req.query.followUp;
    const entryId = typeof req.query.entry === 'string' ? req.query.entry : '';
    if (!range || query.length > 200 || crane.length > 160 || system.length > 120 || (entryId && !isDiaryId(entryId)) || (followUp !== undefined && followUp !== 'true' && followUp !== 'false')) {
      res.status(400).json({ error: 'Invalid diary filters or date range' }); return;
    }
    const conditions: SQL[] = [
      eq(diaryEntries.technicianId, req.auth!.technicianId),
    ];
    if (entryId) conditions.push(eq(diaryEntries.id, entryId));
    else conditions.push(gte(diaryEntries.workDate, range.from), lte(diaryEntries.workDate, range.to));
    if (query) conditions.push(or(
      ilike(diaryEntries.title, `%${query}%`), ilike(diaryEntries.craneModel, `%${query}%`), ilike(diaryEntries.systemCategory, `%${query}%`),
      ilike(diaryEntries.faultSymptom, `%${query}%`), ilike(diaryEntries.diagnosis, `%${query}%`), ilike(diaryEntries.workPerformed, `%${query}%`),
      ilike(diaryEntries.partsUsed, `%${query}%`), ilike(diaryEntries.outcome, `%${query}%`), ilike(diaryEntries.followUpNotes, `%${query}%`),
      sql`array_to_string(${diaryEntries.tags}, ' ') ILIKE ${`%${query}%`}`,
    )!);
    if (crane) conditions.push(or(eq(diaryEntries.craneId, crane), ilike(diaryEntries.craneModel, `%${crane}%`))!);
    if (system) conditions.push(eq(diaryEntries.systemCategory, system));
    if (followUp !== undefined) conditions.push(eq(diaryEntries.followUpRequired, followUp === 'true'));
    const entries = await db.select().from(diaryEntries).where(and(...conditions)).orderBy(desc(diaryEntries.workDate), desc(diaryEntries.updatedAt)).limit(500);
    res.json({ entries, range });
  } catch (error) { next(error); }
});

router.post('/diary', requireAuth, requireSameOrigin, async (req, res, next) => {
  try {
    const input = readDiaryInput(req.body);
    if (!input) { res.status(400).json({ error: 'Invalid diary entry' }); return; }
    if (!await ownsLinkedNote(input.workshopNoteId, req.auth!.technicianId)) { res.status(400).json({ error: 'Invalid linked workshop note' }); return; }
    const [entry] = await db.insert(diaryEntries).values(withDiaryOwner(input, req.auth!.technicianId)).returning();
    res.status(201).json({ entry });
  } catch (error) { next(error); }
});

router.put('/diary/:id', requireAuth, requireSameOrigin, async (req, res, next) => {
  try {
    const id = req.params.id;
    const input = readDiaryInput(req.body);
    if (!isDiaryId(id)) { res.status(404).json({ error: 'Diary entry not found' }); return; }
    if (!input) { res.status(400).json({ error: 'Invalid diary entry' }); return; }
    if (!await ownsLinkedNote(input.workshopNoteId, req.auth!.technicianId)) { res.status(400).json({ error: 'Invalid linked workshop note' }); return; }
    const [entry] = await db.update(diaryEntries).set({ ...input, updatedAt: new Date() })
      .where(and(eq(diaryEntries.id, id), eq(diaryEntries.technicianId, req.auth!.technicianId))).returning();
    if (!entry) { res.status(404).json({ error: 'Diary entry not found' }); return; }
    res.json({ entry });
  } catch (error) { next(error); }
});

router.delete('/diary/:id', requireAuth, requireSameOrigin, async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!isDiaryId(id)) { res.status(404).json({ error: 'Diary entry not found' }); return; }
    const [entry] = await db.delete(diaryEntries).where(and(eq(diaryEntries.id, id), eq(diaryEntries.technicianId, req.auth!.technicianId))).returning({ id: diaryEntries.id });
    if (!entry) { res.status(404).json({ error: 'Diary entry not found' }); return; }
    res.status(204).end();
  } catch (error) { next(error); }
});

export default router;
