import { FIXED, type Category } from "./categories";
import { addMonths, daysInMonth, monthKey, today } from "./format";
import type { Txn } from "./types";

export type MonthSummary = { income: number; spending: number; net: number; count: number };

export function summarize(txns: Txn[], month: string): MonthSummary {
  let income = 0, spending = 0, count = 0;
  for (const t of txns) {
    if (monthKey(t.date) !== month) continue;
    count++;
    if (t.amount > 0) income += t.amount;
    else spending -= t.amount;
  }
  return { income, spending, net: income - spending, count };
}

export function byCategory(txns: Txn[], month: string) {
  const m = new Map<Category, number>();
  let total = 0;
  for (const t of txns) {
    if (t.amount >= 0 || monthKey(t.date) !== month) continue;
    m.set(t.category, (m.get(t.category) ?? 0) - t.amount);
    total -= t.amount;
  }
  return [...m.entries()].map(([category, amount]) => ({ category, amount, share: total ? amount / total : 0 })).sort((a, b) => b.amount - a.amount);
}

/** Income and spending for the last `n` months, oldest first. */
export function monthSeries(txns: Txn[], endMonth: string, n = 6) {
  const months = Array.from({ length: n }, (_, i) => addMonths(endMonth, i - n + 1));
  return months.map((m) => ({ month: m, ...summarize(txns, m) }));
}

/** How far through the month we are (1 for past months). */
export function monthPace(month: string) {
  const t = today();
  if (monthKey(t) !== month) return month < monthKey(t) ? 1 : 0;
  return +t.slice(8, 10) / daysInMonth(month);
}

export function budgetRows(txns: Txn[], budgets: Partial<Record<Category, number>>, month: string) {
  const spent = new Map(byCategory(txns, month).map((c) => [c.category, c.amount]));
  const pace = monthPace(month);
  return (Object.entries(budgets) as [Category, number][])
    .map(([category, budget]) => {
      const s = spent.get(category) ?? 0;
      const ratio = s / budget;
      const status = ratio > 1 ? "over" : !FIXED.includes(category) && ratio > pace + 0.1 ? "ahead" : "ok";
      return { category, budget, spent: s, ratio, status: status as "over" | "ahead" | "ok" };
    })
    .sort((a, b) => b.ratio - a.ratio);
}

export function groupByDay(txns: Txn[], limit: number) {
  const out: { date: string; items: Txn[] }[] = [];
  for (const t of txns.slice(0, limit)) {
    const last = out[out.length - 1];
    if (last && last.date === t.date) last.items.push(t);
    else out.push({ date: t.date, items: [t] });
  }
  return out;
}
