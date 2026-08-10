/**
 * Typed API helpers for the /api/uploads/:craneId endpoints.
 * No codegen needed — the API is simple enough to hand-type.
 */

export type UploadedDoc = {
  id: string;
  craneId: string;
  name: string;
  key: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  url: string;
};

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function fetchUploadedDocs(craneId: string): Promise<UploadedDoc[]> {
  const res = await fetch(`/api/uploads/${encodeURIComponent(craneId)}`);
  if (!res.ok) throw new Error(`Failed to fetch uploads: ${res.status}`);
  return res.json() as Promise<UploadedDoc[]>;
}

export async function uploadDoc(
  craneId: string,
  file: File,
  displayName?: string,
): Promise<UploadedDoc> {
  const form = new FormData();
  form.append('file', file);
  if (displayName) form.append('name', displayName);

  const res = await fetch(`/api/uploads/${encodeURIComponent(craneId)}`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return res.json() as Promise<UploadedDoc>;
}
