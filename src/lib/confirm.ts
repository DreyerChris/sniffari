import { Alert, Platform } from 'react-native';

/** Yes/no confirmation. Alert.alert does nothing on web, so fall back to window.confirm there. */
export function confirm(title: string, message: string | undefined, confirmText: string, onConfirm: () => void, cancelText = 'Cancel') {
  if (Platform.OS === 'web') {
    if (window.confirm(message ? `${title}\n\n${message}` : title)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: cancelText, style: 'cancel' },
    { text: confirmText, style: 'destructive', onPress: onConfirm },
  ]);
}
