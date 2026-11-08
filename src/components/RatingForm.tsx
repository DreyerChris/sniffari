import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { RATING_LABELS } from '../lib/format';
import { useTheme } from '../lib/theme';
import type { Rating } from '../lib/types';
import { Button } from './ui';

type Props = {
  onSubmit: (rating: Rating, note: string) => void;
  saving?: boolean;
};

export default function RatingForm({ onSubmit, saving }: Props) {
  const t = useTheme();
  const [rating, setRating] = useState<Rating | null>(null);
  const [note, setNote] = useState('');

  return (
    <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}>
      <Text style={[styles.title, { color: t.text }]}>How did the walk go?</Text>
      <View style={styles.stars}>
        {([1, 2, 3, 4, 5] as Rating[]).map((n) => (
          <Pressable
            key={n}
            onPress={() => setRating(n)}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={`${n} star${n > 1 ? 's' : ''}`}
            accessibilityState={{ selected: rating === n }}
          >
            <Text style={[styles.star, { color: rating && n <= rating ? t.star : t.border }]}>★</Text>
          </Pressable>
        ))}
      </View>
      <Text style={[styles.label, { color: t.muted }]}>
        {rating ? RATING_LABELS[rating] : 'Tap a star'}
      </Text>
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="Anything to remember? (optional)"
        placeholderTextColor={t.muted}
        multiline
        style={[styles.input, { color: t.text, borderColor: t.border, backgroundColor: t.bg }]}
      />
      <Button
        title={saving ? 'Saving…' : 'Save walk'}
        disabled={!rating || saving}
        onPress={() => rating && onSubmit(rating, note.trim())}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, borderWidth: 1, padding: 20, gap: 12 },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center' },
  stars: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  star: { fontSize: 44 },
  label: { textAlign: 'center', fontSize: 15 },
  input: { borderWidth: 1, borderRadius: 12, padding: 12, minHeight: 70, fontSize: 16, textAlignVertical: 'top' },
});
