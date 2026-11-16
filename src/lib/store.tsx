import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from "react";
import { DEFAULT_BUDGETS, type Category } from "./categories";
import { demoTransactions } from "./demo";
import type { Txn } from "./types";

/**
 * All data lives on the device (AsyncStorage). The first launch fills it with a demo history;
 * Settings can reset that or start empty.
 */
type State = { ready: boolean; txns: Txn[]; budgets: Partial<Record<Category, number>>; demo: boolean };
type Action =
  | { type: "load"; state: Omit<State, "ready"> }
  | { type: "save"; txn: Txn }
  | { type: "remove"; id: string }
  | { type: "budget"; category: Category; cents: number }
  | { type: "replace"; state: Omit<State, "ready"> };

const KEY = "sumwell-mobile:v1";

const byDateDesc = (a: Txn, b: Txn) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.id.localeCompare(a.id));

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "load":
    case "replace":
      return { ...a.state, ready: true };
    case "save": {
      const rest = s.txns.filter((t) => t.id !== a.txn.id);
      return { ...s, txns: [a.txn, ...rest].sort(byDateDesc) };
    }
    case "remove":
      return { ...s, txns: s.txns.filter((t) => t.id !== a.id) };
    case "budget": {
      const budgets = { ...s.budgets };
      if (a.cents > 0) budgets[a.category] = a.cents;
      else delete budgets[a.category];
      return { ...s, budgets };
    }
  }
}

type Store = State & {
  save: (t: Omit<Txn, "id"> & { id?: string }) => void;
  remove: (id: string) => void;
  setBudget: (c: Category, cents: number) => void;
  resetDemo: () => void;
  eraseAll: () => void;
};

const Ctx = createContext<Store | null>(null);

const freshDemo = () => ({ txns: demoTransactions(), budgets: { ...DEFAULT_BUDGETS }, demo: true });

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { ready: false, txns: [], budgets: {}, demo: true });
  const loaded = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        const saved = raw ? (JSON.parse(raw) as Omit<State, "ready">) : null;
        dispatch({ type: "load", state: saved?.txns ? saved : freshDemo() });
      } catch {
        dispatch({ type: "load", state: freshDemo() });
      }
      loaded.current = true;
    })();
  }, []);

  // Persist after every change (debounced so typing in a budget doesn't write each keystroke).
  useEffect(() => {
    if (!loaded.current || !state.ready) return;
    const t = setTimeout(() => {
      const { txns, budgets, demo } = state;
      AsyncStorage.setItem(KEY, JSON.stringify({ txns, budgets, demo })).catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [state]);

  const save = useCallback((t: Omit<Txn, "id"> & { id?: string }) => {
    dispatch({ type: "save", txn: { ...t, id: t.id ?? `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}` } });
  }, []);
  const remove = useCallback((id: string) => dispatch({ type: "remove", id }), []);
  const setBudget = useCallback((category: Category, cents: number) => dispatch({ type: "budget", category, cents }), []);
  const resetDemo = useCallback(() => dispatch({ type: "replace", state: freshDemo() }), []);
  const eraseAll = useCallback(() => dispatch({ type: "replace", state: { txns: [], budgets: { ...DEFAULT_BUDGETS }, demo: false } }), []);

  const value = useMemo(() => ({ ...state, save, remove, setBudget, resetDemo, eraseAll }), [state, save, remove, setBudget, resetDemo, eraseAll]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useData() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useData must be used inside DataProvider");
  return v;
}
