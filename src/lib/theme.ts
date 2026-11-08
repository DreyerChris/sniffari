import { useColorScheme } from 'react-native';

const light = {
  bg: '#F7F4EE',
  card: '#FFFFFF',
  text: '#1F1A14',
  muted: '#6E655A',
  border: '#E4DED3',
  primary: '#2F7D5B',
  primaryText: '#FFFFFF',
  danger: '#C2410C',
  poop: '#7A4A1F',
  route: '#2F7D5B',
  star: '#E0A100',
};

const dark: typeof light = {
  bg: '#14120F',
  card: '#1F1C18',
  text: '#F3EEE6',
  muted: '#A69C8F',
  border: '#34302A',
  primary: '#4CAF84',
  primaryText: '#0D1F17',
  danger: '#F97316',
  poop: '#C08552',
  route: '#4CAF84',
  star: '#F5C542',
};

export type Theme = typeof light;

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? dark : light;
}
