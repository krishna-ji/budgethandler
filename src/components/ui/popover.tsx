import * as React from "react";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────────────────────
   Minimal Popover built with the native HTML <popover> API
   fallback: we use absolute positioning + a click‑outside hook.
   ──────────────────────────────────────────────────────────── */

interface PopoverContextValue {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const PopoverCtx = React.createContext<PopoverContextValue>({
  open: false,
  setOpen: () => {},
});

function Popover({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return (
    <PopoverCtx.Provider value={{ open, setOpen }}>
      <div className="relative">{children}</div>
    </PopoverCtx.Provider>
  );
}

const PopoverTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, ...props }, ref) => {
  const { open, setOpen } = React.useContext(PopoverCtx);
  return (
    <button
      ref={ref}
      type="button"
      aria-expanded={open}
      onClick={(e) => {
        setOpen((v) => !v);
        onClick?.(e);
      }}
      className={className}
      {...props}
    />
  );
});
PopoverTrigger.displayName = "PopoverTrigger";

function PopoverContent({
  className,
  children,
  align = "end",
}: {
  className?: string;
  children: React.ReactNode;
  align?: "start" | "end" | "center";
}) {
  const { open, setOpen } = React.useContext(PopoverCtx);
  const ref = React.useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.closest(".relative")?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 mt-2 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-popover)] p-4 text-[var(--color-popover-foreground)] shadow-lg outline-none",
        align === "end" && "right-0",
        align === "start" && "left-0",
        align === "center" && "left-1/2 -translate-x-1/2",
        className
      )}
    >
      {children}
    </div>
  );
}

export { Popover, PopoverTrigger, PopoverContent };
