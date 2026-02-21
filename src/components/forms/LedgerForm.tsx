import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { Category } from "@/types";

// ── Zod schema ────────────────────────────────────────────────

const ledgerSchema = z.object({
  date: z.string().min(1, "Date is required"),
  txType: z.enum(["Income", "Expense"], {
    message: "Type is required",
  }),
  categoryId: z.coerce.number().positive("Please select a category"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  description: z.string().optional().default(""),
});

type LedgerFormValues = z.output<typeof ledgerSchema>;

// ── Props ─────────────────────────────────────────────────────

interface LedgerFormProps {
  categories: Category[];
  onSubmit: (tx: {
    date: string;
    txType: "Income" | "Expense";
    categoryId: number;
    amount: number;
    description: string;
  }) => Promise<void>;
}

// ── Component ─────────────────────────────────────────────────

export function LedgerForm({ categories, onSubmit }: LedgerFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LedgerFormValues>({
    resolver: zodResolver(ledgerSchema) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      txType: "Expense",
      categoryId: 0,
      amount: 0,
      description: "",
    },
  });

  // ── Dependent dropdown: filter categories by selected type ──
  const selectedType = watch("txType");

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === selectedType),
    [categories, selectedType]
  );

  // ── Submit handler ──────────────────────────────────────────
  const onFormSubmit = async (data: LedgerFormValues) => {
    try {
      await onSubmit({
        date: data.date,
        txType: data.txType,
        categoryId: data.categoryId,
        amount: data.amount,
        description: data.description,
      });
      toast.success("Transaction logged successfully");
      reset({
        date: new Date().toISOString().slice(0, 10),
        txType: data.txType, // keep the same type selected
        categoryId: 0,
        amount: 0,
        description: "",
      });
    } catch (err) {
      toast.error(typeof err === "string" ? err : String(err));
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {/* Date */}
      <div className="grid gap-1.5">
        <Label htmlFor="date">Date</Label>
        <Input id="date" type="date" {...register("date")} />
        {errors.date && (
          <p className="text-xs text-[var(--color-destructive)]">
            {errors.date.message}
          </p>
        )}
      </div>

      {/* Type */}
      <div className="grid gap-1.5">
        <Label htmlFor="txType">Type</Label>
        <Select id="txType" {...register("txType")}>
          <option value="Expense">Expense</option>
          <option value="Income">Income</option>
        </Select>
        {errors.txType && (
          <p className="text-xs text-[var(--color-destructive)]">
            {errors.txType.message}
          </p>
        )}
      </div>

      {/* Category (dependent on Type) */}
      <div className="grid gap-1.5">
        <Label htmlFor="categoryId">Category</Label>
        <Select id="categoryId" {...register("categoryId")}>
          <option value={0} disabled>
            Select a category…
          </option>
          {filteredCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </Select>
        {errors.categoryId && (
          <p className="text-xs text-[var(--color-destructive)]">
            {errors.categoryId.message}
          </p>
        )}
      </div>

      {/* Amount */}
      <div className="grid gap-1.5">
        <Label htmlFor="amount">Amount ($)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          {...register("amount")}
        />
        {errors.amount && (
          <p className="text-xs text-[var(--color-destructive)]">
            {errors.amount.message}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="grid gap-1.5 sm:col-span-2 lg:col-span-1">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="Optional note…"
          {...register("description")}
        />
      </div>

      {/* Submit */}
      <div className="flex items-end">
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Add Transaction"
          )}
        </Button>
      </div>
    </form>
  );
}
