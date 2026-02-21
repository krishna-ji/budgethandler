import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { DashboardSummary } from "@/types";

interface IncomeExpenseBarChartProps {
  summary: DashboardSummary;
  /** Label shown on the single bar group (e.g. "Feb 2026") */
  periodLabel: string;
}

function formatCurrency(value: number): string {
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function IncomeExpenseBarChart({
  summary,
  periodLabel,
}: IncomeExpenseBarChartProps) {
  const data = [
    {
      period: periodLabel,
      Income: summary.total_income,
      Expense: summary.total_expense,
    },
  ];

  if (summary.total_income === 0 && summary.total_expense === 0) {
    return (
      <div className="flex h-[260px] items-center justify-center">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          No transaction data for this period.
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barGap={8}>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="var(--color-border)"
        />
        <XAxis
          dataKey="period"
          tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatCurrency}
          tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          width={70}
        />
        <Tooltip
          formatter={(value, name) => [
            formatCurrency(Number(value)),
            String(name),
          ]}
          contentStyle={{
            backgroundColor: "var(--color-popover)",
            borderColor: "var(--color-border)",
            borderRadius: "var(--radius)",
            color: "var(--color-popover-foreground)",
            fontSize: "0.875rem",
          }}
        />
        <Legend
          verticalAlign="top"
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: "0.75rem", paddingBottom: "0.5rem" }}
        />
        <Bar
          dataKey="Income"
          fill="var(--color-income)"
          radius={[4, 4, 0, 0]}
          maxBarSize={60}
        />
        <Bar
          dataKey="Expense"
          fill="var(--color-expense)"
          radius={[4, 4, 0, 0]}
          maxBarSize={60}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
