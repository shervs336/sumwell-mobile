import { ChevronLeftIcon, ChevronRightIcon } from "@/lib/icons";
import { useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { CategoryIcon } from "@/components/category-icon";
import { Donut, MonthBars } from "@/components/charts";
import { Card, Screen, SectionTitle, T } from "@/components/ui";
import { byCategory, monthSeries, summarize } from "@/lib/analytics";
import { categoryColor } from "@/lib/categories";
import { addMonths, daysInMonth, money, money0, monthKey, monthName, monthYear, today } from "@/lib/format";
import { tap } from "@/lib/haptics";
import { useData } from "@/lib/store";
import { num, space, useColors } from "@/lib/theme";

export default function Insights() {
  const c = useColors();
  const { txns } = useData();
  const current = monthKey(today());
  const [month, setMonth] = useState(current);
  const earliest = txns.length ? monthKey(txns[txns.length - 1].date) : current;

  const s = useMemo(() => summarize(txns, month), [txns, month]);
  const prev = useMemo(() => summarize(txns, addMonths(month, -1)), [txns, month]);
  const cats = useMemo(() => byCategory(txns, month), [txns, month]);
  const series = useMemo(() => monthSeries(txns, month), [txns, month]);
  const days = month === current ? +today().slice(8, 10) : daysInMonth(month);
  const change = prev.spending ? (s.spending - prev.spending) / prev.spending : null;

  const step = (n: number) => {
    tap();
    setMonth((m) => addMonths(m, n));
  };

  return (
    <Screen header={<T v="title">Insights</T>}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <NavButton label="Previous month" disabled={month <= earliest} onPress={() => step(-1)} icon={<ChevronLeftIcon size={20} color={c.ink} />} />
        <T v="heading" testID="insights-month">{monthYear(month)}</T>
        <NavButton label="Next month" disabled={month >= current} onPress={() => step(1)} icon={<ChevronRightIcon size={20} color={c.ink} />} />
      </View>

      <Card style={{ alignItems: "center", gap: space.lg }}>
        <Donut parts={cats.map((x) => ({ value: x.amount, color: categoryColor(x.category, c.scheme) }))}>
          <T v="caption" muted>Spent</T>
          <T v="title" testID="insights-spent">{money0(s.spending)}</T>
          {change != null && (
            <T v="caption" color={change > 0 ? c.neg : c.pos} style={num}>
              {change > 0 ? "▲" : "▼"} {Math.abs(Math.round(change * 100))}% vs {monthName(addMonths(month, -1), "short")}
            </T>
          )}
        </Donut>
        <View style={{ flexDirection: "row", width: "100%", justifyContent: "space-around" }}>
          <Mini label="Per day" value={money0(s.spending / Math.max(1, days))} />
          <Mini label="Earned" value={money0(s.income)} />
          <Mini label="Saved" value={`${s.income ? Math.round((s.net / s.income) * 100) : 0}%`} />
        </View>
      </Card>

      <View>
        <SectionTitle title="By category" />
        <Card padded={false} style={{ paddingHorizontal: space.lg, paddingVertical: space.sm }}>
          {cats.length === 0 && <T muted style={{ paddingVertical: space.lg, textAlign: "center" }}>No spending this month.</T>}
          {cats.map((x) => (
            <View key={x.category} style={{ flexDirection: "row", alignItems: "center", gap: space.md, paddingVertical: 10 }}>
              <CategoryIcon category={x.category} size={36} />
              <View style={{ flex: 1, gap: 6 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <T style={{ fontWeight: "500" }}>{x.category}</T>
                  <T v="amount">{money(x.amount)}</T>
                </View>
                <View style={{ height: 6, borderRadius: 3, backgroundColor: c.surface2 }}>
                  <View style={{ width: `${x.share * 100}%`, height: 6, borderRadius: 3, backgroundColor: categoryColor(x.category, c.scheme) }} />
                </View>
              </View>
              <T v="caption" muted style={[num, { width: 36, textAlign: "right" }]}>{Math.round(x.share * 100)}%</T>
            </View>
          ))}
        </Card>
      </View>

      <View>
        <SectionTitle
          title="Six months"
          right={
            <View style={{ flexDirection: "row", gap: space.md }}>
              <Legend color={c.income} label="In" />
              <Legend color={c.accent} label="Out" />
            </View>
          }
        />
        <Card>
          <MonthBars data={series.map((m) => ({ label: monthName(m.month, "short"), income: m.income, spending: m.spending, current: m.month === month }))} />
        </Card>
      </View>
    </Screen>
  );
}

function NavButton({ label, onPress, disabled, icon }: { label: string; onPress: () => void; disabled: boolean; icon: React.ReactNode }) {
  const c = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      hitSlop={8}
      style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, opacity: disabled ? 0.35 : 1 }}
    >
      {icon}
    </Pressable>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ alignItems: "center", gap: 2 }}>
      <T v="caption" muted>{label}</T>
      <T v="heading" style={num}>{value}</T>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
      <T v="caption" muted>{label}</T>
    </View>
  );
}
