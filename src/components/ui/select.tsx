import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

/* ────────────────────────────────────────────────────────────
   A lightweight, accessible <select> wrapper styled to match
   the Shadcn "new-york" aesthetic. No Radix dependency needed
   for a simple native select — keeps the bundle small.
   ──────────────────────────────────────────────────────────── */

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Optional label shown above the select */
  label?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, label, id, ...props }, ref) => {
    const selectId = id ?? React.useId();
    return (
      <div className="grid gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium leading-none text-[var(--color-foreground)]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              "flex h-9 w-full appearance-none rounded-[var(--radius)] border border-[var(--color-input)] bg-transparent px-3 py-1 pr-8 text-sm shadow-sm transition-colors",
              "focus:outline-none focus:ring-1 focus:ring-[var(--color-ring)]",
              "disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
        </div>
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
