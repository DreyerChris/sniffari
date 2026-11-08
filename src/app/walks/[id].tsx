import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import WalkMap from '../../components/WalkMap';
import { Button, Stars, Stat } from '../../components/ui';
import { formatDateTime, formatDistance, formatDuration, formatSteps, RATING_LABELS } from '../../lib/format';
import { deleteWalk, getWalk } from '../../lib/storage';
import { useTheme } from '../../lib/theme';
import type { Walk } from '../../lib/types';

export default function WalkDetail() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [walk, setWalk] = useState<Walk | null | undefined>(undefined);

  useEffect(() => {
    getWalk(id).then((w) => setWalk(w ?? null));
  }, [id]);

  if (walk === undefined) return null;
  if (walk === null) {
    return (
      <View style={styles.center}>
        <Text style={{ color: t.muted }}>This walk doesn't exist any more.</Text>
      </View>
    );
  }

  const duration = (walk.endedAt ?? walk.startedAt) - walk.startedAt;

  const onDelete = () => {
    Alert.alert('Delete this walk?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteWalk(walk.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: formatDateTime(walk.startedAt) }} />
      <View style={[styles.map, { borderColor: t.border }]}>
        {walk.route.length > 0 || walk.poops.length > 0 ? (
          <WalkMap route={walk.route} poops={walk.poops} />
        ) : (
          <View style={styles.center}>
            <Text style={{ color: t.muted }}>No route was recorded.</Text>
          </View>
        )}
      </View>

      <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}>
        <View style={styles.row}>
          <Stat label="time" value={formatDuration(duration)} />
          <Stat label="distance" value={formatDistance(walk.distanceKm)} />
        </View>
        <View style={styles.row}>
          <Stat label="steps" value={formatSteps(walk.steps)} />
          <Stat label="poops" value={String(walk.poops.length)} />
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}>
        <Stars value={walk.rating} size={26} />
        {walk.rating && <Text style={{ color: t.muted }}>{RATING_LABELS[walk.rating]}</Text>}
        {walk.note ? <Text style={[styles.note, { color: t.text }]}>{walk.note}</Text> : null}
      </View>

      <Button title="Delete walk" variant="secondary" onPress={onDelete} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 14 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  map: { height: 320, borderRadius: 16, overflow: 'hidden', borderWidth: 1 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 14, alignItems: 'center' },
  row: { flexDirection: 'row' },
  note: { fontSize: 16, textAlign: 'center' },
});
