import { Pressable, StyleSheet, Text, View, type PressableProps, type ViewStyle } from 'react-native';
import { useTheme } from '../lib/theme';

type ButtonProps = PressableProps & {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: ViewStyle;
};

export function Button({ title, variant = 'primary', style, disabled, ...rest }: ButtonProps) {
  const t = useTheme();
  const bg = variant === 'primary' ? t.primary : variant === 'danger' ? t.danger : t.card;
  const fg = variant === 'secondary' ? t.text : t.primaryText;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, borderColor: variant === 'secondary' ? t.border : bg },
        (pressed || disabled) && { opacity: 0.6 },
        style,
      ]}
      {...rest}
    >
      <Text style={[styles.buttonText, { color: fg }]}>{title}</Text>
    </Pressable>
  );
}

export function Stat({ label, value }: { label: string; value: string }) {
  const t = useTheme();
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color: t.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: t.muted }]}>{label}</Text>
    </View>
  );
}

export function Stars({ value, size = 16 }: { value: number | null; size?: number }) {
  const t = useTheme();
  if (!value) return <Text style={{ color: t.muted, fontSize: size }}>Not rated</Text>;
  return (
    <Text style={{ fontSize: size, color: t.star }} accessibilityLabel={`${value} out of 5`}>
      {'★'.repeat(value)}
      <Text style={{ color: t.border }}>{'★'.repeat(5 - value)}</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontSize: 17, fontWeight: '700' },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '700', fontVariant: ['tabular-nums'] },
  statLabel: { fontSize: 13, marginTop: 2 },
});
