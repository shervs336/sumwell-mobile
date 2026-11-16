import { MinusIcon, PlusIcon } from "@/lib/icons";
import { useMemo } from "react";
import { Pressable, View } from "react-native";
import { CategoryIcon } from "@/components/category-icon";
import { Bar, Ring } from "@/components/charts";
import { Card, Screen, SectionTitle, T } from "@/components/ui";
import { budgetRows, monthPace } from "@/lib/analytics";
import { categoryColor, DEFAULT_BUDGETS, EXPENSE_CATEGORIES, type Category } from "@/lib/categories";
import { money0, monthKey, monthName, today } from "@/lib/format";
import { tap } from "@/lib/haptics";
import { useData } from "@/lib/store";
import { num, space, useColors } from "@/lib/theme";

const STEP = 2_500; // $25

export default function Budgets() {
  const c = useColors();
  const { txns, budgets, setBudget } = useData();
  const month = monthKey(today());
  const rows = useMemo(() => budgetRows(txns, budgets, month), [txns, budgets, month]);
  const pace = monthPace(month);
  const total = rows.reduce((a, r) => a + r.budget, 0);
  const spent = rows.reduce((a, r) => a + r.spent, 0);
  const unbudgeted = EXPENSE_CATEGORIES.filter((cat) => !(cat in budgets));

  const change = (cat: Category, delta: number) => {
    tap();
    setBudget(cat, Math.max(0, (budgets[cat] ?? 0) + delta));
  };

  return (
    <Screen header={<T v="title">Budgets</T>}>
      <Card style={{ flexDirection: "row", alignItems: "center", gap: space.lg }}>
        <Ring value={total ? spent / total : 0} size={84} stroke={9} color={spent > total ? c.neg : c.accent} track={c.surface2}>
          <T v="label" style={num}>{total ? Math.round((spent / total) * 100) : 0}%</T>
        </Ring>
        <View style={{ flex: 1, gap: 2 }}>
          <T v="label" muted>{monthName(month)} so far</T>
          <T v="title" style={{ fontSize: 24 }}>{money0(spent)}</T>
          <T v="caption" muted style={num}>of {money0(total)} budgeted · {Math.round(pace * 100)}% of the month gone</T>
        </View>
      </Card>

      <View style={{ gap: space.md }}>
        {rows.map((r) => {
          const color = r.status === "over" ? c.neg : categoryColor(r.category, c.scheme);
          return (
            <Card key={r.category} style={{ gap: space.md }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
                <CategoryIcon category={r.category} size={36} />
                <View style={{ flex: 1 }}>
                  <T style={{ fontWeight: "600" }}>{r.category}</T>
                  <T v="caption" muted style={num}>
                    {money0(r.spent)} of {money0(r.budget)}
                  </T>
                </View>
                <Stepper label={r.category} onMinus={() => change(r.category, -STEP)} onPlus={() => change(r.category, STEP)} />
              </View>
              <Bar value={r.ratio} color={color} track={c.surface2} marker={pace} />
              {r.status !== "ok" && (
                <T v="caption" color={r.status === "over" ? c.neg : c.muted}>
                  {r.status === "over" ? `${money0(r.spent - r.budget)} over budget` : "Spending faster than the month is passing"}
                </T>
              )}
            </Card>
          );
        })}
      </View>

      {unbudgeted.length > 0 && (
        <View>
          <SectionTitle title="Add a budget" />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
            {unbudgeted.map((cat) => (
              <Pressable
                key={cat}
                accessibilityRole="button"
                accessibilityLabel={`Add a budget for ${cat}`}
                onPress={() => {
                  tap();
                  setBudget(cat, DEFAULT_BUDGETS[cat] ?? 10_000);
                }}
                style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, height: 38, borderRadius: 999, borderWidth: 1, borderColor: c.line, backgroundColor: c.surface, opacity: pressed ? 0.7 : 1 })}
              >
                <PlusIcon size={14} color={c.muted} />
                <T v="label">{cat}</T>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </Screen>
  );
}

function Stepper({ label, onMinus, onPlus }: { label: string; onMinus: () => void; onPlus: () => void }) {
  const c = useColors();
  const btn = { width: 34, height: 34, borderRadius: 17, alignItems: "center" as const, justifyContent: "center" as const, backgroundColor: c.surface2 };
  return (
    <View style={{ flexDirection: "row", gap: 6 }}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Lower ${label} budget by $25`} onPress={onMinus} hitSlop={6} style={btn}>
        <MinusIcon size={16} color={c.ink} />
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={`Raise ${label} budget by $25`} onPress={onPlus} hitSlop={6} style={btn}>
        <PlusIcon size={16} color={c.ink} />
      </Pressable>
    </View>
  );
}
