import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, ...props }: CalendarProps) {
  return (
    <DayPicker
      className={cn("p-0", className)}
      style={
        {
          "--rdp-accent-color": "var(--color-primary)",
          "--rdp-accent-background-color": "var(--color-primary)",
          "--rdp-day-height": "2rem",
          "--rdp-day-width": "2rem",
        } as React.CSSProperties
      }
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
