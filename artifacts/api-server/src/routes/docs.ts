import { Router } from 'express';
import { getFromB2 } from '../lib/b2Storage.js';
import { requireAuth } from '../middleware/auth.js';

type DocumentGetter = typeof getFromB2;

/**
 * GET /api/docs/:filename
 *
 * Render retrieves the document from Backblaze B2
 * and streams it directly to the browser.
 *
 * B2 key:
 * docs/<filename>
 */
export function createDocsRouter(getDocument: DocumentGetter = getFromB2): Router {
  const docsRouter = Router();

  docsRouter.get('/docs/:filename', requireAuth, async (req, res) => {
  const filename = req.params['filename'];

  if (
    typeof filename !== 'string' ||
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
    const result = await getDocument(key);

    if (!result.Body) {
      res.status(404).json({
        error: 'Document not found',
      });
      return;
    }

    res.setHeader(
      'Content-Type',
      result.ContentType || 'application/pdf',
    );
    res.setHeader('Cache-Control', 'private, no-store');

    if (result.ContentLength !== undefined) {
      res.setHeader(
        'Content-Length',
        String(result.ContentLength),
      );
    }

    res.setHeader(
      'Content-Disposition',
      `inline; filename="${filename.replace(/"/g, '')}"`,
    );

    const body = result.Body as NodeJS.ReadableStream;

    body.on('error', (err) => {
      console.error('[B2] document stream error:', err);

      if (!res.headersSent) {
        res.status(500).json({
          error: 'Failed to read document',
        });
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

  return docsRouter;
}

const protectedDocsRouter = createDocsRouter();

export default protectedDocsRouter;
