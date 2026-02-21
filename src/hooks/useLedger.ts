import { useCallback, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { Category, TransactionRow } from "@/types";

export interface LedgerData {
  /** All categories (used to populate dropdowns) */
  categories: Category[];
  /** Recent transactions for the ledger table */
  transactions: TransactionRow[];
  loading: boolean;
  error: string | null;
  /** Submit a new transaction to the Rust backend */
  addTransaction: (tx: {
    date: string;
    txType: "Income" | "Expense";
    categoryId: number;
    amount: number;
    description: string;
  }) => Promise<void>;
  /** Re-fetch transactions (e.g. after adding one) */
  refresh: () => void;
}

export function useLedger(): LedgerData {
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [cats, txs] = await Promise.all([
        invoke<Category[]>("get_categories"),
        invoke<TransactionRow[]>("get_transactions", {
          startDate: null,
          endDate: null,
        }),
      ]);
      setCategories(cats);
      setTransactions(txs);
    } catch (err) {
      setError(typeof err === "string" ? err : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const addTransaction = useCallback(
    async (tx: {
      date: string;
      txType: "Income" | "Expense";
      categoryId: number;
      amount: number;
      description: string;
    }) => {
      await invoke<number>("add_transaction", {
        date: tx.date,
        txType: tx.txType,
        categoryId: tx.categoryId,
        amount: tx.amount,
        description: tx.description,
      });
      // Re-fetch the transaction list after successful insert
      await fetchAll();
    },
    [fetchAll]
  );

  return {
    categories,
    transactions,
    loading,
    error,
    addTransaction,
    refresh: fetchAll,
  };
}
