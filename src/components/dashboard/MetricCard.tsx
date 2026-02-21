import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  /** Tailwind text color class applied to the value */
  valueClassName?: string;
  prefix?: string;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  valueClassName,
  prefix = "$",
}: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-[var(--color-muted-foreground)]">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-[var(--color-muted-foreground)]" />
      </CardHeader>
      <CardContent>
        <p className={cn("text-2xl font-bold", valueClassName)}>
          {prefix}
          {value.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </CardContent>
    </Card>
  );
}
