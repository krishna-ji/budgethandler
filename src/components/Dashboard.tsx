import { useDashboard } from "@/hooks/useDashboard";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { CategoryTable } from "@/components/dashboard/CategoryTable";
import { ExpenseDonutChart } from "@/components/charts/ExpenseDonutChart";
import { IncomeExpenseBarChart } from "@/components/charts/IncomeExpenseBarChart";
import { Select } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Loader2,
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";
import type { PeriodKind } from "@/types";

export function Dashboard() {
  const {
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
  } = useDashboard();

  return (
    <div className="space-y-6">
      {/* ── Toolbar ──────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            {startDate} — {endDate}
          </p>
        </div>

        <div className="flex items-end gap-3">
          <Select
            value={customRange?.from ? "" : period}
            onChange={(e) => setPeriod(e.target.value as PeriodKind)}
            className="w-44"
            label="Quick Select"
          >
            <option value="weekly">Weekly (7 days)</option>
            <option value="fortnightly">Fortnightly (14 days)</option>
            <option value="monthly">Monthly</option>
          </Select>

          <div className="grid gap-1.5">
            <span className="text-sm font-medium leading-none text-[var(--color-foreground)]">
              Custom Range
            </span>
            <DateRangePicker value={customRange} onChange={setCustomRange} />
          </div>
        </div>
      </div>

      {/* ── Error banner ─────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-2 rounded-[var(--radius)] border border-[var(--color-destructive)] bg-[var(--color-destructive)]/10 px-4 py-3 text-sm text-[var(--color-destructive)]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* ── Loading state ────────────────────────────────── */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--color-muted-foreground)]" />
        </div>
      )}

      {/* ── Metric Cards ─────────────────────────────────── */}
      {!loading && summary && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              title="Total Income"
              value={summary.total_income}
              icon={TrendingUp}
              valueClassName="text-[var(--color-income)]"
            />
            <MetricCard
              title="Total Expenses"
              value={summary.total_expense}
              icon={TrendingDown}
              valueClassName="text-[var(--color-expense)]"
            />
            <MetricCard
              title="Net Savings"
              value={summary.net_savings}
              icon={Wallet}
              valueClassName={
                summary.net_savings >= 0
                  ? "text-[var(--color-savings-positive)]"
                  : "text-[var(--color-savings-negative)]"
              }
            />
          </div>

          {/* ── Charts ─────────────────────────────────────── */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[var(--color-muted-foreground)]" />
                <CardTitle className="text-base">
                  Income vs Expense
                </CardTitle>
              </CardHeader>
              <CardContent>
                <IncomeExpenseBarChart
                  summary={summary}
                  periodLabel={`${startDate} — ${endDate}`}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <PieChartIcon className="h-4 w-4 text-[var(--color-muted-foreground)]" />
                <CardTitle className="text-base">
                  Expense Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ExpenseDonutChart data={expenseBreakdown} />
              </CardContent>
            </Card>
          </div>

          {/* ── Category Breakdown Tables ──────────────────── */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Income by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryTable data={incomeBreakdown} label="income" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Expenses by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryTable data={expenseBreakdown} label="expense" />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
