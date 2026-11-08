import { test } from 'node:test';
import assert from 'node:assert/strict';
import { haversineKm, routeDistanceKm, shouldAddPoint, regionForPoints } from './geo.ts';

test('haversine: 1 degree of latitude is about 111 km', () => {
  const d = haversineKm({ latitude: 0, longitude: 0 }, { latitude: 1, longitude: 0 });
  assert.ok(Math.abs(d - 111.19) < 0.1, `got ${d}`);
});

test('haversine: same point is zero', () => {
  assert.equal(haversineKm({ latitude: -33.9, longitude: 18.4 }, { latitude: -33.9, longitude: 18.4 }), 0);
});

test('routeDistanceKm sums segments', () => {
  const route = [
    { latitude: 0, longitude: 0 },
    { latitude: 0.001, longitude: 0 },
    { latitude: 0.002, longitude: 0 },
  ];
  const d = routeDistanceKm(route);
  assert.ok(Math.abs(d - 0.2224) < 0.001, `got ${d}`);
  assert.equal(routeDistanceKm([]), 0);
  assert.equal(routeDistanceKm([route[0]]), 0);
});

test('shouldAddPoint drops inaccurate fixes and jitter', () => {
  const a = { latitude: 0, longitude: 0 };
  assert.equal(shouldAddPoint(undefined, a, 5), true);
  assert.equal(shouldAddPoint(undefined, a, 100), false);
  // ~1.1 m away: jitter
  assert.equal(shouldAddPoint(a, { latitude: 0.00001, longitude: 0 }, 5), false);
  // ~11 m away: real move
  assert.equal(shouldAddPoint(a, { latitude: 0.0001, longitude: 0 }, 5), true);
  assert.equal(shouldAddPoint(a, { latitude: 0.0001, longitude: 0 }, null), true);
});

test('regionForPoints centres on points', () => {
  assert.equal(regionForPoints([]), null);
  const r = regionForPoints([
    { latitude: 1, longitude: 2 },
    { latitude: 3, longitude: 4 },
  ])!;
  assert.equal(r.latitude, 2);
  assert.equal(r.longitude, 3);
  assert.ok(r.latitudeDelta >= 2);
});
