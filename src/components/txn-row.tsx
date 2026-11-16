import { router } from "expo-router";
import { Pressable, View } from "react-native";
import { categoryColor } from "@/lib/categories";
import { signed } from "@/lib/format";
import { space, useColors } from "@/lib/theme";
import type { Txn } from "@/lib/types";
import { CategoryIcon } from "./category-icon";
import { T } from "./ui";

export function TxnRow({ txn }: { txn: Txn }) {
  const c = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${txn.note || txn.category}, ${txn.category}, ${signed(txn.amount)}. Edit`}
      testID={`txn-${txn.id}`}
      onPress={() => router.push({ pathname: "/add", params: { id: txn.id } })}
      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: space.md, paddingVertical: 10, opacity: pressed ? 0.6 : 1 })}
    >
        <CategoryIcon category={txn.category} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <T numberOfLines={1} style={{ fontWeight: "500" }}>{txn.note || txn.category}</T>
          <T v="caption" muted numberOfLines={1}>
            <T v="caption" color={categoryColor(txn.category, c.scheme)}>●</T> {txn.category}
          </T>
        </View>
        <T v="amount" color={txn.amount > 0 ? c.pos : c.ink}>{signed(txn.amount)}</T>
    </Pressable>
  );
}
