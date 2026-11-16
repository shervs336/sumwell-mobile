import type { Category } from "./categories";
import { addDays, parseIso, today } from "./format";
import type { Txn } from "./types";

/**
 * Generates about five months of realistic personal finances ending today, so the demo always looks
 * current: pay on the 1st and 15th, rent on the 1st, groceries twice a week, more dining on weekends.
 * A tiny seeded random generator keeps it repeatable without shipping a data library in the app.
 */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DINING = ["Little Saffron", "Noodle Theory", "Brick Oven Pizza Co.", "Morning Ritual Cafe", "Taco Lantern", "Sushi Hana"];
const GROCERS = ["Greenleaf Market", "Corner Pantry", "Harvest Co-op"];
const SHOPS = ["Northside Books", "Homebody Home Goods", "Thread & Pine", "Voltline Electronics"];
const FUN = ["Palace Cinema", "Arcade Hall", "City Museum", "Live at the Grove"];

export function demoTransactions(days = 150): Txn[] {
  const end = today();
  const rand = mulberry32(Number(end.replaceAll("-", "")));
  const between = (min: number, max: number) => Math.round((min + rand() * (max - min)) * 100);
  const pick = <T,>(list: T[]) => list[Math.floor(rand() * list.length)];
  const out: Txn[] = [];
  let n = 0;
  const add = (date: string, category: Category, note: string, amount: number) => out.push({ id: `demo-${n++}`, date, category, note, amount });

  for (let i = days - 1; i >= 0; i--) {
    const date = addDays(end, -i);
    const d = parseIso(date);
    const day = d.getDate(), dow = d.getDay(), month = d.getMonth();
    const weekend = dow === 0 || dow === 6;
    const winter = [11, 0, 1].includes(month);

    if (day === 1 || day === 15) add(date, "Income", "Payroll: Atlas & Pine Studio", 265_000);
    if (day === 10 && rand() < 0.7) add(date, "Income", "Freelance invoice", between(300, 1200));
    if (day === 1) add(date, "Housing", "Rent: Maple Court", -145_000);
    if (day === 6) add(date, "Utilities", "Brightgrid Electric", -between(winter ? 120 : 62, winter ? 160 : 95));
    if (day === 12) add(date, "Utilities", "Fiberlink Internet", -6_500);
    if (day === 22) add(date, "Utilities", "Pocketcell Mobile", -4_200);
    if (day === 3) add(date, "Subscriptions", "StreamBox Premium", -1_599);
    if (day === 9) add(date, "Subscriptions", "Tunewave Music", -1_099);
    if (day === 20) add(date, "Subscriptions", "Ironside Gym", -4_500);

    if (dow === 2 || dow === 6 || rand() < 0.1) add(date, "Groceries", pick(GROCERS), -between(28, 120));
    const meals = weekend ? (rand() < 0.75 ? (rand() < 0.3 ? 2 : 1) : 0) : rand() < 0.4 ? 1 : 0;
    for (let m = 0; m < meals; m++) {
      const place = pick(DINING);
      add(date, "Dining", place, -(place.includes("Cafe") ? between(4, 12) : between(14, 62)));
    }
    if (!weekend && rand() < 0.6) add(date, "Transport", "City Metro", -275);
    if (rand() < 0.1) add(date, "Transport", "Fuel Stop", -between(38, 62));
    if (rand() < (month >= 10 ? 0.2 : 0.08)) add(date, "Shopping", pick(SHOPS), -between(18, month >= 10 ? 220 : 130));
    if (rand() < 0.04) add(date, "Health", "Wellway Pharmacy", -between(12, 90));
    if (weekend && rand() < 0.22) add(date, "Entertainment", pick(FUN), -between(12, 80));
  }
  return out.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
