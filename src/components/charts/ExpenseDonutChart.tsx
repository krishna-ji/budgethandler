import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { CategorySummary } from "@/types";

const COLORS = [
  "#f97316", // orange
  "#3b82f6", // blue
  "#22c55e", // green
  "#a855f7", // purple
  "#eab308", // yellow
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f43f5e", // rose
  "#6366f1", // indigo
  "#84cc16", // lime
];

interface ExpenseDonutChartProps {
  data: CategorySummary[];
}

function formatCurrency(value: number): string {
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function ExpenseDonutChart({ data }: ExpenseDonutChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[260px] items-center justify-center">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          No expense data for this period.
        </p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.category_name,
    value: d.total_amount,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
          stroke="none"
        >
          {chartData.map((_entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [formatCurrency(Number(value)), "Amount"]}
          contentStyle={{
            backgroundColor: "var(--color-popover)",
            borderColor: "var(--color-border)",
            borderRadius: "var(--radius)",
            color: "var(--color-popover-foreground)",
            fontSize: "0.875rem",
          }}
        />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: "0.75rem" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
