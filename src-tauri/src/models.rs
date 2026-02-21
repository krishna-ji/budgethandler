use serde::{Deserialize, Serialize};

// ── Category ────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Category {
    pub id: i64,
    pub name: String,
    #[serde(rename = "type")]
    pub category_type: String, // "Income" | "Expense"
}

#[derive(Debug, Clone, Deserialize)]
pub struct NewCategory {
    pub name: String,
    #[serde(rename = "type")]
    pub category_type: String,
}

// ── Transaction ─────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Transaction {
    pub id: i64,
    pub date: String,
    #[serde(rename = "type")]
    pub transaction_type: String, // "Income" | "Expense"
    pub category_id: i64,
    pub amount: f64,
    pub description: String,
    pub created_at: String,
}

/// Transaction joined with its category name — used for the Ledger data table.
#[derive(Debug, Clone, Serialize)]
pub struct TransactionRow {
    pub id: i64,
    pub date: String,
    #[serde(rename = "type")]
    pub transaction_type: String,
    pub category_id: i64,
    pub category_name: String,
    pub amount: f64,
    pub description: String,
    pub created_at: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct NewTransaction {
    pub date: String,
    #[serde(rename = "type")]
    pub transaction_type: String,
    pub category_id: i64,
    pub amount: f64,
    pub description: String,
}

// ── Budget ──────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Budget {
    pub id: i64,
    pub category_id: i64,
    pub planned_amount: f64,
    pub month: i32,
    pub year: i32,
}

/// Budget joined with category name — used for the Settings budget table.
#[derive(Debug, Clone, Serialize)]
pub struct BudgetRow {
    pub id: Option<i64>,
    pub category_id: i64,
    pub category_name: String,
    pub planned_amount: f64,
    pub month: i32,
    pub year: i32,
}

#[derive(Debug, Clone, Deserialize)]
pub struct NewBudget {
    pub category_id: i64,
    pub planned_amount: f64,
    pub month: i32,
    pub year: i32,
}

// ── Dashboard DTOs ──────────────────────────────────────────────

/// Top-level summary for the dashboard metric cards.
#[derive(Debug, Clone, Serialize)]
pub struct DashboardSummary {
    pub total_income: f64,
    pub total_expense: f64,
    pub net_savings: f64,
}

/// Per-category aggregate — powers the Recharts donut chart
/// and the Planned vs. Actual comparison table.
#[derive(Debug, Clone, Serialize)]
pub struct CategorySummary {
    pub category_id: i64,
    pub category_name: String,
    pub total_amount: f64,
}
