import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import 'react-native-reanimated';

import { AuthProvider } from '../context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import WebLayout from '../components/WebLayout';
import './global.css';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const showNavbar =
    Platform.OS === 'web' &&
    pathname !== '/' &&
    !pathname.startsWith('/login') &&
    !pathname.startsWith('/sign-up') &&
    !pathname.startsWith('/forgot-password') &&
    !pathname.startsWith('/admin');

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <WebLayout showNavbar={showNavbar}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(worker)" />
            <Stack.Screen name="(contractor)" />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
        </WebLayout>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
