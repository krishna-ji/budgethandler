import * as React from "react";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────────────────────
   Lightweight Tabs (no Radix dependency).
   ──────────────────────────────────────────────────────────── */

interface TabsContextValue {
  value: string;
  onValueChange: (v: string) => void;
}

const TabsCtx = React.createContext<TabsContextValue>({
  value: "",
  onValueChange: () => {},
});

function Tabs({
  value,
  onValueChange,
  children,
  className,
}: {
  value: string;
  onValueChange: (v: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <TabsCtx.Provider value={{ value, onValueChange }}>
      <div className={className}>{children}</div>
    </TabsCtx.Provider>
  );
}

function TabsList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex h-9 items-center gap-1 rounded-[var(--radius)] bg-[var(--color-muted)] p-1",
        className
      )}
    >
      {children}
    </div>
  );
}

function TabsTrigger({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = React.useContext(TabsCtx);
  const isActive = ctx.value === value;
  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => ctx.onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-[calc(var(--radius)-2px)] px-3 py-1 text-sm font-medium transition-colors",
        isActive
          ? "bg-[var(--color-background)] text-[var(--color-foreground)] shadow-sm"
          : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]",
        className
      )}
    >
      {children}
    </button>
  );
}

function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = React.useContext(TabsCtx);
  if (ctx.value !== value) return null;
  return <div className={cn("mt-4", className)}>{children}</div>;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
