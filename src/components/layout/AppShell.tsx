import { useCallback, useEffect, useState } from "react";
import { Moon, Sun, Hotel, LayoutDashboard, BookOpen, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export type AppPage = "dashboard" | "ledger" | "settings";

interface AppShellProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
  children: React.ReactNode;
}

const NAV_ITEMS: { page: AppPage; label: string; icon: typeof Hotel }[] = [
  { page: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { page: "ledger", label: "Ledger", icon: BookOpen },
  { page: "settings", label: "Settings", icon: Settings },
];

export function AppShell({ currentPage, onNavigate, children }: AppShellProps) {
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  const toggleDark = useCallback(() => {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  }, []);

  // Restore theme on mount
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark =
      stored === "dark" ||
      (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", prefersDark);
    setDark(prefersDark);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
      {/* ── Top bar ──────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-card)]">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Hotel className="h-5 w-5 text-[var(--color-primary)]" />
              <span className="text-lg font-semibold tracking-tight">
                Budget Handler
              </span>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-1">
              {NAV_ITEMS.map(({ page, label, icon: Icon }) => (
                <button
                  key={page}
                  onClick={() => onNavigate(page)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-[var(--radius)] px-3 py-1.5 text-sm font-medium transition-colors",
                    currentPage === page
                      ? "bg-[var(--color-accent)] text-[var(--color-accent-foreground)]"
                      : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-foreground)]"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
          <button
            onClick={toggleDark}
            className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius)] text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-foreground)]"
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* ── Content ──────────────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
