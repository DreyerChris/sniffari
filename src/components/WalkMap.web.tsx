// Web fallback: react-native-maps has no web support, so draw the route on a
// simple grid. Used for browser previews; the phone app uses WalkMap.tsx.
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { useTheme } from '../lib/theme';
import type { Coord, Poop } from '../lib/types';

type Props = { route: Coord[]; poops: Poop[]; live?: boolean; style?: ViewStyle };

const W = 400;
const H = 400;
const PAD = 40;

export default function WalkMap({ route, poops, live, style }: Props) {
  const t = useTheme();
  const pts = [...route, ...poops];
  let minLat = Infinity, maxLat = -Infinity, minLon = Infinity, maxLon = -Infinity;
  for (const p of pts) {
    minLat = Math.min(minLat, p.latitude); maxLat = Math.max(maxLat, p.latitude);
    minLon = Math.min(minLon, p.longitude); maxLon = Math.max(maxLon, p.longitude);
  }
  const midLat = (minLat + maxLat) / 2;
  const kx = Math.cos((midLat * Math.PI) / 180);
  const spanX = Math.max((maxLon - minLon) * kx, 0.002);
  const spanY = Math.max(maxLat - minLat, 0.002);
  const scale = Math.min((W - 2 * PAD) / spanX, (H - 2 * PAD) / spanY);
  const cx = (minLon + maxLon) / 2;
  const project = (p: { latitude: number; longitude: number }) => ({
    x: W / 2 + (p.longitude - cx) * kx * scale,
    y: H / 2 - (p.latitude - midLat) * scale,
  });
  const line = route.map(project).map((p) => `${p.x},${p.y}`).join(' ');
  const start = route[0] && project(route[0]);
  const end = route.length > 1 ? project(route[route.length - 1]) : null;

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: t.card }, style]}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={t.border} strokeWidth="1" />
          </pattern>
        </defs>
        <rect x="-400" y="-400" width="1200" height="1200" fill="url(#grid)" />
        <path d="M -50 300 C 100 260, 200 340, 450 280" stroke={t.border} strokeWidth="14" fill="none" />
        <path d="M 260 -50 C 240 120, 300 250, 250 450" stroke={t.border} strokeWidth="10" fill="none" />
        {route.length > 1 && (
          <polyline points={line} fill="none" stroke={t.route} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        )}
        {start && <circle cx={start.x} cy={start.y} r="9" fill="#22A06B" stroke="#fff" strokeWidth="3" />}
        {end && live && <circle cx={end.x} cy={end.y} r="10" fill="#2F80ED" stroke="#fff" strokeWidth="4" />}
        {end && !live && <circle cx={end.x} cy={end.y} r="9" fill="#D64545" stroke="#fff" strokeWidth="3" />}
        {poops.map((p) => {
          const q = project(p);
          return (
            <g key={p.id}>
              <circle cx={q.x} cy={q.y} r="16" fill={t.card} stroke={t.poop} strokeWidth="2.5" />
              <text x={q.x} y={q.y + 6} fontSize="17" textAnchor="middle">💩</text>
            </g>
          );
        })}
      </svg>
    </View>
  );
}
