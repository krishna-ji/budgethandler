import { useState } from "react";
import { Toaster } from "sonner";
import { AppShell, type AppPage } from "@/components/layout/AppShell";
import { Dashboard } from "@/components/Dashboard";
import { Ledger } from "@/components/Ledger";
import { Settings } from "@/components/Settings";

function App() {
  const [page, setPage] = useState<AppPage>("dashboard");

  return (
    <>
      <AppShell currentPage={page} onNavigate={setPage}>
        {page === "dashboard" && <Dashboard />}
        {page === "ledger" && <Ledger />}
        {page === "settings" && <Settings />}
      </AppShell>
      <Toaster
        position="bottom-right"
        richColors
        toastOptions={{
          style: {
            background: "var(--color-card)",
            color: "var(--color-card-foreground)",
            border: "1px solid var(--color-border)",
          },
        }}
      />
    </>
  );
}

export default App;
