// ── TypeScript interfaces matching Rust DTOs ──────────────────
// These mirror the serde output from src-tauri/src/models.rs
// so that `invoke<T>()` calls are fully type-safe.

export interface Category {
  id: number;
  name: string;
  type: "Income" | "Expense";
}

export interface TransactionRow {
  id: number;
  date: string;
  type: "Income" | "Expense";
  category_id: number;
  category_name: string;
  amount: number;
  description: string;
  created_at: string;
}

export interface Budget {
  id: number;
  category_id: number;
  planned_amount: number;
  month: number;
  year: number;
}

export interface BudgetRow {
  id: number | null;
  category_id: number;
  category_name: string;
  planned_amount: number;
  month: number;
  year: number;
}

export interface DashboardSummary {
  total_income: number;
  total_expense: number;
  net_savings: number;
}

export interface CategorySummary {
  category_id: number;
  category_name: string;
  total_amount: number;
}

// ── Period filter ─────────────────────────────────────────────

export type PeriodKind = "weekly" | "fortnightly" | "monthly";
