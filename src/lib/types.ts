import type { Category } from "./categories";

export type Txn = {
  id: string;
  /** Local date, YYYY-MM-DD */
  date: string;
  category: Category;
  note: string;
  /** Cents. Negative = money out. */
  amount: number;
};
