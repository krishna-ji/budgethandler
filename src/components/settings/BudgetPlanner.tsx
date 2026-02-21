import { useCallback, useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";
import { useBudgets } from "@/hooks/useSettings";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Save } from "lucide-react";
import type { Category } from "@/types";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_MONTH = new Date().getMonth() + 1; // 1-indexed

export function BudgetPlanner() {
  const [month, setMonth] = useState(CURRENT_MONTH);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
  const [amounts, setAmounts] = useState<Record<number, number>>({});
  const [saving, setSaving] = useState(false);

  const { budgets, loading, refresh } = useBudgets(month, year);

  // Fetch expense categories once
  useEffect(() => {
    invoke<Category[]>("get_categories_by_type", { txType: "Expense" })
      .then(setExpenseCategories)
      .catch((err) => toast.error(String(err)));
  }, []);

  // Build the amounts map: merge existing budgets with all expense categories
  useEffect(() => {
    const map: Record<number, number> = {};
    // Initialize all expense categories at 0
    for (const cat of expenseCategories) {
      map[cat.id] = 0;
    }
    // Overlay existing budgets
    for (const b of budgets) {
      map[b.category_id] = b.planned_amount;
    }
    setAmounts(map);
  }, [budgets, expenseCategories]);

  const handleAmountChange = useCallback(
    (catId: number, value: string) => {
      const num = parseFloat(value) || 0;
      setAmounts((prev) => ({ ...prev, [catId]: num }));
    },
    []
  );

  // Re-fetch when month/year changes
  const handlePeriodChange = useCallback(
    (m: number, y: number) => {
      setMonth(m);
      setYear(y);
      refresh(m, y);
    },
    [refresh]
  );

  const handleSaveAll = useCallback(async () => {
    setSaving(true);
    try {
      const promises = Object.entries(amounts).map(([catId, amt]) =>
        invoke("upsert_budget", {
          categoryId: Number(catId),
          month,
          year,
          plannedAmount: amt,
        })
      );
      await Promise.all(promises);
      toast.success(`Budgets saved for ${MONTHS[month - 1]} ${year}`);
      refresh(month, year);
    } catch (err) {
      toast.error(typeof err === "string" ? err : String(err));
    } finally {
      setSaving(false);
    }
  }, [amounts, month, year, refresh]);

  // Year options: current ± 2
  const yearOptions = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - 2 + i),
    []
  );

  if (loading && expenseCategories.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-[var(--color-muted-foreground)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Period Selector ──────────────────────────────── */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="grid gap-1.5">
          <Label>Month</Label>
          <Select
            value={String(month)}
            onChange={(e) =>
              handlePeriodChange(Number(e.target.value), year)
            }
            className="w-40"
          >
            {MONTHS.map((m, i) => (
              <option key={i + 1} value={i + 1}>
                {m}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid gap-1.5">
          <Label>Year</Label>
          <Select
            value={String(year)}
            onChange={(e) =>
              handlePeriodChange(month, Number(e.target.value))
            }
            className="w-28"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>
        </div>

        <Button
          onClick={handleSaveAll}
          disabled={saving}
          className="gap-1.5"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save All Budgets
        </Button>
      </div>

      {/* ── Category Budget Grid ─────────────────────────── */}
      {expenseCategories.length === 0 ? (
        <p className="text-sm text-[var(--color-muted-foreground)]">
          No expense categories exist yet. Add some in the Categories tab first.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {expenseCategories.map((cat) => (
            <Card key={cat.id}>
              <CardContent className="flex items-center gap-3 p-4">
                <Label className="min-w-[120px] text-sm">{cat.name}</Label>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-muted-foreground)]">
                    $
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    className="pl-7"
                    value={amounts[cat.id] ?? 0}
                    onChange={(e) =>
                      handleAmountChange(cat.id, e.target.value)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
