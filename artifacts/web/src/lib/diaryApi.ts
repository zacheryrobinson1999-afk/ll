export type DiaryEntry = {
  id: string; technicianId: string; workDate: string; startTime: string | null; endTime: string | null; durationMinutes: number | null;
  title: string; craneModel: string | null; craneId: string | null; systemCategory: string | null; faultSymptom: string | null;
  diagnosis: string | null; workPerformed: string; partsUsed: string | null; outcome: string | null; followUpRequired: boolean;
  followUpNotes: string | null; documentId: string | null; workshopNoteId: string | null; tags: string[]; createdAt: string; updatedAt: string;
};
export type DiaryInput = Omit<DiaryEntry, 'id' | 'technicianId' | 'createdAt' | 'updatedAt'>;
export type DiaryFilters = { from?: string; to?: string; q?: string; crane?: string; system?: string; followUp?: boolean; entry?: string };

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { credentials: 'include', ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) } });
  if (response.status === 401) window.dispatchEvent(new Event('cranehub:session-expired'));
  if (!response.ok) { const result = await response.json().catch(() => ({})) as { error?: string }; throw new Error(result.error ?? 'Diary request failed.'); }
  return response.status === 204 ? undefined as T : response.json() as Promise<T>;
}
const mutation = (method: string, body?: DiaryInput): RequestInit => ({ method, headers: { Origin: window.location.origin }, body: body ? JSON.stringify(body) : undefined });
export async function listDiary(filters: DiaryFilters = {}) { const query = new URLSearchParams(); Object.entries(filters).forEach(([key, value]) => { if (value !== undefined && value !== '') query.set(key, String(value)); }); return (await request<{ entries: DiaryEntry[] }>(`/api/diary?${query}`)).entries; }
export async function createDiary(input: DiaryInput) { return (await request<{ entry: DiaryEntry }>('/api/diary', mutation('POST', input))).entry; }
export async function updateDiary(id: string, input: DiaryInput) { return (await request<{ entry: DiaryEntry }>(`/api/diary/${encodeURIComponent(id)}`, mutation('PUT', input))).entry; }
export async function deleteDiary(id: string) { await request<void>(`/api/diary/${encodeURIComponent(id)}`, mutation('DELETE')); }
