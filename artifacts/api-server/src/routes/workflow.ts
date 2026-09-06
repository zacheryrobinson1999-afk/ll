import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireSameOrigin } from '../middleware/sameOrigin';
import { bookmarkService, parseBookmark } from '../lib/bookmarkService';
import { activityService, recordActivity } from '../lib/activityService';
import { fleetService } from '../lib/fleetService';
import { FLEET } from '../lib/catalog/craneFleet';

export function createWorkflowRouter(bookmarks = bookmarkService, activity = activityService, fleet = fleetService) {
  const router = Router();
  router.get('/bookmarks', requireAuth, async (req, res) => {
    res.setHeader('Cache-Control', 'private, no-store');
    res.json({ bookmarks: await bookmarks.list(req.auth!.technicianId) });
  });
  router.post('/bookmarks', requireAuth, requireSameOrigin, async (req, res) => {
    const input = parseBookmark(req.body);
    if (!input) { res.status(400).json({ error: 'Invalid document or reference' }); return; }
    res.json({ bookmark: await bookmarks.add(req.auth!.technicianId, input) });
  });
  router.delete('/bookmarks/:id', requireAuth, requireSameOrigin, async (req, res) => {
    const id = req.params.id;
    if (typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      res.status(404).json({ error: 'Bookmark not found' }); return;
    }
    if (!await bookmarks.remove(req.auth!.technicianId, id)) { res.status(404).json({ error: 'Bookmark not found' }); return; }
    res.sendStatus(204);
  });
  router.get('/activity', requireAuth, async (req, res) => {
    const craneId = req.query.craneId;
    if (craneId !== undefined && (typeof craneId !== 'string' || !FLEET.some((crane) => crane.id === craneId))) {
      res.status(400).json({ error: 'Invalid crane' }); return;
    }
    res.setHeader('Cache-Control', 'private, no-store');
    res.json({ activity: await activity.list(req.auth!.technicianId, craneId as string | undefined) });
  });
  router.get('/fleet/:id', requireAuth, async (req, res) => {
    const result = typeof req.params.id === 'string' ? await fleet.get(req.auth!.technicianId, req.params.id) : null;
    if (!result) { res.status(404).json({ error: 'Crane not found' }); return; }
    res.setHeader('Cache-Control', 'private, no-store');
    res.json(result);
  });
  // Explicit view action, separate from data reads/refetches. Never accepts event payloads.
  router.post('/fleet/:id/view', requireAuth, requireSameOrigin, async (req, res) => {
    const crane = FLEET.find((item) => item.id === req.params.id);
    if (!crane) { res.status(404).json({ error: 'Crane not found' }); return; }
    await recordActivity(req.auth!.technicianId, { type: 'crane_viewed', entityType: 'crane', entityId: crane.id, craneId: crane.id });
    res.sendStatus(204);
  });
  return router;
}
export default createWorkflowRouter();
