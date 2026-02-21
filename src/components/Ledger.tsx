import { useLedger } from "@/hooks/useLedger";
import { LedgerForm } from "@/components/forms/LedgerForm";
import { LedgerTable } from "@/components/LedgerTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, BookOpen } from "lucide-react";

export function Ledger() {
  const { categories, transactions, loading, error, addTransaction } =
    useLedger();

  return (
    <div className="space-y-6">
      {/* ── Header ────────────────────────────────────────── */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Ledger</h2>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Record and review all hotel transactions.
        </p>
      </div>

      {/* ── Error banner ─────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-2 rounded-[var(--radius)] border border-[var(--color-destructive)] bg-[var(--color-destructive)]/10 px-4 py-3 text-sm text-[var(--color-destructive)]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* ── New Transaction Form ─────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">New Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-[var(--color-muted-foreground)]" />
            </div>
          ) : (
            <LedgerForm categories={categories} onSubmit={addTransaction} />
          )}
        </CardContent>
      </Card>

      {/* ── Recent Transactions ──────────────────────────── */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <BookOpen className="h-4 w-4 text-[var(--color-muted-foreground)]" />
          <CardTitle className="text-base">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-[var(--color-muted-foreground)]" />
            </div>
          ) : (
            <LedgerTable transactions={transactions} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
