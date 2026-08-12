import { asc, eq } from 'drizzle-orm';
import { Router } from 'express';
import { db, technicians } from '@workspace/db';
import { createTechnician, listDaycodeUsage, readTechnicianInput, readTechnicianPatch, resetTechnicianCode, toSafeTechnician, updateTechnician } from '../lib/adminService';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { requireSameOrigin } from '../middleware/sameOrigin';

const router = Router();
router.use(requireAuth, requireAdmin);

function validId(value: unknown): value is string { return typeof value === 'string' && /^[0-9a-f-]{36}$/i.test(value); }
function duplicate(error: unknown): boolean { return typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === '23505'; }

router.get('/admin/technicians', async (_req, res, next) => {
  try { res.json({ technicians: (await db.select().from(technicians).orderBy(asc(technicians.name))).map(toSafeTechnician) }); } catch (error) { next(error); }
});
router.post('/admin/technicians', requireSameOrigin, async (req, res, next) => {
  try { res.status(201).json({ technician: await createTechnician(readTechnicianInput(req.body)) }); }
  catch (error) { if (duplicate(error)) { res.status(409).json({ error: 'A technician with that name or access code already exists' }); return; } if (error instanceof Error) { res.status(400).json({ error: error.message }); return; } next(error); }
});
router.patch('/admin/technicians/:id', requireSameOrigin, async (req, res, next) => {
  try { if (!validId(req.params.id)) { res.status(400).json({ error: 'Invalid technician id' }); return; } const technician = await updateTechnician(req.auth!.technicianId, req.params.id, readTechnicianPatch(req.body)); if (!technician) { res.status(404).json({ error: 'Technician not found' }); return; } res.json({ technician }); }
  catch (error) { if (duplicate(error)) { res.status(409).json({ error: 'A technician with that name already exists' }); return; } if (error instanceof Error) { const status = /administrator account|active administrator/.test(error.message) ? 409 : 400; res.status(status).json({ error: error.message }); return; } next(error); }
});
router.post('/admin/technicians/:id/reset-code', requireSameOrigin, async (req, res, next) => {
  try { if (!validId(req.params.id)) { res.status(400).json({ error: 'Invalid technician id' }); return; } const code = req.body && typeof req.body.accessCode === 'string' ? req.body.accessCode : ''; const technician = await resetTechnicianCode(req.params.id, code); if (!technician) { res.status(404).json({ error: 'Technician not found' }); return; } res.json({ technician }); }
  catch (error) { if (duplicate(error)) { res.status(409).json({ error: 'That access code is already assigned' }); return; } if (error instanceof Error) { res.status(400).json({ error: error.message }); return; } next(error); }
});
router.get('/admin/daycode-usage', async (req, res, next) => {
  try { const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100); const offset = Math.max(Number(req.query.offset) || 0, 0); const date = (value: unknown) => typeof value === 'string' && !Number.isNaN(Date.parse(value)) ? new Date(value) : undefined; const outcome = req.query.outcome === 'success' || req.query.outcome === 'denied' || req.query.outcome === 'validation_failed' ? req.query.outcome : undefined; const usage = await listDaycodeUsage({ technician: typeof req.query.technician === 'string' ? req.query.technician.slice(0, 160) : undefined, serial: typeof req.query.serial === 'string' ? req.query.serial.slice(0, 32) : undefined, outcome, from: date(req.query.from), to: date(req.query.to), limit, offset }); res.json({ usage, limit, offset, hasMore: usage.length === limit }); } catch (error) { next(error); }
});
export default router;
