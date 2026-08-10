/**
 * Custom fleet store — user-added cranes persisted via AsyncStorage.
 * Custom cranes are merged with the built-in FLEET at render time.
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CraneModel } from '@/data/craneFleet';

const STORAGE_KEY = '@ltc/custom_fleet_v1';

export type CustomCraneInput = {
  model: string;
  manufacturer: string;
  category: CraneModel['category'];
  maxCapacity: number;
  maxBoom: number;
  maxRadius: number;
  axles: number;
  maxTravel: boolean;
  units: string[];
  notes: string;
};

async function readStore(): Promise<CraneModel[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CraneModel[]) : [];
  } catch {
    return [];
  }
}

async function writeStore(cranes: CraneModel[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cranes));
}

/**
 * Hook — returns the custom crane list and an addCrane function.
 * Loads from AsyncStorage on mount and keeps state in sync.
 */
export function useCustomFleet() {
  const [cranes, setCranes] = useState<CraneModel[]>([]);

  const load = useCallback(async () => {
    setCranes(await readStore());
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const addCrane = useCallback(async (input: CustomCraneInput): Promise<CraneModel> => {
    const id = `custom-${Date.now()}`;
    const crane: CraneModel = { id, ...input };
    const current = await readStore();
    const updated = [...current, crane];
    await writeStore(updated);
    setCranes(updated);
    return crane;
  }, []);

  const removeCrane = useCallback(async (id: string): Promise<void> => {
    const current = await readStore();
    const updated = current.filter((c) => c.id !== id);
    await writeStore(updated);
    setCranes(updated);
  }, []);

  return { cranes, addCrane, removeCrane };
}
