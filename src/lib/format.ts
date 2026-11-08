export function formatDistance(km: number): string {
  const { value, unit } = distanceParts(km);
  return `${value} ${unit}`;
}

export function distanceParts(km: number): { value: string; unit: string } {
  return km < 1 ? { value: String(Math.round(km * 1000)), unit: 'm' } : { value: km.toFixed(2), unit: 'km' };
}

export function formatDuration(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export function formatDateTime(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatSteps(steps: number): string {
  return steps.toLocaleString();
}

export const RATING_LABELS = ['', 'Rough', 'Meh', 'Fine', 'Good', 'Pawsome'] as const;
