/**
 * Custom crane storage — persists user-added cranes in localStorage.
 * These are merged with the static FLEET at runtime.
 */

import { type CraneModel } from '@/data/craneFleet';

const STORAGE_KEY = 'ltc:custom-fleet';

export type CustomCrane = CraneModel & { _custom: true };

export function loadCustomCranes(): CustomCrane[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CustomCrane[];
  } catch {
    return [];
  }
}

export function saveCustomCrane(crane: Omit<CustomCrane, 'id' | '_custom'>): CustomCrane {
  const existing = loadCustomCranes();
  const newCrane: CustomCrane = {
    ...crane,
    id: `custom-${Date.now()}`,
    _custom: true,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, newCrane]));
  return newCrane;
}

export function deleteCustomCrane(id: string): void {
  const existing = loadCustomCranes();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.filter(c => c.id !== id)));
}

export function isCustomCrane(crane: CraneModel): crane is CustomCrane {
  return '_custom' in crane && (crane as CustomCrane)._custom === true;
}
