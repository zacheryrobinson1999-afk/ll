export type DailyCodeResult = {
  first: string;
  second: string;
  serial: string;
  date: string;
};

export function makeLegacyDate(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${day}${month}${String(now.getFullYear()).slice(-2)}`;
}

export async function generateDailyCodes(
  serial: string,
  date: string,
): Promise<DailyCodeResult> {
  const response = await fetch('/api/daycodes/generate', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ serial, date }),
  });

  const body = (await response.json().catch(() => null)) as
    | DailyCodeResult
    | { error?: string }
    | null;

  if (!response.ok) {
    if (response.status === 401) {
      window.dispatchEvent(new Event('cranehub:session-expired'));
      throw new Error('Your session has expired. Please sign in again.');
    }
    throw new Error(body && 'error' in body && body.error ? body.error : 'Unable to generate daycodes.');
  }

  return body as DailyCodeResult;
}
