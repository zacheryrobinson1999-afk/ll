import { useEffect, useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@ltc/manual-library-v2';
export type LocalSectionBookmark = { documentId: string; sectionRef: string; pageRef: string };
type LibraryState = { bookmarks: string[]; recent: string[]; sectionBookmarks: LocalSectionBookmark[]; ready: boolean; error: string };
let state: LibraryState = { bookmarks: [], recent: [], sectionBookmarks: [], ready: false, error: '' };
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
    const sections = Array.isArray(data.sectionBookmarks) ? data.sectionBookmarks.filter((item: unknown): item is LocalSectionBookmark => Boolean(item) && typeof item === 'object' && typeof (item as LocalSectionBookmark).documentId === 'string' && typeof (item as LocalSectionBookmark).sectionRef === 'string' && typeof (item as LocalSectionBookmark).pageRef === 'string') : [];
    publish({ bookmarks: ids(data.bookmarks), recent: ids(data.recent), sectionBookmarks: sections, ready: true, error: '' });
  }).catch(() => publish({ ...state, error: 'Saved manuals could not be loaded.' }));
}
function save(next: LibraryState) {
  if (!state.ready) return;
  publish(next);
  // Serial writes and a shared snapshot keep stacked Expo routes in sync.
  writes = writes.then(() => AsyncStorage.setItem(KEY, JSON.stringify({ bookmarks: next.bookmarks, recent: next.recent, sectionBookmarks: next.sectionBookmarks })))
    .catch(() => publish({ ...state, ready: false, error: 'Saved manuals could not be stored.' }));
}
export function useManualLibraryStorage() {
  const saved = useSyncExternalStore(subscribe, snapshot, snapshot);
  useEffect(load, []);
  return { ...saved,
    toggle: (id: string) => save({ ...state, bookmarks: state.bookmarks.includes(id) ? state.bookmarks.filter(value => value !== id) : [...state.bookmarks, id] }),
    record: (id: string) => save({ ...state, recent: [id, ...state.recent.filter(value => value !== id)].slice(0, 10) }),
    toggleSection: (bookmark: LocalSectionBookmark) => save({ ...state, sectionBookmarks: state.sectionBookmarks.some(item => item.documentId === bookmark.documentId && item.sectionRef === bookmark.sectionRef) ? state.sectionBookmarks.filter(item => !(item.documentId === bookmark.documentId && item.sectionRef === bookmark.sectionRef)) : [bookmark, ...state.sectionBookmarks] }),
  };
}
