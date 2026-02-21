import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { TransactionRow } from "@/types";

interface LedgerTableProps {
  transactions: TransactionRow[];
}

/** Formats "2026-02-21" → "Feb 21, 2026" */
function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00"); // force local timezone
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(value: number): string {
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function LedgerTable({ transactions }: LedgerTableProps) {
  if (transactions.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[var(--color-muted-foreground)]">
        No transactions recorded yet. Use the form above to add one.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx) => (
          <TableRow key={tx.id}>
            <TableCell className="whitespace-nowrap">
              {formatDate(tx.date)}
            </TableCell>
            <TableCell>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                  tx.type === "Income"
                    ? "bg-[var(--color-income)]/15 text-[var(--color-income)]"
                    : "bg-[var(--color-expense)]/15 text-[var(--color-expense)]"
                )}
              >
                {tx.type}
              </span>
            </TableCell>
            <TableCell>{tx.category_name}</TableCell>
            <TableCell className="max-w-[200px] truncate text-[var(--color-muted-foreground)]">
              {tx.description || "—"}
            </TableCell>
            <TableCell
              className={cn(
                "text-right font-medium",
                tx.type === "Income"
                  ? "text-[var(--color-income)]"
                  : "text-[var(--color-expense)]"
              )}
            >
              {tx.type === "Income" ? "+" : "−"}
              {formatCurrency(tx.amount)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
