import { useEffect, useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@ltc/manual-library-v2';
type LibraryState = { bookmarks: string[]; recent: string[]; ready: boolean; error: string };
let state: LibraryState = { bookmarks: [], recent: [], ready: false, error: '' };
let loading: Promise<void> | undefined;
let writes = Promise.resolve();
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
const snapshot = () => state;
function publish(next: LibraryState) { state = next; listeners.forEach(listener => listener()); }
function load() {
  loading ??= AsyncStorage.getItem(KEY).then(value => {
    const data = value ? JSON.parse(value) : {};
    const ids = (value: unknown): string[] => Array.isArray(value) ? value.filter(item => typeof item === 'string') : [];
    publish({ bookmarks: ids(data.bookmarks), recent: ids(data.recent), ready: true, error: '' });
  }).catch(() => publish({ ...state, error: 'Saved manuals could not be loaded.' }));
}
function save(next: LibraryState) {
  if (!state.ready) return;
  publish(next);
  // Serial writes and a shared snapshot keep stacked Expo routes in sync.
  writes = writes.then(() => AsyncStorage.setItem(KEY, JSON.stringify({ bookmarks: next.bookmarks, recent: next.recent })))
    .catch(() => publish({ ...state, ready: false, error: 'Saved manuals could not be stored.' }));
}
export function useManualLibraryStorage() {
  const saved = useSyncExternalStore(subscribe, snapshot, snapshot);
  useEffect(load, []);
  return { ...saved,
    toggle: (id: string) => save({ ...state, bookmarks: state.bookmarks.includes(id) ? state.bookmarks.filter(value => value !== id) : [...state.bookmarks, id] }),
    record: (id: string) => save({ ...state, recent: [id, ...state.recent.filter(value => value !== id)].slice(0, 10) }),
  };
}
