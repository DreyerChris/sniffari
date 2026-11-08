import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Linking, Platform, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RatingForm from '../components/RatingForm';
import WalkMap from '../components/WalkMap';
import { Button, Stat } from '../components/ui';
import { useWalkTracker } from '../hooks/useWalkTracker';
import { distanceParts, formatDuration, formatSteps } from '../lib/format';
import { confirm } from '../lib/confirm';
import { saveWalk } from '../lib/storage';
import { useTheme } from '../lib/theme';
import type { Rating } from '../lib/types';

function useNow(active: boolean) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active]);
  return now;
}

export default function ActiveWalk() {
  useKeepAwake();
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const tracker = useWalkTracker();
  const { status, walk } = tracker;
  const now = useNow(status === 'tracking');
  const [saving, setSaving] = useState(false);
  const [poopFlash, setPoopFlash] = useState(false);

  if (status === 'denied') {
    return (
      <View style={[styles.center, { padding: 24 }]}>
        <Text style={[styles.message, { color: t.text }]}>
          Sniffari needs location access to track your walk.
        </Text>
        <Button title="Open settings" onPress={() => Linking.openSettings()} />
        <Button title="Back" variant="secondary" onPress={() => router.back()} />
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={[styles.center, { padding: 24 }]}>
        <Text style={[styles.message, { color: t.text }]}>Couldn't start tracking: {tracker.error}</Text>
        <Button title="Back" variant="secondary" onPress={() => router.back()} />
      </View>
    );
  }

  if (status === 'loading' || !walk) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={t.primary} />
        <Text style={{ color: t.muted, marginTop: 12 }}>Finding your location…</Text>
      </View>
    );
  }

  const elapsed = (walk.endedAt ?? now) - walk.startedAt;

  const onPoop = async () => {
    try {
      await tracker.addPoop();
      setPoopFlash(true);
      setTimeout(() => setPoopFlash(false), 1200);
    } catch {
      Alert.alert("Couldn't get your location", 'Try again in a moment.');
    }
  };

  const onEnd = () => {
    confirm('End walk?', undefined, 'End walk', () => void tracker.finish(), 'Keep walking');
  };

  const onDiscard = () => {
    confirm('Discard this walk?', "It won't be saved to your history.", 'Discard', async () => {
      await tracker.clear();
      router.back();
    });
  };

  const onRate = async (rating: Rating, note: string) => {
    setSaving(true);
    const finished = { ...walk, rating, note };
    await saveWalk(finished);
    await tracker.clear();
    router.replace(`/walks/${finished.id}`);
  };

  const finished = status === 'finished';

  return (
    <View style={styles.flex}>
      <View style={styles.flex}>
        <WalkMap route={walk.route} poops={walk.poops} live={!finished} />
        {poopFlash && (
          <View style={[styles.toast, { backgroundColor: t.card }]}>
            <Text style={{ color: t.text, fontWeight: '600' }}>💩 Poop marked</Text>
          </View>
        )}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.panel, { backgroundColor: t.bg, paddingBottom: insets.bottom + 16 }]}
      >
        <View style={styles.row}>
          <Stat label="time" value={formatDuration(elapsed)} />
          <Stat label="distance" {...distanceParts(walk.distanceKm)} />
          <Stat label="steps" value={tracker.stepsAvailable || walk.steps ? formatSteps(walk.steps) : '–'} />
          <Stat label="poops" value={String(walk.poops.length)} />
        </View>

        {finished ? (
          <>
            <RatingForm onSubmit={onRate} saving={saving} />
            <Button title="Discard walk" variant="secondary" onPress={onDiscard} />
          </>
        ) : (
          <View style={styles.row}>
            <Button title="💩 Poop" variant="secondary" onPress={onPoop} style={styles.flex} />
            <Button title="End walk" variant="danger" onPress={onEnd} style={styles.flex} />
          </View>
        )}
        {tracker.error && !finished && (
          <Text style={{ color: t.muted, textAlign: 'center' }}>GPS: {tracker.error}</Text>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  message: { fontSize: 17, textAlign: 'center', marginBottom: 8 },
  panel: { padding: 16, gap: 14 },
  row: { flexDirection: 'row', gap: 12 },
  toast: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
});
