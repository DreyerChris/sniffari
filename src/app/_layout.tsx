import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../lib/theme';

export default function RootLayout() {
  const t = useTheme();
  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: t.bg },
          headerTintColor: t.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: t.bg },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Sniffari' }} />
        <Stack.Screen name="active-walk" options={{ title: 'Walk', headerBackVisible: false, gestureEnabled: false }} />
        <Stack.Screen name="walks/index" options={{ title: 'Walk history' }} />
        <Stack.Screen name="walks/[id]" options={{ title: 'Walk' }} />
      </Stack>
    </>
  );
}
