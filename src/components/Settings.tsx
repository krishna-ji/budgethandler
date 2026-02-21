import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CategoryManager } from "@/components/settings/CategoryManager";
import { BudgetPlanner } from "@/components/settings/BudgetPlanner";
import { Tags, Wallet } from "lucide-react";

export function Settings() {
  const [tab, setTab] = useState("categories");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Manage categories and configure monthly budgets.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="categories" className="gap-1.5">
            <Tags className="h-3.5 w-3.5" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="budgets" className="gap-1.5">
            <Wallet className="h-3.5 w-3.5" />
            Monthly Budgets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <CategoryManager />
        </TabsContent>

        <TabsContent value="budgets">
          <BudgetPlanner />
        </TabsContent>
      </Tabs>
    </div>
  );
}
