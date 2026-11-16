import { Link } from "expo-router";
import { ArrowDownLeftIcon, ArrowUpRightIcon, SettingsIcon } from "@/lib/icons";
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { Ring } from "@/components/charts";
import { TxnRow } from "@/components/txn-row";
import { Button, Card, Screen, SectionTitle, T } from "@/components/ui";
import { groupByDay, monthPace, summarize } from "@/lib/analytics";
import { dayLabel, money0, monthKey, monthName, signed, today } from "@/lib/format";
import { useData } from "@/lib/store";
import { num, space, useColors } from "@/lib/theme";

export default function Home() {
  const c = useColors();
  const { ready, txns, budgets } = useData();
  const [shown, setShown] = useState(25);
  const month = monthKey(today());
  const s = useMemo(() => summarize(txns, month), [txns, month]);
  const groups = useMemo(() => groupByDay(txns, shown), [txns, shown]);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: c.bg }}>
        <ActivityIndicator color={c.accent} />
      </View>
    );
  }

  const budgetTotal = Object.values(budgets).reduce((a, b) => a + (b ?? 0), 0);
  const used = budgetTotal ? s.spending / budgetTotal : 0;
  const pace = monthPace(month);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <Screen
      header={
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View>
            <T v="label" muted>{greeting}</T>
            <T v="title">{monthName(month)}</T>
          </View>
          <Link href="/settings" asChild>
            <Pressable accessibilityRole="button" accessibilityLabel="Settings" testID="settings-button" hitSlop={10} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.surface, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: c.line }}>
              <SettingsIcon size={19} color={c.ink} />
            </Pressable>
          </Link>
        </View>
      }
    >
      <Card style={{ backgroundColor: c.accent, borderColor: c.accent }}>
        <T v="label" color={c.accentInk} style={{ opacity: 0.8 }}>Net this month</T>
        <T v="display" color={c.accentInk} testID="net-amount" style={{ marginTop: 2 }}>
          {s.net < 0 ? "−" : ""}
          {money0(Math.abs(s.net))}
        </T>
        <View style={{ flexDirection: "row", gap: space.lg, marginTop: space.md }}>
          <Stat icon={<ArrowDownLeftIcon size={16} color={c.accentInk} />} label="In" value={money0(s.income)} color={c.accentInk} />
          <Stat icon={<ArrowUpRightIcon size={16} color={c.accentInk} />} label="Out" value={money0(s.spending)} color={c.accentInk} />
        </View>
      </Card>

      <Card style={{ flexDirection: "row", alignItems: "center", gap: space.lg }}>
        <Ring value={used} size={96} stroke={10} color={used > 1 ? c.neg : used > pace + 0.08 ? "#e2a03c" : c.income} track={c.surface2}>
          <T v="heading" style={num}>{Math.round(used * 100)}%</T>
        </Ring>
        <View style={{ flex: 1, gap: 4 }}>
          <T v="heading">Monthly budget</T>
          <T muted style={num}>
            {money0(s.spending)} of {money0(budgetTotal)}
          </T>
          <T v="caption" muted>
            {used > 1
              ? `${money0(s.spending - budgetTotal)} over budget`
              : `${money0(Math.max(0, budgetTotal - s.spending))} left · ${Math.round(pace * 100)}% of the month gone`}
          </T>
        </View>
      </Card>

      <View>
        <SectionTitle title="Recent activity" right={<T v="caption" muted style={num}>{txns.length} total</T>} />
        {txns.length === 0 ? (
          <Card style={{ alignItems: "center", gap: space.sm, paddingVertical: space.xxl }}>
            <T v="heading">No transactions yet</T>
            <T muted style={{ textAlign: "center" }}>Tap + to add your first one, or load the demo in Settings.</T>
          </Card>
        ) : (
          <Card padded={false} style={{ paddingHorizontal: space.lg, paddingVertical: space.sm }}>
            {groups.map((g) => (
              <View key={g.date} style={{ paddingTop: space.sm }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <T v="caption" muted style={{ fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.6 }}>{dayLabel(g.date)}</T>
                  <T v="caption" muted style={num}>{signed(g.items.reduce((a, t) => a + t.amount, 0))}</T>
                </View>
                {g.items.map((t) => (
                  <TxnRow key={t.id} txn={t} />
                ))}
              </View>
            ))}
            {shown < txns.length && <Button kind="ghost" label="Show more" onPress={() => setShown((n) => n + 40)} style={{ marginVertical: space.md }} />}
          </Card>
        )}
      </View>
    </Screen>
  );
}

function Stat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.14)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 }}>
      {icon}
      <T v="label" color={color} style={{ opacity: 0.85 }}>{label}</T>
      <T v="label" color={color} style={[num, { fontWeight: "700" }]}>{value}</T>
    </View>
  );
}
