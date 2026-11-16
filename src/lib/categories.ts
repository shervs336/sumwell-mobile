import {
  BusIcon, CarrotIcon, FilmIcon, HeartPulseIcon, HomeIcon, PlaneIcon, PlugIcon, RepeatIcon, ShoppingBagIcon, SparklesIcon, UtensilsIcon, WalletIcon,
  type LucideIcon,
} from "@/lib/icons";

export const CATEGORIES = [
  "Income", "Housing", "Groceries", "Dining", "Transport", "Utilities", "Subscriptions", "Shopping", "Health", "Entertainment", "Travel", "Other",
] as const;
export type Category = (typeof CATEGORIES)[number];
export const EXPENSE_CATEGORIES = CATEGORIES.filter((c) => c !== "Income");

/** Same colors as the Sumwell dashboard (light, dark). */
export const CATEGORY: Record<Category, { icon: LucideIcon; light: string; dark: string }> = {
  Income: { icon: WalletIcon, light: "#0f9a72", dark: "#34d39f" },
  Housing: { icon: HomeIcon, light: "#5248d8", dark: "#8d86ff" },
  Groceries: { icon: CarrotIcon, light: "#10956f", dark: "#36c995" },
  Dining: { icon: UtensilsIcon, light: "#e2683c", dark: "#ff8a5c" },
  Transport: { icon: BusIcon, light: "#2b7cc6", dark: "#5aa8f0" },
  Utilities: { icon: PlugIcon, light: "#c3920f", dark: "#e9b53c" },
  Subscriptions: { icon: RepeatIcon, light: "#9a4fd0", dark: "#c286f2" },
  Shopping: { icon: ShoppingBagIcon, light: "#d4427a", dark: "#f2739f" },
  Health: { icon: HeartPulseIcon, light: "#1397a6", dark: "#3cc3d1" },
  Entertainment: { icon: FilmIcon, light: "#73881d", dark: "#a6c048" },
  Travel: { icon: PlaneIcon, light: "#b0583a", dark: "#e08a66" },
  Other: { icon: SparklesIcon, light: "#8b9099", dark: "#9ba0aa" },
};

export const categoryColor = (c: Category, scheme: "light" | "dark") => CATEGORY[c][scheme];

/** Monthly budgets in cents. */
export const DEFAULT_BUDGETS: Partial<Record<Category, number>> = {
  Housing: 145_000,
  Groceries: 60_000,
  Dining: 35_000,
  Transport: 22_000,
  Utilities: 22_000,
  Subscriptions: 8_000,
  Shopping: 30_000,
  Entertainment: 15_000,
};

/** Bills on fixed dates: left out of "spending faster than the month" warnings. */
export const FIXED: Category[] = ["Housing", "Utilities", "Subscriptions"];
