/** Money is stored in cents; dates as local YYYY-MM-DD strings. */
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const usd0 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export const money = (cents: number) => usd.format(cents / 100);
export const money0 = (cents: number) => usd0.format(Math.round(cents / 100));
export const signed = (cents: number) => `${cents > 0 ? "+" : "−"}${money(Math.abs(cents))}`;

const pad = (n: number) => String(n).padStart(2, "0");
export const isoOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const today = () => isoOf(new Date());
export const parseIso = (iso: string) => new Date(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10));
export const addDays = (iso: string, n: number) => {
  const d = parseIso(iso);
  d.setDate(d.getDate() + n);
  return isoOf(d);
};
export const monthKey = (iso: string) => iso.slice(0, 7);
export const addMonths = (key: string, n: number) => {
  const d = new Date(+key.slice(0, 4), +key.slice(5, 7) - 1 + n, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
};
export const daysInMonth = (key: string) => new Date(+key.slice(0, 4), +key.slice(5, 7), 0).getDate();

export const monthName = (key: string, style: "long" | "short" = "long") =>
  new Date(+key.slice(0, 4), +key.slice(5, 7) - 1, 1).toLocaleDateString("en-US", { month: style });
export const monthYear = (key: string) =>
  new Date(+key.slice(0, 4), +key.slice(5, 7) - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

export function dayLabel(iso: string) {
  const t = today();
  if (iso === t) return "Today";
  if (iso === addDays(t, -1)) return "Yesterday";
  const d = parseIso(iso);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", ...(iso.slice(0, 4) !== t.slice(0, 4) ? { year: "numeric" } : {}) });
}
