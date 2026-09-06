import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireSameOrigin } from '../middleware/sameOrigin';
import { isCalendarDate, isDiaryId, readDiaryInput, readDiaryRange } from '../lib/diaryValidation';
import { createDiaryService } from '../lib/diaryService';
import { diaryStore } from '../lib/diaryStore';

export function createDiaryRouter(service = createDiaryService(diaryStore)) {
  const router = Router();
  router.get('/diary', requireAuth, async (req, res, next) => {
    try {
      const owner = req.auth!.technicianId;
      if (req.query.date !== undefined) {
        if (typeof req.query.date !== 'string' || !isCalendarDate(req.query.date)) {
          res.status(400).json({ error: 'Invalid diary date' }); return;
        }
        res.json({ entry: await service.get(owner, req.query.date) }); return;
      }
      // Resolve old owner-scoped entry links to their whole date.
      if (req.query.entry !== undefined) {
        if (!isDiaryId(req.query.entry)) { res.status(400).json({ error: 'Invalid diary entry' }); return; }
        const date = await service.findDate(owner, req.query.entry);
        res.json({ entry: date ? await service.get(owner, date) : null }); return;
      }
      const range = readDiaryRange(req.query.from, req.query.to);
      if (!range) { res.status(400).json({ error: 'Invalid diary date range' }); return; }
      res.json({ entries: await service.list(owner, range), range });
    } catch (error) { next(error); }
  });
  router.post('/diary', requireAuth, requireSameOrigin, async (req, res, next) => {
    try {
      const input = readDiaryInput(req.body);
      if (!input) { res.status(400).json({ error: 'Enter a valid date and a daily summary of 1–20,000 characters' }); return; }
      res.json({ entry: await service.save(req.auth!.technicianId, input) });
    } catch (error) { next(error); }
  });
  router.put('/diary/:id', requireAuth, requireSameOrigin, async (req, res, next) => {
    try {
      if (!isDiaryId(req.params.id)) { res.status(404).json({ error: 'Diary entry not found' }); return; }
      const owner = req.auth!.technicianId;
      const date = await service.findDate(owner, req.params.id);
      if (!date) { res.status(404).json({ error: 'Diary entry not found' }); return; }
      const input = readDiaryInput(req.body);
      if (!input || input.date !== date) { res.status(400).json({ error: 'Save a summary for the existing date' }); return; }
      res.json({ entry: await service.save(owner, input) });
    } catch (error) { next(error); }
  });
  return router;
}

export default createDiaryRouter();
