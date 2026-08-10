import { Router } from 'express';
import multer from 'multer';
import { uploadToB2, getPresignedUrl } from '../lib/b2Storage.js';
import { listByCrane, addDoc } from '../lib/metaStore.js';

const router = Router();

// Accept files up to 50 MB, stored in memory before streaming to B2
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

/**
 * GET /api/uploads/:craneId
 * Returns all uploaded docs for a crane with fresh pre-signed download URLs.
 */
router.get('/uploads/:craneId', async (req, res) => {
  try {
    const docs = await listByCrane(req.params['craneId'] ?? '');
    const withUrls = await Promise.all(
      docs.map(async (doc) => ({
        ...doc,
        url: await getPresignedUrl(doc.key),
      })),
    );
    res.json(withUrls);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list documents' });
  }
});

/**
 * POST /api/uploads/:craneId
 * Accepts multipart/form-data with a `file` field (and optional `name`).
 * Uploads to B2, stores metadata, and returns the new doc with a pre-signed URL.
 */
router.post('/uploads/:craneId', upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: 'No file provided' });
    return;
  }

  const craneId = String(req.params['craneId'] ?? '');
  const body = req.body as { name?: string };
  const displayName = body.name?.trim() || file.originalname;

  // Sanitise the original filename for use as a B2 key segment
  const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
  const key = `uploads/${craneId}/${Date.now()}-${safeName}`;

  try {
    await uploadToB2(file.buffer, key, file.mimetype);
    const doc = await addDoc(craneId, displayName, key, file.mimetype, file.size);
    const url = await getPresignedUrl(doc.key);
    res.status(201).json({ ...doc, url });
  } catch (err) {
    console.error('[uploads] upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;
