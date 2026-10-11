import { useEffect, useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@ltc/favourite-cranes-v1';
let state: string[] = [];
let ready = false;
let loading: Promise<void> | undefined;
const listeners = new Set<() => void>();
const publish = (next: string[]) => { state = next; ready = true; listeners.forEach(listener => listener()); };
const subscribe = (listener: () => void) => { listeners.add(listener); return () => listeners.delete(listener); };
const snapshot = () => state;
function load() { loading ??= AsyncStorage.getItem(KEY).then(raw => { const value: unknown = raw ? JSON.parse(raw) : []; publish(Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : []); }).catch(() => publish([])); }
export function useFavouriteCranes() {
  const ids = useSyncExternalStore(subscribe, snapshot, snapshot);
  useEffect(load, []);
  const toggle = (id: string) => { if (!ready) return; const next = ids.includes(id) ? ids.filter(value => value !== id) : [id, ...ids]; publish(next); void AsyncStorage.setItem(KEY, JSON.stringify(next)); };
  return { favouriteCraneIds: ids, toggleFavouriteCrane: toggle, ready };
}
