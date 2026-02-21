import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CategorySummary } from "@/types";

interface CategoryTableProps {
  data: CategorySummary[];
  label: string;
}

export function CategoryTable({ data, label }: CategoryTableProps) {
  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[var(--color-muted-foreground)]">
        No {label.toLowerCase()} data for this period.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Category</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => (
          <TableRow key={row.category_id}>
            <TableCell className="font-medium">{row.category_name}</TableCell>
            <TableCell className="text-right">
              $
              {row.total_amount.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
