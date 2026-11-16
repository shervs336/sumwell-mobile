import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import { Stack } from "expo-router/stack";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { WebFrame } from "@/components/web-frame";
import { DataProvider, useData } from "@/lib/store";
import { useColors } from "@/lib/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

function HideSplashWhenReady() {
  const { ready } = useData();
  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);
  return null;
}

export default function RootLayout() {
  const c = useColors();
  const base = c.scheme === "dark" ? DarkTheme : DefaultTheme;
  return (
    <ThemeProvider value={{ ...base, colors: { ...base.colors, background: c.bg, card: c.surface, text: c.ink, border: c.line, primary: c.accent } }}>
      <DataProvider>
        <HideSplashWhenReady />
        <StatusBar style={c.scheme === "dark" ? "light" : "dark"} />
        <WebFrame>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="add" options={{ presentation: "modal" }} />
            <Stack.Screen name="settings" options={{ presentation: "modal" }} />
          </Stack>
        </WebFrame>
      </DataProvider>
    </ThemeProvider>
  );
}
