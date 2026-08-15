import { useCallback, useState } from 'react';

const FAVOURITES_KEY = 'cranehub-document-favourites';
const RECENTLY_VIEWED_KEY = 'cranehub-document-recently-viewed';
const RECENT_LIMIT = 10;

function readIds(key: string): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? '[]');
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function writeIds(key: string, ids: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    // The library remains usable when browser storage is unavailable.
  }
}

export function useDocumentLibrary() {
  const [favouriteIds, setFavouriteIds] = useState<string[]>(() => readIds(FAVOURITES_KEY));
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => readIds(RECENTLY_VIEWED_KEY));

  const toggleFavourite = useCallback((id: string) => {
    setFavouriteIds((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [id, ...current];
      writeIds(FAVOURITES_KEY, next);
      return next;
    });
  }, []);

  const recordViewed = useCallback((id: string) => {
    setRecentlyViewedIds((current) => {
      const next = [id, ...current.filter((item) => item !== id)].slice(0, RECENT_LIMIT);
      writeIds(RECENTLY_VIEWED_KEY, next);
      return next;
    });
  }, []);

  return { favouriteIds, recentlyViewedIds, toggleFavourite, recordViewed };
}
