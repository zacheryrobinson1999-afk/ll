import { Router } from 'express';
import multer from 'multer';
import { uploadToB2 } from '../lib/b2Storage.js';
import { listByCrane, addDoc } from '../lib/metaStore.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

/**
 * GET /api/uploads/:craneId
 *
 * Returns uploaded documents using Render URLs,
 * not direct Backblaze URLs.
 */
router.get('/uploads/:craneId', async (req, res) => {
  try {
    const craneId = req.params['craneId'] ?? '';

    const docs = await listByCrane(craneId);

    const withUrls = docs.map((doc) => ({
      ...doc,
      url: `/api/uploads/${encodeURIComponent(craneId)}/file/${encodeURIComponent(
        doc.key,
      )}`,
    }));

    res.json(withUrls);
  } catch (err) {
    console.error('[uploads] list error:', err);

    res.status(500).json({
      error: 'Failed to list documents',
    });
  }
});

/**
 * GET /api/uploads/:craneId/file/:key
 *
 * Retrieves an uploaded file from B2 and streams it
 * through Render to the browser.
 */
router.get(
  '/uploads/:craneId/file/*splat',
  async (req, res) => {
    try {
      const key = String(req.params.splat ?? '');

      if (!key || key.includes('..')) {
        res.status(400).json({
          error: 'Invalid document key',
        });
        return;
      }

      const { getFromB2 } = await import('../lib/b2Storage.js');

      const result = await getFromB2(key);

      if (!result.Body) {
        res.status(404).json({
          error: 'Document not found',
        });
        return;
      }

      res.setHeader(
        'Content-Type',
        result.ContentType || 'application/octet-stream',
      );

      if (result.ContentLength !== undefined) {
        res.setHeader(
          'Content-Length',
          String(result.ContentLength),
        );
      }

      const body = result.Body as NodeJS.ReadableStream;

      body.on('error', (err) => {
        console.error('[B2] upload stream error:', err);

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
      console.error('[uploads] download error:', err);

      res.status(404).json({
        error: 'Document not found',
      });
    }
  },
);

/**
 * POST /api/uploads/:craneId
 */
router.post(
  '/uploads/:craneId',
  upload.single('file'),
  async (req, res) => {
    const file = req.file;

    if (!file) {
      res.status(400).json({
        error: 'No file provided',
      });
      return;
    }

    const craneId = String(req.params['craneId'] ?? '');

    const body = req.body as {
      name?: string;
    };

    const displayName =
      body.name?.trim() || file.originalname;

    const safeName = file.originalname.replace(
      /[^a-zA-Z0-9._-]/g,
      '_',
    );

    const key = `uploads/${craneId}/${Date.now()}-${safeName}`;

    try {
      await uploadToB2(
        file.buffer,
        key,
        file.mimetype,
      );

      const doc = await addDoc(
        craneId,
        displayName,
        key,
        file.mimetype,
        file.size,
      );

      const url =
        `/api/uploads/${encodeURIComponent(
          craneId,
        )}/file/${encodeURIComponent(doc.key)}`;

      res.status(201).json({
        ...doc,
        url,
      });
    } catch (err) {
      console.error(
        '[uploads] upload error:',
        err,
      );

      res.status(500).json({
        error: 'Upload failed',
      });
    }
  },
);

export default router;
