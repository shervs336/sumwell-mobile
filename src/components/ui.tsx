import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, type PressableProps, type StyleProp, type TextProps, type TextStyle, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { font, num, radius, space, useColors } from "@/lib/theme";

type Variant = "display" | "title" | "heading" | "body" | "label" | "caption" | "amount";
const SIZES: Record<Variant, TextStyle> = {
  display: { fontSize: 40, fontWeight: "700", letterSpacing: -1.2 },
  title: { fontSize: 28, fontWeight: "700", letterSpacing: -0.6 },
  heading: { fontSize: 17, fontWeight: "600", letterSpacing: -0.2 },
  body: { fontSize: 15 },
  label: { fontSize: 13, fontWeight: "500" },
  caption: { fontSize: 12 },
  amount: { fontSize: 15, fontWeight: "600", ...num },
};

export function T({ v = "body", muted, color, style, ...rest }: TextProps & { v?: Variant; muted?: boolean; color?: string }) {
  const c = useColors();
  return <Text {...rest} style={[font, SIZES[v], { color: color ?? (muted ? c.muted : c.ink) }, v === "display" || v === "title" ? num : null, style]} />;
}

/** Scrollable screen with safe-area padding; leaves room for the floating tab bar. */
export function Screen({ children, header }: { children: ReactNode; header?: ReactNode }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{ paddingTop: insets.top + space.md, paddingBottom: insets.bottom + 120, paddingHorizontal: space.lg, gap: space.lg }}
      showsVerticalScrollIndicator={false}
    >
      {header}
      {children}
    </ScrollView>
  );
}

export function Card({ children, style, padded = true }: { children: ReactNode; style?: StyleProp<ViewStyle>; padded?: boolean }) {
  const c = useColors();
  return (
    <View
      style={[
        { backgroundColor: c.surface, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: c.line },
        padded && { padding: space.lg },
        { shadowColor: "#000", shadowOpacity: c.scheme === "dark" ? 0 : 0.06, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 1 },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Button({
  label, onPress, kind = "primary", icon, style, disabled, accessibilityLabel, testID,
}: {
  label: string; onPress: () => void; kind?: "primary" | "ghost" | "danger"; icon?: ReactNode; style?: StyleProp<ViewStyle>; disabled?: boolean; accessibilityLabel?: string; testID?: string;
}) {
  const c = useColors();
  const bg = kind === "primary" ? c.accent : kind === "danger" ? "transparent" : c.surface2;
  const fg = kind === "primary" ? c.accentInk : kind === "danger" ? c.neg : c.ink;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      testID={testID}
      style={({ pressed }) => [
        { height: 52, borderRadius: radius.pill, backgroundColor: bg, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: space.sm, opacity: disabled ? 0.4 : pressed ? 0.85 : 1 },
        kind === "danger" && { borderWidth: 1, borderColor: c.line },
        style,
      ]}
    >
      {icon}
      <T v="heading" color={fg}>{label}</T>
    </Pressable>
  );
}

export function Chip({ label, selected, onPress, color, left, testID }: { label: string; selected: boolean; onPress: () => void; color?: string; left?: ReactNode; testID?: string } & Pick<PressableProps, "accessibilityHint">) {
  const c = useColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      testID={testID}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        height: 36,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: selected ? (color ?? c.accent) : c.line,
        backgroundColor: selected ? c.accentSoft : c.surface,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      {left}
      <T v="label" color={selected ? c.ink : c.muted}>{label}</T>
    </Pressable>
  );
}

export function SectionTitle({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: space.sm }}>
      <T v="heading">{title}</T>
      {right}
    </View>
  );
}
