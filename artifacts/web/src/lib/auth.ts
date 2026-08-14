export type SessionUser = { id: string; name: string; role: 'technician' | 'admin' };
export type SessionResponse = { technician: SessionUser; expiresAt: string };

async function body(response: Response) { return response.json().catch(() => ({})) as Promise<{ error?: string }>; }

export async function getSession(): Promise<SessionResponse | null> {
  const response = await fetch('/api/auth/session', { credentials: 'include' });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error('Unable to check your session.');
  return response.json() as Promise<SessionResponse>;
}
export async function login(username: string, password: string): Promise<SessionResponse> {
  const response = await fetch('/api/auth/login', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
  if (!response.ok) { await body(response); throw new Error('Invalid username or password'); }
  return response.json() as Promise<SessionResponse>;
}
export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include', headers: { Origin: window.location.origin } });
}
