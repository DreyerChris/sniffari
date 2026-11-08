import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Button, Stars, Stat } from '../components/ui';
import { formatDateTime, formatDistance, formatDuration } from '../lib/format';
import { getActiveWalk, listWalks } from '../lib/storage';
import { useTheme } from '../lib/theme';
import type { Walk } from '../lib/types';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export default function Home() {
  const t = useTheme();
  const [walks, setWalks] = useState<Walk[]>([]);
  const [active, setActive] = useState<Walk | null>(null);

  useFocusEffect(
    useCallback(() => {
      listWalks().then(setWalks);
      getActiveWalk().then(setActive);
    }, []),
  );

  const weekAgo = Date.now() - WEEK_MS;
  const thisWeek = walks.filter((w) => w.startedAt >= weekAgo);
  const weekKm = thisWeek.reduce((s, w) => s + w.distanceKm, 0);
  const weekPoops = thisWeek.reduce((s, w) => s + w.poops.length, 0);
  const last = walks[0];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[styles.hero, { color: t.text }]}>Ready for a walk? 🐕</Text>

      {active ? (
        <Button
          title={active.endedAt ? 'Rate your last walk' : 'Resume walk in progress'}
          onPress={() => router.push('/active-walk')}
        />
      ) : (
        <Button title="Start walk" onPress={() => router.push('/active-walk')} />
      )}

      <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}>
        <Text style={[styles.cardTitle, { color: t.muted }]}>Last 7 days</Text>
        <View style={styles.row}>
          <Stat label="walks" value={String(thisWeek.length)} />
          <Stat label="distance" value={formatDistance(weekKm)} />
          <Stat label="poops" value={String(weekPoops)} />
        </View>
      </View>

      {last && (
        <Pressable
          onPress={() => router.push(`/walks/${last.id}`)}
          style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}
        >
            <Text style={[styles.cardTitle, { color: t.muted }]}>Last walk</Text>
            <Text style={[styles.lastDate, { color: t.text }]}>{formatDateTime(last.startedAt)}</Text>
            <Text style={{ color: t.muted }}>
              {formatDistance(last.distanceKm)} · {formatDuration((last.endedAt ?? last.startedAt) - last.startedAt)} ·{' '}
              {last.steps.toLocaleString()} steps
            </Text>
          <Stars value={last.rating} />
        </Pressable>
      )}

      {walks.length > 0 && (
        <Button title={`See all ${walks.length} walks`} variant="secondary" onPress={() => router.push('/walks')} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 16 },
  hero: { fontSize: 28, fontWeight: '800', marginTop: 8, marginBottom: 4 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 6 },
  cardTitle: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', marginTop: 6 },
  lastDate: { fontSize: 18, fontWeight: '600' },
});
