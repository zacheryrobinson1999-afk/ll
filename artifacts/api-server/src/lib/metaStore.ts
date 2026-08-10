/**
 * Simple JSON-file metadata store for crane-specific uploaded documents.
 * Persists to  artifacts/api-server/data/uploads.json  on the server filesystem.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../../data');
const META_FILE = path.join(DATA_DIR, 'uploads.json');

export type UploadedDoc = {
  id: string;
  craneId: string;
  /** Display name shown in the app */
  name: string;
  /** B2 object key (not a URL) */
  key: string;
  mimeType: string;
  /** File size in bytes */
  size: number;
  uploadedAt: string; // ISO-8601
};

async function readAll(): Promise<UploadedDoc[]> {
  try {
    const raw = await fs.readFile(META_FILE, 'utf-8');
    return JSON.parse(raw) as UploadedDoc[];
  } catch {
    return [];
  }
}

async function writeAll(docs: UploadedDoc[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(META_FILE, JSON.stringify(docs, null, 2), 'utf-8');
}

export async function listByCrane(craneId: string): Promise<UploadedDoc[]> {
  const all = await readAll();
  return all.filter((d) => d.craneId === craneId);
}

export async function addDoc(
  craneId: string,
  name: string,
  key: string,
  mimeType: string,
  size: number,
): Promise<UploadedDoc> {
  const all = await readAll();
  const doc: UploadedDoc = {
    id: randomUUID(),
    craneId,
    name,
    key,
    mimeType,
    size,
    uploadedAt: new Date().toISOString(),
  };
  all.push(doc);
  await writeAll(all);
  return doc;
}

export async function removeDoc(id: string): Promise<UploadedDoc | null> {
  const all = await readAll();
  const idx = all.findIndex((d) => d.id === id);
  if (idx === -1) return null;
  const [removed] = all.splice(idx, 1);
  await writeAll(all);
  return removed ?? null;
}
