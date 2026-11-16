import { useSyncExternalStore, type ReactNode } from "react";
import { Linking, Pressable, View, useWindowDimensions } from "react-native";
import { font, radius, space, useColors } from "@/lib/theme";
import { T } from "./ui";

/**
 * In a desktop browser, show the app inside a phone-sized frame next to a short intro, so the web
 * demo reads as the mobile app it is. On a phone-width browser it fills the screen like the real app.
 */
const subscribe = () => () => {};

export function WebFrame({ children }: { children: ReactNode }) {
  const c = useColors();
  const { width, height } = useWindowDimensions();
  // The static HTML can't know the window size, so hydrate as full-screen and add the frame after.
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  if (!hydrated || width < 760) return <View style={{ flex: 1 }}>{children}</View>;
  const phoneH = Math.min(844, height - 48);
  return (
    <View style={{ flex: 1, backgroundColor: c.scheme === "dark" ? "#08090b" : "#e9e8e2", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 64, padding: space.xl }}>
      <View style={{ maxWidth: 360, gap: space.md }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: c.accent, alignItems: "center", justifyContent: "center" }}>
            <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 3, height: 16 }}>
              {[7, 11, 15].map((h) => (
                <View key={h} style={{ width: 4, height: h, borderRadius: 2, backgroundColor: c.accentInk }} />
              ))}
            </View>
          </View>
          <T v="heading">Sumwell Mobile</T>
        </View>
        <T v="title" style={[font, { fontSize: 34, lineHeight: 38 }]}>Your money, in your pocket.</T>
        <T muted style={{ lineHeight: 22 }}>
          The companion app to the Sumwell dashboard: add a purchase in two taps, watch your budgets, and see where the month went.
          Built with Expo and React Native; this is the same code running in the browser.
        </T>
        <View style={{ gap: 6, marginTop: space.sm }}>
          <T v="label">On your phone</T>
          <T v="caption" muted style={{ lineHeight: 18 }}>Open it in Expo Go, or visit this page on your phone. Your entries are saved only on your device.</T>
        </View>
        <Pressable onPress={() => Linking.openURL("https://sumwell-finance-dashboard.vercel.app")} accessibilityRole="link" style={{ alignSelf: "flex-start", marginTop: space.sm }}>
          <T v="label" color={c.accent}>See the Sumwell dashboard →</T>
        </Pressable>
      </View>
      <View
        style={{
          width: 390,
          height: phoneH,
          borderRadius: 48,
          overflow: "hidden",
          borderWidth: 10,
          borderColor: c.scheme === "dark" ? "#24262c" : "#17181c",
          backgroundColor: c.bg,
          shadowColor: "#000",
          shadowOpacity: 0.25,
          shadowRadius: 40,
          shadowOffset: { width: 0, height: 24 },
        }}
        accessibilityLabel="App preview"
      >
        <View style={{ flex: 1, borderRadius: radius.lg }}>{children}</View>
      </View>
    </View>
  );
}
