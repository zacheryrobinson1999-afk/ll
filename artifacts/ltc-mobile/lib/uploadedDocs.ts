/**
 * API client for crane-specific uploaded maintenance documents.
 * Talks to  POST/GET/DELETE /api/uploads/:craneId  on the API server.
 */

export type UploadedDoc = {
  id: string;
  craneId: string;
  name: string;
  key: string;
  mimeType: string;
  size: number;       // bytes
  uploadedAt: string; // ISO-8601
  url: string;        // pre-signed download URL (1 h TTL)
};

function apiBase(): string {
  const domain = process.env['EXPO_PUBLIC_DOMAIN'] ?? '';
  return domain ? `https://${domain}` : '';
}

/** Fetch all uploaded docs for a given crane (includes fresh pre-signed URLs). */
export async function fetchUploadedDocs(craneId: string): Promise<UploadedDoc[]> {
  const res = await fetch(`${apiBase()}/api/uploads/${encodeURIComponent(craneId)}`);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return (await res.json()) as UploadedDoc[];
}

/**
 * Upload a file to B2 via the API server.
 * `file` mirrors what expo-document-picker returns in `assets[0]`.
 */
export async function uploadDoc(
  craneId: string,
  file: { uri: string; name: string; mimeType: string },
): Promise<UploadedDoc> {
  const formData = new FormData();
  // React Native FormData accepts this shape as a file part
  formData.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.mimeType,
  } as unknown as Blob);
  formData.append('name', file.name);

  const res = await fetch(`${apiBase()}/api/uploads/${encodeURIComponent(craneId)}`, {
    method: 'POST',
    body: formData,
    // Do NOT set Content-Type — fetch sets it automatically with the boundary
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return (await res.json()) as UploadedDoc;
}

/** Delete an uploaded doc (removes from B2 and the metadata store). */
export async function deleteDoc(craneId: string, docId: string): Promise<void> {
  const res = await fetch(
    `${apiBase()}/api/uploads/${encodeURIComponent(craneId)}/${encodeURIComponent(docId)}`,
    { method: 'DELETE' },
  );
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
}

/** Format bytes as a human-readable string, e.g. "2.4 MB". */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
