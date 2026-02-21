import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useCategories } from "@/hooks/useSettings";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Trash2, Plus } from "lucide-react";

// ── Validation Schema ─────────────────────────────────────────

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  txType: z.enum(["Income", "Expense"], { message: "Required" }),
});

type CategoryFormValues = z.output<typeof categorySchema>;

// ── Component ─────────────────────────────────────────────────

export function CategoryManager() {
  const { categories, loading, addCategory, deleteCategory } = useCategories();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    defaultValues: { name: "", txType: "Expense" },
  });

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      await addCategory(data.name, data.txType);
      toast.success(`Category "${data.name}" added`);
      reset({ name: "", txType: data.txType });
    } catch (err) {
      toast.error(typeof err === "string" ? err : String(err));
    }
  };

  const handleDelete = async (id: number, name: string) => {
    try {
      await deleteCategory(id);
      toast.success(`Category "${name}" deleted`);
    } catch (err) {
      // Surface the Rust RESTRICT error in a user-friendly toast
      toast.error(typeof err === "string" ? err : String(err));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-[var(--color-muted-foreground)]" />
      </div>
    );
  }

  const incomeCategories = categories.filter((c) => c.type === "Income");
  const expenseCategories = categories.filter((c) => c.type === "Expense");

  return (
    <div className="space-y-6">
      {/* ── Add Form ─────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-wrap items-end gap-3"
      >
        <div className="grid gap-1.5">
          <Label htmlFor="cat-name">Name</Label>
          <Input
            id="cat-name"
            placeholder="e.g. Laundry"
            className="w-52"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-[var(--color-destructive)]">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="cat-type">Type</Label>
          <Select id="cat-type" className="w-36" {...register("txType")}>
            <option value="Expense">Expense</option>
            <option value="Income">Income</option>
          </Select>
        </div>

        <Button type="submit" disabled={isSubmitting} className="gap-1">
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Add
        </Button>
      </form>

      {/* ── Tables ───────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CategoryGroup
          title="Expense Categories"
          items={expenseCategories}
          onDelete={handleDelete}
        />
        <CategoryGroup
          title="Income Categories"
          items={incomeCategories}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

// ── Sub-component ─────────────────────────────────────────────

function CategoryGroup({
  title,
  items,
  onDelete,
}: {
  title: string;
  items: { id: number; name: string; type: string }[];
  onDelete: (id: number, name: string) => void;
}) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold text-[var(--color-foreground)]">
        {title}
      </h4>
      {items.length === 0 ? (
        <p className="text-sm text-[var(--color-muted-foreground)]">
          No categories yet.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-16 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell>{cat.name}</TableCell>
                <TableCell className="text-right">
                  <button
                    onClick={() => onDelete(cat.id, cat.name)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius)] text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-destructive)]/10 hover:text-[var(--color-destructive)]"
                    aria-label={`Delete ${cat.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
