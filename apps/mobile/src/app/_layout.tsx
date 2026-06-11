import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  NotoSerifKR_400Regular,
  NotoSerifKR_500Medium,
  NotoSerifKR_700Bold,
} from '@expo-google-fonts/noto-serif-kr';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    NotoSerifKR_400Regular,
    NotoSerifKR_500Medium,
    NotoSerifKR_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="essay/[id]" options={{ presentation: 'card', animation: 'slide_from_right' }} />
      <Stack.Screen name="movie/[id]" options={{ presentation: 'card', animation: 'slide_from_right' }} />
      <Stack.Screen name="edit" options={{ presentation: 'card', animation: 'slide_from_right' }} />
      <Stack.Screen name="follow" options={{ presentation: 'card', animation: 'slide_from_right' }} />
      <Stack.Screen name="editor" options={{ presentation: 'card', animation: 'slide_from_right' }} />
      <Stack.Screen name="post/[kind]/[id]" options={{ presentation: 'card', animation: 'slide_from_right' }} />
    </Stack>
  );
}
