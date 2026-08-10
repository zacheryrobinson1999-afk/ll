import { Router } from 'express';
import { getPresignedUrl } from '../lib/b2Storage.js';

const router = Router();

/**
 * GET /api/docs/:filename
 *
 * Generates a short-lived pre-signed B2 URL for a reference document and
 * issues a 302 redirect so the client (mobile app or browser) fetches the
 * file directly from B2.
 *
 * B2 key convention: docs/<filename>
 * e.g. /api/docs/liccon1-diagnostics.pdf → B2 key: docs/liccon1-diagnostics.pdf
 */
router.get('/docs/:filename', async (req, res) => {
  const filename = req.params['filename'];
  if (!filename || filename.includes('..') || filename.includes('/')) {
    res.status(400).json({ error: 'Invalid filename' });
    return;
  }

  const key = `docs/${filename}`;

  try {
    const url = await getPresignedUrl(key, 3600);
    res.redirect(302, url);
  } catch (err) {
    res.status(404).json({ error: 'Document not found' });
  }
});

export default router;
