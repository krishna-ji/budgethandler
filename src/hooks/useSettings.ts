import { useCallback, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { Category, Budget, BudgetRow } from "@/types";

// ═══════════════════════════════════════════════════════════════
//  CATEGORY SETTINGS
// ═══════════════════════════════════════════════════════════════

export interface CategorySettings {
  categories: Category[];
  loading: boolean;
  error: string | null;
  addCategory: (name: string, txType: "Income" | "Expense") => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  refresh: () => void;
}

export function useCategories(): CategorySettings {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cats = await invoke<Category[]>("get_categories");
      setCategories(cats);
    } catch (err) {
      setError(typeof err === "string" ? err : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = useCallback(
    async (name: string, txType: "Income" | "Expense") => {
      await invoke<Category>("add_category", { name, txType });
      await fetchCategories();
    },
    [fetchCategories]
  );

  const deleteCategory = useCallback(
    async (id: number) => {
      await invoke<void>("delete_category", { id });
      await fetchCategories();
    },
    [fetchCategories]
  );

  return {
    categories,
    loading,
    error,
    addCategory,
    deleteCategory,
    refresh: fetchCategories,
  };
}

// ═══════════════════════════════════════════════════════════════
//  BUDGET SETTINGS
// ═══════════════════════════════════════════════════════════════

export interface BudgetSettings {
  budgets: BudgetRow[];
  loading: boolean;
  error: string | null;
  upsertBudget: (
    categoryId: number,
    month: number,
    year: number,
    plannedAmount: number
  ) => Promise<void>;
  refresh: (month: number, year: number) => void;
}

export function useBudgets(
  initialMonth: number,
  initialYear: number
): BudgetSettings {
  const [budgets, setBudgets] = useState<BudgetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBudgets = useCallback(async (month: number, year: number) => {
    setLoading(true);
    setError(null);
    try {
      const rows = await invoke<BudgetRow[]>("get_budgets", { month, year });
      setBudgets(rows);
    } catch (err) {
      setError(typeof err === "string" ? err : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBudgets(initialMonth, initialYear);
  }, [fetchBudgets, initialMonth, initialYear]);

  const upsertBudget = useCallback(
    async (
      categoryId: number,
      month: number,
      year: number,
      plannedAmount: number
    ) => {
      await invoke<Budget>("upsert_budget", {
        categoryId,
        month,
        year,
        plannedAmount,
      });
      await fetchBudgets(month, year);
    },
    [fetchBudgets]
  );

  return {
    budgets,
    loading,
    error,
    upsertBudget,
    refresh: fetchBudgets,
  };
}
