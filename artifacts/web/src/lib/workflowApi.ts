export type Bookmark = { id: string; documentId: string; sectionRef: string; pageRef: string; createdAt: string };
export type ActivityEvent = { id: string; type: string; entityType: string; entityId: string; craneId: string | null; createdAt: string };
export type FleetDetails = {
  notes: { id: string; title: string; updatedAt: string }[];
  activity: ActivityEvent[]; bookmarks: Bookmark[]; unavailable: string[];
};
export async function workflowRequest<T>(url: string, method = 'GET', body?: unknown): Promise<T> {
  const response = await fetch(`/api${url}`, { method, credentials: 'include',
    headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
  if (response.status === 401) window.dispatchEvent(new Event('cranehub:session-expired'));
  if (!response.ok) throw new Error('Unable to load or save private workshop data. Please retry.');
  return response.status === 204 ? undefined as T : response.json();
}
