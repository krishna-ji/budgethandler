import { useCallback, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import type {
  DashboardSummary,
  CategorySummary,
  PeriodKind,
} from "@/types";
import type { DateRange } from "react-day-picker";

// ── Date helpers ──────────────────────────────────────────────

function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function todayISO(): string {
  return toISO(new Date());
}

/** Returns [startDate, endDate] as ISO strings for the chosen preset. */
export function dateRangeFor(period: PeriodKind): [string, string] {
  const end = new Date();
  const start = new Date();

  switch (period) {
    case "weekly":
      start.setDate(end.getDate() - 6);
      break;
    case "fortnightly":
      start.setDate(end.getDate() - 13);
      break;
    case "monthly":
      start.setDate(1); // first day of current month
      break;
  }

  return [toISO(start), todayISO()];
}

// ── Hook ──────────────────────────────────────────────────────

export interface DashboardData {
  summary: DashboardSummary | null;
  expenseBreakdown: CategorySummary[];
  incomeBreakdown: CategorySummary[];
  loading: boolean;
  error: string | null;
  period: PeriodKind;
  startDate: string;
  endDate: string;
  /** Preset quick-select */
  setPeriod: (p: PeriodKind) => void;
  /** Custom date range from the calendar picker */
  customRange: DateRange | undefined;
  setCustomRange: (r: DateRange | undefined) => void;
  refresh: () => void;
}

export function useDashboard(): DashboardData {
  const [period, setPeriodRaw] = useState<PeriodKind>("monthly");
  const [customRange, setCustomRangeRaw] = useState<DateRange | undefined>(
    undefined
  );
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [expenseBreakdown, setExpenseBreakdown] = useState<CategorySummary[]>(
    []
  );
  const [incomeBreakdown, setIncomeBreakdown] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Derive effective dates: custom range takes precedence when both from & to are set
  const hasCustom = customRange?.from != null && customRange?.to != null;
  const [presetStart, presetEnd] = dateRangeFor(period);
  const startDate = hasCustom ? toISO(customRange!.from!) : presetStart;
  const endDate = hasCustom ? toISO(customRange!.to!) : presetEnd;

  // When user picks a preset, clear custom range
  const setPeriod = useCallback((p: PeriodKind) => {
    setPeriodRaw(p);
    setCustomRangeRaw(undefined);
  }, []);

  // When user picks a custom range, we keep period value but custom overrides
  const setCustomRange = useCallback((r: DateRange | undefined) => {
    setCustomRangeRaw(r);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [sum, expenses, income] = await Promise.all([
        invoke<DashboardSummary>("get_dashboard_summary", {
          startDate,
          endDate,
        }),
        invoke<CategorySummary[]>("get_category_summary", {
          startDate,
          endDate,
          txType: "Expense",
        }),
        invoke<CategorySummary[]>("get_category_summary", {
          startDate,
          endDate,
          txType: "Income",
        }),
      ]);

      setSummary(sum);
      setExpenseBreakdown(expenses);
      setIncomeBreakdown(income);
    } catch (err) {
      setError(typeof err === "string" ? err : String(err));
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    summary,
    expenseBreakdown,
    incomeBreakdown,
    loading,
    error,
    period,
    startDate,
    endDate,
    setPeriod,
    customRange,
    setCustomRange,
    refresh: fetchData,
  };
}
