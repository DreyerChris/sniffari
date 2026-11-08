type LatLng = { latitude: number; longitude: number };

const EARTH_RADIUS_KM = 6371;

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance between two points, in kilometres. */
export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Total length of a route, in kilometres. */
export function routeDistanceKm(route: LatLng[]): number {
  let total = 0;
  for (let i = 1; i < route.length; i++) total += haversineKm(route[i - 1], route[i]);
  return total;
}

/** GPS fixes worse than this (metres) are ignored. */
export const MAX_ACCURACY_M = 30;
/** Moves shorter than this (metres) are treated as GPS jitter while standing still. */
export const MIN_STEP_M = 3;

/**
 * Decide whether a new GPS fix should be added to the route.
 * Drops inaccurate fixes and tiny jitter so the distance doesn't creep up
 * while you stand still waiting for the dog to finish sniffing.
 */
export function shouldAddPoint(
  last: LatLng | undefined,
  next: LatLng,
  accuracyM: number | null | undefined,
): boolean {
  if (accuracyM != null && accuracyM > MAX_ACCURACY_M) return false;
  if (!last) return true;
  return haversineKm(last, next) * 1000 >= MIN_STEP_M;
}

/** A map region that fits all points with some padding. */
export function regionForPoints(points: LatLng[]) {
  if (points.length === 0) return null;
  let minLat = Infinity, maxLat = -Infinity, minLon = Infinity, maxLon = -Infinity;
  for (const p of points) {
    minLat = Math.min(minLat, p.latitude);
    maxLat = Math.max(maxLat, p.latitude);
    minLon = Math.min(minLon, p.longitude);
    maxLon = Math.max(maxLon, p.longitude);
  }
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLon + maxLon) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * 1.4, 0.004),
    longitudeDelta: Math.max((maxLon - minLon) * 1.4, 0.004),
  };
}
