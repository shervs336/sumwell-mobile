import { router } from "expo-router";
import { DatabaseIcon, ExternalLinkIcon, EraserIcon, XIcon } from "@/lib/icons";
import { useState } from "react";
import { Linking, Platform, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Card, T } from "@/components/ui";
import { warn } from "@/lib/haptics";
import { useData } from "@/lib/store";
import { space, useColors } from "@/lib/theme";

export default function Settings() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { txns, demo, resetDemo, eraseAll } = useData();
  const [confirm, setConfirm] = useState<"demo" | "erase" | null>(null);
  const close = () => (router.canGoBack() ? router.back() : router.replace("/"));

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ padding: space.lg, paddingTop: Platform.OS === "ios" ? space.lg : insets.top + space.lg, gap: space.lg }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <T v="title">Settings</T>
        <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={close} hitSlop={10} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.surface2, alignItems: "center", justifyContent: "center" }}>
          <XIcon size={18} color={c.ink} />
        </Pressable>
      </View>

      <Card style={{ gap: space.sm }}>
        <T v="heading">Your data</T>
        <T muted style={{ lineHeight: 21 }}>
          {txns.length} transactions, saved only on this device. {demo ? "You're looking at generated demo data." : "Nothing is sent anywhere."}
        </T>
        <View style={{ gap: space.sm, marginTop: space.sm }}>
          {confirm === "demo" ? (
            <Confirm text="Replace everything with a fresh demo history?" action="Load demo" onYes={() => (resetDemo(), setConfirm(null), close())} onNo={() => setConfirm(null)} />
          ) : (
            <Button kind="ghost" label="Load demo data" icon={<DatabaseIcon size={18} color={c.ink} />} onPress={() => setConfirm("demo")} testID="load-demo" />
          )}
          {confirm === "erase" ? (
            <Confirm text="Delete every transaction and start empty?" action="Erase all" danger onYes={() => (warn(), eraseAll(), setConfirm(null), close())} onNo={() => setConfirm(null)} />
          ) : (
            <Button kind="danger" label="Start fresh" icon={<EraserIcon size={18} color={c.neg} />} onPress={() => setConfirm("erase")} testID="erase-all" />
          )}
        </View>
      </Card>

      <Card style={{ gap: space.sm }}>
        <T v="heading">About</T>
        <T muted style={{ lineHeight: 21 }}>
          Sumwell Mobile is the pocket companion to the Sumwell web dashboard, built with Expo and React Native. It&apos;s a portfolio project; merchants and amounts in the demo are made up.
        </T>
        <Pressable accessibilityRole="link" onPress={() => Linking.openURL("https://sumwell-finance-dashboard.vercel.app")} style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: space.xs }}>
          <T v="label" color={c.accent}>Open the Sumwell dashboard</T>
          <ExternalLinkIcon size={14} color={c.accent} />
        </Pressable>
      </Card>
    </ScrollView>
  );
}

function Confirm({ text, action, onYes, onNo, danger }: { text: string; action: string; onYes: () => void; onNo: () => void; danger?: boolean }) {
  return (
    <View style={{ gap: space.sm }} accessibilityRole="alert">
      <T style={{ fontWeight: "500" }}>{text}</T>
      <View style={{ flexDirection: "row", gap: space.sm }}>
        <Button label="Cancel" kind="ghost" onPress={onNo} style={{ flex: 1 }} />
        <Button label={action} kind={danger ? "danger" : "primary"} onPress={onYes} style={{ flex: 1 }} testID="confirm" />
      </View>
    </View>
  );
}
