export type DiaryEntry = { id: string; date: string; summary: string; updatedAt: string; fromLegacy: boolean };
export type DiaryInput = { date: string; summary: string };

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { credentials: 'include', ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) } });
  if (response.status === 401) window.dispatchEvent(new Event('cranehub:session-expired'));
  if (!response.ok) {
    const result = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(result.error ?? 'Diary request failed.');
  }
  return response.json() as Promise<T>;
}

export async function listDiary(filters: { from: string; to: string }) {
  return (await request<{ entries: DiaryEntry[] }>(`/api/diary?${new URLSearchParams(filters)}`)).entries;
}
export async function getDiary(date: string) {
  return (await request<{ entry: DiaryEntry | null }>(`/api/diary?${new URLSearchParams({ date })}`)).entry;
}
export async function getDiaryById(entry: string) {
  return (await request<{ entry: DiaryEntry | null }>(`/api/diary?${new URLSearchParams({ entry })}`)).entry;
}
export async function saveDiary(input: DiaryInput) {
  return (await request<{ entry: DiaryEntry }>('/api/diary', { method: 'POST', body: JSON.stringify(input) })).entry;
}
