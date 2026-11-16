import { useState } from "react";
import { router } from "expo-router";
import type { BottomTabBarProps } from "expo-router/tabs";
import { HomeIcon, PieChartIcon, PlusIcon, TargetIcon } from "@/lib/icons";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { tap } from "@/lib/haptics";
import { radius, useColors } from "@/lib/theme";
import { T } from "./ui";

const ICONS = { index: HomeIcon, insights: PieChartIcon, budgets: TargetIcon } as const;
const LABELS = { index: "Home", insights: "Insights", budgets: "Budgets" } as const;

/** Floating pill tab bar with a center "add" button. Same look on iOS, Android and the web. */
const SLOT = 68; // room for the + button between the first and second tab

export function TabBar({ state, navigateToTab }: BottomTabBarProps) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const [slotX, setSlotX] = useState<number | null>(null);
  const routes = state.routes.filter((r) => r.name in ICONS);
  const tabs = routes.map((route) => {
    const focused = state.routes[state.index]?.key === route.key;
    const name = route.name as keyof typeof ICONS;
    const Icon = ICONS[name];
    return (
      <Pressable
        key={route.key}
        accessibilityRole="tab"
        accessibilityState={{ selected: focused }}
        accessibilityLabel={LABELS[name]}
        testID={`tab-${name}`}
        onPress={() => {
          tap();
          if (!focused) navigateToTab(route.key);
        }}
        style={{ flex: 1, alignItems: "center", gap: 3, paddingVertical: 6 }}
      >
        <Icon size={22} color={focused ? c.accent : c.muted} strokeWidth={focused ? 2.4 : 2} />
        <T v="caption" color={focused ? c.ink : c.muted} style={{ fontWeight: focused ? "600" : "400" }}>{LABELS[name]}</T>
      </Pressable>
    );
  });
  return (
    <View pointerEvents="box-none" style={{ position: "absolute", left: 0, right: 0, bottom: 0, paddingBottom: Math.max(insets.bottom, 12), paddingHorizontal: 16 }}>
      {/* Only tabs may live in a tablist, so the + button sits on top of an empty slot instead. */}
      <View
        accessibilityRole="tablist"
        onLayout={(e) => setSlotX(e.nativeEvent.layout.x + 8 + (e.nativeEvent.layout.width - 16 - SLOT) / 3)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: c.surface,
          borderRadius: radius.pill,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: c.line,
          paddingHorizontal: 8,
          height: 64,
          shadowColor: "#000",
          shadowOpacity: c.scheme === "dark" ? 0.4 : 0.12,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 8 },
          elevation: 8,
        }}
      >
        {tabs[0]}
        <View style={{ width: SLOT }} />
        {tabs.slice(1)}
      </View>
      {slotX != null && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add transaction"
          testID="add-button"
          onPress={() => {
            tap();
            router.push("/add");
          }}
          style={({ pressed }) => ({
            position: "absolute",
            left: slotX + (SLOT - 52) / 2,
            bottom: Math.max(insets.bottom, 12) + 6,
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: c.accent,
            alignItems: "center",
            justifyContent: "center",
            transform: [{ scale: pressed ? 0.94 : 1 }],
          })}
        >
          <PlusIcon size={26} color={c.accentInk} strokeWidth={2.6} />
        </Pressable>
      )}
    </View>
  );
}
