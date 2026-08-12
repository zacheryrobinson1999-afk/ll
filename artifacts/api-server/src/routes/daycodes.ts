import { Router } from 'express';

import { hashClientIp } from '../lib/accessCodes';
import { recordDaycodeUsage } from '../lib/daycodeAudit';
import { generateAuditedDaycodes } from '../lib/daycodeService';
import { requireAuth } from '../middleware/auth';
import { requireSameOrigin } from '../middleware/sameOrigin';

const router = Router();

router.post('/daycodes/generate', requireAuth, requireSameOrigin, async (req, res, next) => {
  try {
    const body = req.body as { serial?: unknown; date?: unknown };
    const serial = typeof body.serial === 'string' ? body.serial : '';
    const date = typeof body.date === 'string' ? body.date : '';
    const auth = req.auth!;

    const result = await generateAuditedDaycodes(
      { serial, date },
      {
        technicianId: auth.technicianId,
        technicianName: auth.name,
        ipHash: hashClientIp(req.ip || 'unknown'),
      },
      recordDaycodeUsage,
    );

    res.json({ ...result, serial: serial.trim(), date });
  } catch (error) {
    if (error instanceof Error && /serial|date/.test(error.message)) {
      res.status(400).json({ error: error.message });
      return;
    }
    next(error);
  }
});

export default router;
