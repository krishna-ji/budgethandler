import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

interface DateRangePickerProps {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  className?: string;
}

export function DateRangePicker({
  value,
  onChange,
  className,
}: DateRangePickerProps) {
  const label =
    value?.from && value?.to
      ? `${format(value.from, "MMM d, yyyy")} — ${format(value.to, "MMM d, yyyy")}`
      : value?.from
        ? `${format(value.from, "MMM d, yyyy")} — …`
        : "Pick a date range";

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-[var(--radius)] border border-[var(--color-input)] bg-transparent px-3 text-sm shadow-sm transition-colors",
          "hover:bg-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-ring)]",
          !value?.from && "text-[var(--color-muted-foreground)]",
          className
        )}
      >
        <CalendarIcon className="h-4 w-4 text-[var(--color-muted-foreground)]" />
        <span className="whitespace-nowrap">{label}</span>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="end">
        <Calendar
          mode="range"
          selected={value}
          onSelect={onChange}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
