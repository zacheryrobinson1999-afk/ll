import { Router } from 'express';
import { getFromB2 } from '../lib/b2Storage.js';

const router = Router();

router.get('/docs/:filename', async (req, res) => {
  const filename = req.params['filename'];

  if (
    !filename ||
    filename.includes('..') ||
    filename.includes('/') ||
    filename.includes('\\')
  ) {
    res.status(400).json({ error: 'Invalid filename' });
    return;
  }

  const key = `docs/${filename}`;

  try {
    const result = await getFromB2(key);

    if (!result.Body) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    if (result.ContentType) {
      res.setHeader('Content-Type', result.ContentType);
    } else {
      res.setHeader('Content-Type', 'application/pdf');
    }

    if (result.ContentLength !== undefined) {
      res.setHeader('Content-Length', String(result.ContentLength));
    }

    res.setHeader(
      'Content-Disposition',
      `inline; filename="${filename.replace(/"/g, '')}"`,
    );

    const body = result.Body as NodeJS.ReadableStream;

    body.on('error', (err) => {
      console.error('[B2] document stream error:', err);

      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to read document' });
      } else {
        res.destroy(err);
      }
    });

    body.pipe(res);
  } catch (err) {
    console.error('[B2] document error:', err);

    res.status(404).json({
      error: 'Document not found',
    });
  }
});

export default router;
