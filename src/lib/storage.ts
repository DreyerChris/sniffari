import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Walk } from './types';

const WALKS_KEY = 'sniffari.walks.v1';
const ACTIVE_KEY = 'sniffari.activeWalk.v1';

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** All finished walks, newest first. */
export async function listWalks(): Promise<Walk[]> {
  const walks = await readJson<Walk[]>(WALKS_KEY, []);
  return walks.sort((a, b) => b.startedAt - a.startedAt);
}

export async function getWalk(id: string): Promise<Walk | undefined> {
  return (await listWalks()).find((w) => w.id === id);
}

export async function saveWalk(walk: Walk): Promise<void> {
  const walks = (await listWalks()).filter((w) => w.id !== walk.id);
  walks.push(walk);
  await AsyncStorage.setItem(WALKS_KEY, JSON.stringify(walks));
}

export async function deleteWalk(id: string): Promise<void> {
  const walks = (await listWalks()).filter((w) => w.id !== id);
  await AsyncStorage.setItem(WALKS_KEY, JSON.stringify(walks));
}

/** The walk in progress is saved as it goes, so closing the app doesn't lose it. */
export async function getActiveWalk(): Promise<Walk | null> {
  return readJson<Walk | null>(ACTIVE_KEY, null);
}

export async function setActiveWalk(walk: Walk | null): Promise<void> {
  if (walk) await AsyncStorage.setItem(ACTIVE_KEY, JSON.stringify(walk));
  else await AsyncStorage.removeItem(ACTIVE_KEY);
}

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
