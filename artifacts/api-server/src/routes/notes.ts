import { and, desc, eq } from 'drizzle-orm';
import { Router } from 'express';
import { db, workshopNotes } from '@workspace/db';

import { requireAuth } from '../middleware/auth';
import { requireSameOrigin } from '../middleware/sameOrigin';

const router = Router();
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type NoteInput = {
  title: string;
  body: string;
  craneModel: string | null;
  systemCategory: string | null;
  documentId: string | null;
  documentTitle: string | null;
  pageReference: string | null;
  tags: string[];
};

function optionalText(value: unknown, max: number): string | null | undefined {
  if (value === undefined || value === null || value === '') return value === undefined ? undefined : null;
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed && trimmed.length <= max ? trimmed : undefined;
}

export function readNoteInput(value: unknown): NoteInput | null {
  if (!value || typeof value !== 'object') return null;
  const input = value as Record<string, unknown>;
  const title = typeof input.title === 'string' ? input.title.trim() : '';
  const body = typeof input.body === 'string' ? input.body.trim() : '';
  if (!title || title.length > 160 || !body || body.length > 20_000) return null;
  const craneModel = optionalText(input.craneModel, 120);
  const systemCategory = optionalText(input.systemCategory, 120);
  const documentId = optionalText(input.documentId, 160);
  const documentTitle = optionalText(input.documentTitle, 300);
  const pageReference = optionalText(input.pageReference, 160);
  if ([craneModel, systemCategory, documentId, documentTitle, pageReference].some((item) => item === undefined)) return null;
  if (!Array.isArray(input.tags) || input.tags.length > 20) return null;
  const tags = [...new Set(input.tags.map((tag) => typeof tag === 'string' ? tag.trim() : '').filter(Boolean))];
  if (tags.some((tag) => tag.length > 50)) return null;
  return { title, body, craneModel: craneModel ?? null, systemCategory: systemCategory ?? null, documentId: documentId ?? null, documentTitle: documentTitle ?? null, pageReference: pageReference ?? null, tags };
}

router.get('/notes', requireAuth, async (req, res, next) => {
  try {
    const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    if (query.length > 200) { res.status(400).json({ error: 'Search query is too long' }); return; }
    const ownedNotes = await db.select().from(workshopNotes)
      .where(eq(workshopNotes.technicianId, req.auth!.technicianId))
      .orderBy(desc(workshopNotes.updatedAt));
    const terms = query.toLocaleLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean);
    const notes = query && !terms.length ? [] : terms.length ? ownedNotes.filter((note) => {
      const values = [note.title, note.body, note.craneModel, note.systemCategory, note.documentTitle, note.pageReference, ...note.tags];
      const searchable = values.filter(Boolean).join(' ').toLocaleLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, ' ');
      const compact = searchable.replace(/\s+/g, '');
      return terms.every((term) => searchable.includes(term) || compact.includes(term));
    }) : ownedNotes;
    res.json({ notes });
  } catch (error) { next(error); }
});

router.post('/notes', requireAuth, requireSameOrigin, async (req, res, next) => {
  try {
    const input = readNoteInput(req.body);
    if (!input) { res.status(400).json({ error: 'Invalid note' }); return; }
    const [note] = await db.insert(workshopNotes).values({ ...input, technicianId: req.auth!.technicianId }).returning();
    res.status(201).json({ note });
  } catch (error) { next(error); }
});

router.put('/notes/:id', requireAuth, requireSameOrigin, async (req, res, next) => {
  try {
    const id = req.params.id;
    if (typeof id !== 'string' || !UUID_PATTERN.test(id)) { res.status(404).json({ error: 'Note not found' }); return; }
    const input = readNoteInput(req.body);
    if (!input) { res.status(400).json({ error: 'Invalid note' }); return; }
    const [note] = await db.update(workshopNotes).set({ ...input, updatedAt: new Date() })
      .where(and(eq(workshopNotes.id, id), eq(workshopNotes.technicianId, req.auth!.technicianId))).returning();
    if (!note) { res.status(404).json({ error: 'Note not found' }); return; }
    res.json({ note });
  } catch (error) { next(error); }
});

router.delete('/notes/:id', requireAuth, requireSameOrigin, async (req, res, next) => {
  try {
    const id = req.params.id;
    if (typeof id !== 'string' || !UUID_PATTERN.test(id)) { res.status(404).json({ error: 'Note not found' }); return; }
    const [note] = await db.delete(workshopNotes)
      .where(and(eq(workshopNotes.id, id), eq(workshopNotes.technicianId, req.auth!.technicianId)))
      .returning({ id: workshopNotes.id });
    if (!note) { res.status(404).json({ error: 'Note not found' }); return; }
    res.status(204).end();
  } catch (error) { next(error); }
});

export default router;
