export type WorkshopNote = {
  id: string;
  technicianId: string;
  title: string;
  body: string;
  craneModel: string | null;
  systemCategory: string | null;
  documentId: string | null;
  documentTitle: string | null;
  pageReference: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type NoteInput = Pick<WorkshopNote, 'title' | 'body' | 'craneModel' | 'systemCategory' | 'documentId' | 'documentTitle' | 'pageReference' | 'tags'>;

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { credentials: 'include', ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) } });
  if (response.status === 401) window.dispatchEvent(new Event('cranehub:session-expired'));
  if (!response.ok) {
    const result = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(result.error ?? 'Unable to save workshop note.');
  }
  return response.status === 204 ? undefined as T : response.json() as Promise<T>;
}

const mutation = (method: string, body?: NoteInput): RequestInit => ({
  method,
  headers: { Origin: window.location.origin },
  body: body ? JSON.stringify(body) : undefined,
});

export async function listNotes(query = '') { return (await request<{ notes: WorkshopNote[] }>(`/api/notes${query ? `?q=${encodeURIComponent(query)}` : ''}`)).notes; }
export async function createNote(input: NoteInput) { return (await request<{ note: WorkshopNote }>('/api/notes', mutation('POST', input))).note; }
export async function updateNote(id: string, input: NoteInput) { return (await request<{ note: WorkshopNote }>(`/api/notes/${encodeURIComponent(id)}`, mutation('PUT', input))).note; }
export async function deleteNote(id: string) { await request<void>(`/api/notes/${encodeURIComponent(id)}`, mutation('DELETE')); }
