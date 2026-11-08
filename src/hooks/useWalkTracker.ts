import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { Pedometer } from 'expo-sensors';
import { haversineKm, shouldAddPoint } from '../lib/geo';
import { getActiveWalk, newId, setActiveWalk } from '../lib/storage';
import type { Walk } from '../lib/types';

type Status = 'loading' | 'denied' | 'tracking' | 'finished' | 'error';

export type WalkTracker = {
  status: Status;
  error: string | null;
  walk: Walk | null;
  current: Location.LocationObjectCoords | null;
  stepsAvailable: boolean;
  addPoop: () => Promise<void>;
  /** Stops tracking and returns the finished walk (not yet rated or saved to history). */
  finish: () => Promise<Walk | null>;
  /** Forget the in-progress walk (after it has been saved to history, or discarded). */
  clear: () => Promise<void>;
};

const PERSIST_EVERY_MS = 5000;

export function useWalkTracker(): WalkTracker {
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);
  const [walk, setWalk] = useState<Walk | null>(null);
  const [current, setCurrent] = useState<Location.LocationObjectCoords | null>(null);
  const [stepsAvailable, setStepsAvailable] = useState(false);

  const walkRef = useRef<Walk | null>(null);
  const locSub = useRef<Location.LocationSubscription | null>(null);
  const stepSub = useRef<{ remove: () => void } | null>(null);
  const stepsBase = useRef(0);
  const lastPersist = useRef(0);

  const update = useCallback((fn: (w: Walk) => Walk, forcePersist = false) => {
    const prev = walkRef.current;
    if (!prev) return;
    const next = fn(prev);
    walkRef.current = next;
    setWalk(next);
    const now = Date.now();
    if (forcePersist || now - lastPersist.current > PERSIST_EVERY_MS) {
      lastPersist.current = now;
      void setActiveWalk(next);
    }
  }, []);

  const stop = useCallback(() => {
    locSub.current?.remove();
    locSub.current = null;
    stepSub.current?.remove();
    stepSub.current = null;
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const perm = await Location.requestForegroundPermissionsAsync();
        if (cancelled) return;
        if (perm.status !== 'granted') {
          setStatus('denied');
          return;
        }

        // Resume a walk that was in progress, or start a fresh one.
        const existing = await getActiveWalk();
        const initial: Walk = existing ?? {
          id: newId(),
          startedAt: Date.now(),
          endedAt: null,
          route: [],
          distanceKm: 0,
          steps: 0,
          poops: [],
          rating: null,
          note: '',
        };
        if (cancelled) return;
        walkRef.current = initial;
        setWalk(initial);
        await setActiveWalk(initial);
        stepsBase.current = initial.steps;
        if (initial.endedAt) {
          // Ended but never rated (e.g. the app was closed on the rating screen).
          setStatus('finished');
          return;
        }

        // Steps
        try {
          const available = await Pedometer.isAvailableAsync();
          if (available) {
            const p = await Pedometer.requestPermissionsAsync();
            if (p.granted && !cancelled) {
              setStepsAvailable(true);
              stepSub.current = Pedometer.watchStepCount(({ steps }) => {
                update((w) => ({ ...w, steps: stepsBase.current + steps }));
              });
            }
          }
        } catch {
          // Step counting is a nice-to-have; keep tracking the route without it.
        }

        // Route
        const sub = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.BestForNavigation, distanceInterval: 3, timeInterval: 2000 },
          (loc) => {
            setCurrent(loc.coords);
            const point = {
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              timestamp: loc.timestamp,
            };
            update((w) => {
              const last = w.route[w.route.length - 1];
              if (!shouldAddPoint(last, point, loc.coords.accuracy)) return w;
              const added = last ? haversineKm(last, point) : 0;
              return { ...w, route: [...w.route, point], distanceKm: w.distanceKm + added };
            });
          },
          (reason) => setError(String(reason)),
        );
        if (cancelled) {
          sub.remove();
          return;
        }
        locSub.current = sub;
        setStatus('tracking');
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
          setStatus('error');
        }
      }
    })();

    return () => {
      cancelled = true;
      stop();
      if (walkRef.current) void setActiveWalk(walkRef.current);
    };
  }, [stop, update]);

  const addPoop = useCallback(async () => {
    let coords = current;
    if (!coords) {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      coords = loc.coords;
    }
    const { latitude, longitude } = coords;
    update(
      (w) => ({ ...w, poops: [...w.poops, { id: newId(), latitude, longitude, timestamp: Date.now() }] }),
      true,
    );
  }, [current, update]);

  const finish = useCallback(async () => {
    stop();
    const w = walkRef.current;
    if (!w) return null;
    const endedAt = Date.now();
    let steps = w.steps;
    // iOS keeps a step history, which also covers time the app was in the background.
    if (Platform.OS === 'ios') {
      try {
        const res = await Pedometer.getStepCountAsync(new Date(w.startedAt), new Date(endedAt));
        steps = Math.max(steps, res.steps);
      } catch {
        // fall back to the live count
      }
    }
    const done = { ...w, endedAt, steps };
    walkRef.current = done;
    setWalk(done);
    setStatus('finished');
    await setActiveWalk(done);
    return done;
  }, [stop]);

  const clear = useCallback(async () => {
    stop();
    walkRef.current = null;
    await setActiveWalk(null);
  }, [stop]);

  return { status, error, walk, current, stepsAvailable, addPoop, finish, clear };
}
