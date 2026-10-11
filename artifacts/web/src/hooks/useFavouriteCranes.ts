import { useCallback, useEffect, useState } from 'react';

function keyFor(userId: string) { return `cranehub-favourite-cranes:${userId}`; }
function read(userId: string): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(keyFor(userId)) ?? '[]');
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : [];
  } catch { return []; }
}
function write(userId: string, ids: string[]) { try { localStorage.setItem(keyFor(userId), JSON.stringify(ids)); } catch { /* optional local preference */ } }

export function useFavouriteCranes(userId: string | undefined) {
  const [ids, setIds] = useState<string[]>(() => userId ? read(userId) : []);
  useEffect(() => { setIds(userId ? read(userId) : []); }, [userId]);
  const toggle = useCallback((id: string) => {
    if (!userId) return;
    setIds(current => { const next = current.includes(id) ? current.filter(value => value !== id) : [id, ...current]; write(userId, next); return next; });
  }, [userId]);
  return { favouriteCraneIds: ids, toggleFavouriteCrane: toggle };
}
