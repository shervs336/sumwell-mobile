import { router, useLocalSearchParams } from "expo-router";
import { DeleteIcon, Trash2Icon, XIcon } from "@/lib/icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CategoryIcon } from "@/components/category-icon";
import { Button, Chip, T } from "@/components/ui";
import { categoryColor, EXPENSE_CATEGORIES, type Category } from "@/lib/categories";
import { addDays, dayLabel, today } from "@/lib/format";
import { success, tap, warn } from "@/lib/haptics";
import { useData } from "@/lib/store";
import { font, num, radius, space, useColors } from "@/lib/theme";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "back"] as const;

/** "12.5" → 1250 cents */
const toCents = (s: string) => Math.round(parseFloat(s || "0") * 100);
const fromCents = (n: number) => (Math.abs(n) / 100).toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");

/** Appends a key to the typed amount, keeping it a sensible money value. */
function press(amount: string, key: string) {
  if (key === "back") return amount.slice(0, -1);
  if (key === ".") return amount.includes(".") ? amount : (amount || "0") + ".";
  const [whole, frac] = amount.split(".");
  if (frac != null && frac.length >= 2) return amount;
  if (frac == null && whole.replace(/^0/, "").length >= 6) return amount;
  if (amount === "0") return key;
  return amount + key;
}

export default function AddTransaction() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { txns, save, remove } = useData();
  const editing = useMemo(() => (id ? txns.find((t) => t.id === id) : undefined), [id, txns]);

  const [kind, setKind] = useState<"expense" | "income">(editing && editing.amount > 0 ? "income" : "expense");
  const [amount, setAmount] = useState(editing ? fromCents(editing.amount) : "");
  const [category, setCategory] = useState<Category>(editing?.category ?? "Dining");
  const [note, setNote] = useState(editing?.note ?? "");
  const [date, setDate] = useState(editing?.date ?? today());
  const [confirmDelete, setConfirmDelete] = useState(false);
  const noteFocused = useRef(false);

  const cents = toCents(amount);
  const valid = cents > 0;
  const dates = useMemo(() => {
    const list = Array.from({ length: 7 }, (_, i) => addDays(today(), -i));
    return list.includes(date) ? list : [date, ...list];
  }, [date]);

  const key = (k: string) => {
    tap();
    setAmount((a) => press(a, k));
  };

  // In a browser, the physical keyboard can type the amount too.
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const onKey = (e: KeyboardEvent) => {
      if (noteFocused.current) return;
      if (/^[0-9.]$/.test(e.key)) setAmount((a) => press(a, e.key));
      else if (e.key === "Backspace") setAmount((a) => press(a, "back"));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function submit() {
    if (!valid) return warn();
    const cat: Category = kind === "income" ? "Income" : category;
    save({ id: editing?.id, date, category: cat, note: note.trim().slice(0, 60), amount: kind === "income" ? cents : -cents });
    success();
    close();
  }

  function close() {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: Platform.OS === "ios" ? space.md : insets.top + space.sm }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: space.lg }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={close} hitSlop={10} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.surface2, alignItems: "center", justifyContent: "center" }}>
          <XIcon size={18} color={c.ink} />
        </Pressable>
        <View accessibilityRole="radiogroup" style={{ flexDirection: "row", backgroundColor: c.surface2, borderRadius: radius.pill, padding: 3 }}>
          {(["expense", "income"] as const).map((k) => (
            <Pressable
              key={k}
              accessibilityRole="radio"
              accessibilityState={{ checked: kind === k }}
              testID={`kind-${k}`}
              onPress={() => {
                tap();
                setKind(k);
              }}
              style={{ paddingHorizontal: 16, height: 32, borderRadius: radius.pill, justifyContent: "center", backgroundColor: kind === k ? c.surface : "transparent" }}
            >
              <T v="label" color={kind === k ? c.ink : c.muted}>{k === "expense" ? "Expense" : "Income"}</T>
            </Pressable>
          ))}
        </View>
        {editing ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Delete transaction" testID="delete-button" onPress={() => setConfirmDelete(true)} hitSlop={10} style={{ width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" }}>
            <Trash2Icon size={19} color={c.neg} />
          </Pressable>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: space.lg, gap: space.lg }} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: "center", paddingTop: space.lg }} accessible accessibilityLabel={`Amount ${amount || "0"} dollars`}>
          <T v="label" muted>{editing ? "Edit transaction" : kind === "income" ? "Money in" : "Money out"}</T>
          <T testID="amount-display" style={[font, num, { fontSize: 56, fontWeight: "700", letterSpacing: -2, color: amount ? (kind === "income" ? c.pos : c.ink) : c.muted }]}>
            ${amount || "0"}
          </T>
        </View>

        {kind === "expense" && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm }} accessibilityLabel="Category">
            {EXPENSE_CATEGORIES.map((cat) => (
              <Chip key={cat} label={cat} selected={category === cat} color={categoryColor(cat, c.scheme)} onPress={() => (tap(), setCategory(cat))} left={<CategoryIcon category={cat} size={22} />} testID={`cat-${cat}`} />
            ))}
          </ScrollView>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm }} accessibilityLabel="Date">
          {dates.map((d) => (
            <Chip key={d} label={dayLabel(d)} selected={date === d} onPress={() => (tap(), setDate(d))} />
          ))}
        </ScrollView>

        <TextInput
          value={note}
          onChangeText={setNote}
          onFocus={() => (noteFocused.current = true)}
          onBlur={() => (noteFocused.current = false)}
          placeholder={kind === "income" ? "From (e.g. Payroll)" : "Where? (e.g. Corner Pantry)"}
          placeholderTextColor={c.muted}
          maxLength={60}
          returnKeyType="done"
          accessibilityLabel="Note"
          testID="note-input"
          style={[font, { height: 48, borderRadius: radius.md, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, paddingHorizontal: space.lg, fontSize: 15, color: c.ink }]}
        />

        <View style={{ flexDirection: "row", flexWrap: "wrap", rowGap: space.sm }} accessibilityLabel="Number pad">
          {KEYS.map((k) => (
            <View key={k} style={{ width: "33.333%", paddingHorizontal: space.xs }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={k === "back" ? "Delete digit" : k === "." ? "Decimal point" : k}
                testID={`key-${k}`}
                onPress={() => key(k)}
                onLongPress={k === "back" ? () => setAmount("") : undefined}
                style={({ pressed }) => ({ height: 54, borderRadius: radius.md, alignItems: "center", justifyContent: "center", backgroundColor: pressed ? c.surface2 : c.surface })}
              >
                {k === "back" ? <DeleteIcon size={22} color={c.ink} /> : <T style={[num, { fontSize: 24, fontWeight: "500" }]}>{k}</T>}
              </Pressable>
            </View>
          ))}
        </View>

        <Button label={editing ? "Save changes" : `Add ${kind}`} onPress={submit} disabled={!valid} testID="save-button" />
      </ScrollView>

      {confirmDelete && editing && (
        <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: space.lg, paddingBottom: insets.bottom + space.lg, backgroundColor: c.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, gap: space.md, borderWidth: 1, borderColor: c.line }} accessibilityRole="alert">
          <T v="heading">Delete this transaction?</T>
          <T muted>{editing.note || editing.category} · this can&apos;t be undone.</T>
          <Button
            label="Delete"
            kind="danger"
            testID="confirm-delete"
            onPress={() => {
              remove(editing.id);
              warn();
              close();
            }}
          />
          <Button label="Keep it" kind="ghost" onPress={() => setConfirmDelete(false)} />
        </View>
      )}
    </View>
  );
}
