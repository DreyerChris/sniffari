import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Stars } from '../../components/ui';
import { formatDateTime, formatDistance, formatDuration } from '../../lib/format';
import { listWalks } from '../../lib/storage';
import { useTheme } from '../../lib/theme';
import type { Walk } from '../../lib/types';

export default function WalkHistory() {
  const t = useTheme();
  const [walks, setWalks] = useState<Walk[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      listWalks().then(setWalks);
    }, []),
  );

  return (
    <FlatList
      data={walks ?? []}
      keyExtractor={(w) => w.id}
      contentContainerStyle={styles.list}
      ListEmptyComponent={
        walks ? <Text style={[styles.empty, { color: t.muted }]}>No walks yet. Go get some sniffs in!</Text> : undefined
      }
      renderItem={({ item: w }) => (
        <Pressable
          onPress={() => router.push(`/walks/${w.id}`)}
          style={({ pressed }) => [
            styles.item,
            { backgroundColor: t.card, borderColor: t.border },
            pressed && { opacity: 0.7 },
          ]}
        >
          <View style={styles.itemTop}>
            <Text style={[styles.date, { color: t.text }]}>{formatDateTime(w.startedAt)}</Text>
            <Stars value={w.rating} size={14} />
          </View>
          <Text style={{ color: t.muted }}>
            {formatDistance(w.distanceKm)} · {formatDuration((w.endedAt ?? w.startedAt) - w.startedAt)} ·{' '}
            {w.steps.toLocaleString()} steps · {w.poops.length} 💩
          </Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 10 },
  empty: { textAlign: 'center', marginTop: 40, fontSize: 16 },
  item: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 4 },
  itemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: 16, fontWeight: '600' },
});
